import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ContactService } from './contact.service';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  /**
   * POST /contact
   * Submit a contact form message
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { ttl: 60000, limit: 5 } }) // 5 requests per minute
  async create(@Body() dto: CreateContactMessageDto) {
    return this.contactService.create(dto);
  }
}
