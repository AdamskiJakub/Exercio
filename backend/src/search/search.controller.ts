import { Controller, Get, Param, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Get()
  async search(
    @Query('q') q?: string,
    @Query('city') city?: string,
    @Query('tags') tags?: string | string[],
    @Query('specializations') specializations?: string | string[],
    @Query('disciplines') disciplines?: string | string[],
    @Query('type') type?: 'all' | 'instructors' | 'enterprises',
    @Query('sortBy') sortBy?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const parseNumeric = (value?: string): number | undefined => {
      if (!value) return undefined;
      const parsed = parseInt(value, 10);
      return Number.isFinite(parsed) ? parsed : undefined;
    };

    return this.searchService.search({
      q,
      city,
      tags: Array.isArray(tags) ? tags : tags ? [tags] : undefined,
      specializations: Array.isArray(specializations)
        ? specializations
        : specializations
          ? [specializations]
          : undefined,
      disciplines: Array.isArray(disciplines)
        ? disciplines
        : disciplines
          ? [disciplines]
          : undefined,
      type: type || 'all',
      sortBy,
      page: parseNumeric(page),
      limit: parseNumeric(limit),
    });
  }

  @Get('cities')
  async getCities(@Query('q') q?: string) {
    return this.searchService.getCities(q);
  }

  @Get('sitemap')
  async getSitemapData() {
    return this.searchService.getSitemapData();
  }

  @Get('disciplines/:slug/cities')
  async getDisciplineCities(@Param('slug') slug: string) {
    return this.searchService.getDisciplineCities(slug);
  }
}
