import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Get()
  async search(
    @Query('q') q?: string,
    @Query('city') city?: string,
    @Query('tags') tags?: string | string[],
    @Query('type') type?: 'all' | 'instructors' | 'enterprises',
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
      type: type || 'all',
      page: parseNumeric(page),
      limit: parseNumeric(limit),
    });
  }
}
