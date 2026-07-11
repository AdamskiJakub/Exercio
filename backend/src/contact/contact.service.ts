import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';
import { buildContactEmailTemplate } from '../email/email-templates';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async create(dto: CreateContactMessageDto) {
    // Save to database
    const message = await this.prisma.contactMessage.create({
      data: {
        name: dto.name,
        email: dto.email,
        category: dto.category,
        message: dto.message,
      },
    });

    this.logger.log(`Contact message saved: ${message.id}`);

    // Send email notification to admin
    try {
      const html = buildContactEmailTemplate({
        name: dto.name,
        email: dto.email,
        category: dto.category,
        message: dto.message,
      });

      await this.emailService.sendRawEmail(
        'burguntowy@gmail.com',
        `[Exercio] Nowa wiadomość kontaktowa - ${dto.category}`,
        html,
      );

      this.logger.log(
        `Contact notification email sent for message: ${message.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send contact notification email: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      // Don't throw - the message is already saved
    }

    return { id: message.id };
  }
}
