import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import { CatalogService } from './catalog.service';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  getAll() {
    return this.catalogService.getAll();
  }

  @Get('disciplines')
  getDisciplines() {
    return this.catalogService.getDisciplines();
  }

  @Get('disciplines/by-slug/:slug')
  getDisciplineBySlug(
    @Param('slug') slug: string,
    @Query('locale') locale: string = 'pl',
  ) {
    const discipline = this.catalogService.getDisciplineBySlug(
      slug,
      locale as 'pl' | 'en',
    );
    if (!discipline) {
      throw new NotFoundException(
        `Discipline with slug "${slug}" not found for locale "${locale}"`,
      );
    }
    return discipline;
  }

  @Get('disciplines/:key')
  getDiscipline(@Param('key') key: string) {
    const discipline = this.catalogService.getDisciplineByKey(key);
    if (!discipline) {
      throw new NotFoundException(`Discipline with key "${key}" not found`);
    }
    return discipline;
  }

  @Get('categories')
  getCategories() {
    return this.catalogService.getCategories();
  }

  @Get('tags')
  getTags() {
    return this.catalogService.getTags();
  }

  @Get('goals')
  getGoals() {
    return this.catalogService.getGoals();
  }
}
