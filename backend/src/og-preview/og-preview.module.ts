import { Module } from '@nestjs/common';
import { OGPreviewController } from './og-preview.controller';
import { OGPreviewService } from './og-preview.service';

@Module({
  controllers: [OGPreviewController],
  providers: [OGPreviewService],
  exports: [OGPreviewService],
})
export class OGPreviewModule {}
