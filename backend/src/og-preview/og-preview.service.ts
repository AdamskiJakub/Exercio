import { Injectable, Logger } from '@nestjs/common';
import og from 'open-graph-scraper';

export interface OGPreviewResult {
  success: boolean;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  favicon?: string;
  url?: string;
}

@Injectable()
export class OGPreviewService {
  private readonly logger = new Logger(OGPreviewService.name);

  async getPreview(url: string): Promise<OGPreviewResult> {
    try {
      const result = await og({ url });

      if (!result.result) {
        return { success: false };
      }

      const { ogTitle, ogDescription, ogImage, ogSiteName, favicon, ogUrl } =
        result.result;

      return {
        success: true,
        title: ogTitle || undefined,
        description: ogDescription || undefined,
        image: ogImage?.[0]?.url || undefined,
        siteName: ogSiteName || undefined,
        favicon: favicon || undefined,
        url: ogUrl || url,
      };
    } catch (error) {
      this.logger.warn(
        `OG preview failed for ${url}: ${(error as Error).message}`,
      );
      return { success: false };
    }
  }
}
