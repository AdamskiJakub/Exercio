import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto, CreateGuestReviewDto } from './dto/create-review.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a review for an authenticated user (registered client).
   */
  async createReview(userId: string, dto: CreateReviewDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: dto.bookingId },
      include: { review: true },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.clientId !== userId) {
      throw new ForbiddenException('You can only review your own bookings');
    }

    if (booking.status !== 'COMPLETED') {
      throw new BadRequestException('Only completed bookings can be reviewed');
    }

    if (booking.review) {
      throw new BadRequestException('This booking has already been reviewed');
    }

    // Validate comment requirement for low ratings
    if (dto.rating <= 3 && !dto.comment) {
      throw new BadRequestException(
        'Comment is required for ratings of 3 stars or less',
      );
    }

    return this.prisma.review.create({
      data: {
        bookingId: dto.bookingId,
        userId,
        rating: dto.rating,
        comment: dto.comment,
        lowRatingReason: dto.rating <= 3 ? dto.lowRatingReason : null,
        isGuestReview: false,
      },
      include: {
        booking: {
          select: {
            id: true,
            status: true,
            startTime: true,
          },
        },
      },
    });
  }

  /**
   * Create a review via single-use token (guest user).
   */
  async createGuestReview(dto: CreateGuestReviewDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: dto.bookingId },
      include: { review: true },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status !== 'COMPLETED') {
      throw new BadRequestException('Only completed bookings can be reviewed');
    }

    if (booking.review) {
      throw new BadRequestException('This booking has already been reviewed');
    }

    // Validate the review token
    const isValid = await this.validateReviewToken(dto.bookingId, dto.token);
    if (!isValid) {
      throw new BadRequestException('Invalid or expired review token');
    }

    // Validate comment requirement for low ratings
    if (dto.rating <= 3 && !dto.comment) {
      throw new BadRequestException(
        'Comment is required for ratings of 3 stars or less',
      );
    }

    // Create the review and consume the token on the booking
    const review = await this.prisma.review.create({
      data: {
        bookingId: dto.bookingId,
        userId: null,
        rating: dto.rating,
        comment: dto.comment,
        lowRatingReason: dto.rating <= 3 ? dto.lowRatingReason : null,
        isGuestReview: true,
      },
    });

    // Consume the review token on the booking
    await this.prisma.booking.update({
      where: { id: dto.bookingId },
      data: {
        reviewToken: null,
        reviewTokenExpiresAt: null,
      },
    });

    return review;
  }

  /**
   * Generate a single-use review token for a completed booking.
   * Stores the token on the Booking record (not a placeholder Review).
   * Used for both registered users (email link) and guest users.
   */
  async generateReviewToken(bookingId: string): Promise<{
    token: string;
    expiresAt: Date;
  }> {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { review: true },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status !== 'COMPLETED') {
      throw new BadRequestException(
        'Can only generate review tokens for completed bookings',
      );
    }

    if (booking.review) {
      throw new BadRequestException('This booking has already been reviewed');
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    // Store the token on the Booking record (not a placeholder Review)
    await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        reviewToken: token,
        reviewTokenExpiresAt: expiresAt,
      },
    });

    return { token, expiresAt };
  }

  /**
   * Validate a review token without consuming it.
   * Queries the bookings table where the token is stored.
   */
  async validateReviewToken(
    bookingId: string,
    token: string,
  ): Promise<boolean> {
    const booking = await this.prisma.booking.findFirst({
      where: {
        id: bookingId,
        reviewToken: token,
        reviewTokenExpiresAt: { gt: new Date() },
      },
    });

    return !!booking;
  }

  /**
   * Get all reviews for an instructor's profile.
   */
  async getInstructorReviews(instructorProfileId: string) {
    // First find the instructor's user ID
    const profile = await this.prisma.instructorProfile.findUnique({
      where: { id: instructorProfileId },
      select: { userId: true },
    });

    if (!profile) {
      throw new NotFoundException('Instructor profile not found');
    }

    const reviews = await this.prisma.review.findMany({
      where: {
        booking: {
          instructorId: profile.userId,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        booking: {
          select: {
            id: true,
            startTime: true,
            service: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Map guest reviews to show "Verified Client" instead of user data
    return reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      lowRatingReason: review.lowRatingReason,
      createdAt: review.createdAt,
      isGuestReview: review.isGuestReview,
      author: review.isGuestReview
        ? { displayName: 'Zweryfikowany klient', avatarUrl: null }
        : {
            displayName: review.user
              ? `${review.user.firstName || ''} ${review.user.lastName || ''}`.trim() ||
                'Klient'
              : 'Klient',
            avatarUrl: review.user?.avatarUrl,
          },
      serviceName: review.booking?.service?.name || null,
      bookingDate: review.booking?.startTime,
    }));
  }

  /**
   * Get pending reviews for the current user (completed bookings without review).
   */
  async getPendingReviews(userId: string) {
    const bookings = await this.prisma.booking.findMany({
      where: {
        clientId: userId,
        status: 'COMPLETED',
        review: null,
      },
      include: {
        instructorUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            instructorProfile: {
              select: {
                id: true,
              },
            },
          },
        },
        service: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return bookings.map((booking) => ({
      bookingId: booking.id,
      startTime: booking.startTime,
      endTime: booking.endTime,
      createdAt: booking.updatedAt,
      instructorName:
        `${booking.instructorUser.firstName || ''} ${booking.instructorUser.lastName || ''}`.trim(),
      instructorAvatar: booking.instructorUser.avatarUrl,
      instructorProfileId: booking.instructorUser.instructorProfile?.id,
      serviceName: booking.service?.name || null,
    }));
  }

  /**
   * Get review statistics for an instructor profile.
   * Returns average rating (null if < 5 reviews) and count.
   */
  async getInstructorReviewStats(instructorProfileId: string) {
    const profile = await this.prisma.instructorProfile.findUnique({
      where: { id: instructorProfileId },
      select: { userId: true },
    });

    if (!profile) {
      throw new NotFoundException('Instructor profile not found');
    }

    const result = await this.prisma.review.aggregate({
      where: {
        booking: {
          instructorId: profile.userId,
        },
      },
      _avg: {
        rating: true,
      },
      _count: true,
    });

    const reviewCount = result._count;
    const averageRating = result._avg.rating;

    return {
      averageRating: reviewCount >= 5 ? averageRating : null,
      reviewCount,
      ratingLabel:
        reviewCount === 0
          ? 'New Trainer'
          : reviewCount < 5
            ? `${reviewCount} reviews collected`
            : null,
    };
  }
}
