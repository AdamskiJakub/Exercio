import { Controller, Post, Body, Logger } from '@nestjs/common';
import { OGPreviewService } from './og-preview.service';

@Controller('og-preview')
export class OGPreviewController {
  private readonly logger = new Logger(OGPreviewController.name);

  constructor(private readonly ogPreviewService: OGPreviewService) {}

  @Post()
  async getPreview(@Body('url') url: string) {
    if (!url || typeof url !== 'string') {
      return { success: false };
    }

    try {
      new URL(url);
    } catch {
      return { success: false };
    }

    return this.ogPreviewService.getPreview(url);
  }
}
