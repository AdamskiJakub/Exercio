import { Controller, Get, Param } from '@nestjs/common';
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

  @Get('disciplines/:key')
  getDiscipline(@Param('key') key: string) {
    return this.catalogService.getDisciplineByKey(key);
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
