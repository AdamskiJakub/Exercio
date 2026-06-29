import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto, CreateGuestReviewDto } from './dto/create-review.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  /**
   * POST /reviews
   * Create a review (authenticated client only).
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  async createReview(@Request() req, @Body() dto: CreateReviewDto) {
    return this.reviewsService.createReview(req.user.id, dto);
  }

  /**
   * POST /reviews/guest
   * Create a review via single-use token (guest user, no auth required).
   * Rate limited to prevent brute force.
   */
  @Throttle({ default: { limit: 5, ttl: 600000 } }) // 5 requests per 10 min
  @Post('guest')
  async createGuestReview(@Body() dto: CreateGuestReviewDto) {
    return this.reviewsService.createGuestReview(dto);
  }

  /**
   * GET /reviews/instructor/:id
   * Get paginated reviews for an instructor's profile (public).
   * @param page - page number (default: 1)
   * @param limit - reviews per page (default: 10, max: 50)
   */
  @Get('instructor/:id')
  async getInstructorReviews(
    @Param('id') instructorProfileId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? Math.max(1, parseInt(page, 10) || 1) : 1;
    const limitNum = limit
      ? Math.min(50, Math.max(1, parseInt(limit, 10) || 10))
      : 10;
    return this.reviewsService.getInstructorReviews(
      instructorProfileId,
      pageNum,
      limitNum,
    );
  }

  /**
   * GET /reviews/instructor/:id/stats
   * Get review statistics for an instructor profile (public).
   */
  @Get('instructor/:id/stats')
  async getInstructorReviewStats(@Param('id') instructorProfileId: string) {
    return this.reviewsService.getInstructorReviewStats(instructorProfileId);
  }

  /**
   * GET /reviews/my-pending
   * Get pending reviews for the current user (JWT required).
   */
  @UseGuards(JwtAuthGuard)
  @Get('my-pending')
  async getPendingReviews(@Request() req) {
    return this.reviewsService.getPendingReviews(req.user.id);
  }

  /**
   * POST /reviews/generate-token
   * Generate a review token for a completed booking (JWT required).
   * Used to send review invitation emails.
   */
  @UseGuards(JwtAuthGuard)
  @Post('generate-token')
  async generateReviewToken(
    @Request() req,
    @Body('bookingId') bookingId: string,
  ) {
    if (!bookingId) {
      throw new BadRequestException('bookingId is required');
    }
    return this.reviewsService.generateReviewToken(bookingId);
  }

  /**
   * GET /reviews/validate-token
   * Validate a review token without consuming it (no auth required).
   */
  @Get('validate-token')
  async validateReviewToken(
    @Query('bookingId') bookingId: string,
    @Query('token') token: string,
  ) {
    if (!bookingId || !token) {
      throw new BadRequestException('bookingId and token are required');
    }
    const isValid = await this.reviewsService.validateReviewToken(
      bookingId,
      token,
    );
    return { valid: isValid };
  }
}
