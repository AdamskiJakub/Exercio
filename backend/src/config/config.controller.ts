import { Controller, Get } from '@nestjs/common';
import { StaticConfigService } from './config.service';

@Controller('config')
export class ConfigController {
  constructor(private readonly configService: StaticConfigService) {}

  @Get('tags')
  getTags() {
    return this.configService.getAllTags();
  }

  @Get('specializations')
  getSpecializations() {
    return this.configService.getAllSpecializations();
  }

  @Get('goals')
  getGoals() {
    return this.configService.getAllGoals();
  }
}