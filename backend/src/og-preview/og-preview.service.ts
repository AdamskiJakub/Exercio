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
      const result = await og({
        url,
        fetchOptions: {
          headers: {
            'Accept-Language': 'pl-PL,pl;q=0.9,en;q=0.8',
          },
        },
      });

      if (!result.result) {
        return { success: false };
      }

      const { ogTitle, ogDescription, ogImage, ogSiteName, favicon, ogUrl } =
        result.result;

      const isInstagram = /instagram\.com/i.test(url);

      const description = isInstagram
        ? this.extractInstagramCaption(ogTitle, ogDescription)
        : (this.extractFacebookEventDescription(url, result.html) ??
          ogDescription);

      return {
        success: true,
        title: ogTitle || undefined,
        // Instagram serves huge, low-quality preview images; require a manual
        // upload so the image goes through our crop/compress pipeline.
        image: isInstagram ? undefined : ogImage?.[0]?.url || undefined,
        siteName: ogSiteName || undefined,
        favicon: favicon || undefined,
        url: ogUrl || url,
        description: description || undefined,
      };
    } catch (error) {
      this.logger.warn(
        `OG preview failed for ${url}: ${(error as Error).message}`,
      );
      return { success: false };
    }
  }

  private extractFacebookEventDescription(
    url: string,
    html?: string,
  ): string | null {
    if (!html || !/facebook\.com\/events\//i.test(url)) {
      return null;
    }
    const match = html.match(
      /"event_description":\{"text":"((?:[^"\\]|\\.)*)"/,
    );
    if (!match) {
      return null;
    }
    try {
      return JSON.parse(`"${match[1]}"`) as string;
    } catch {
      return null;
    }
  }

  private extractInstagramCaption(
    ogTitle?: string,
    ogDescription?: string,
  ): string | null {
    const source = ogTitle || ogDescription || '';
    const match = source.match(/:\s*"([\s\S]*)"\s*$/);
    if (match) {
      return match[1].trim();
    }
    const first = source.indexOf('"');
    const last = source.lastIndexOf('"');
    if (first !== -1 && last > first) {
      return source.slice(first + 1, last).trim();
    }
    return source.trim() || null;
  }
}
