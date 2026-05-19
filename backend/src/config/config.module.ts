import { Module } from '@nestjs/common';
import { ConfigController } from './config.controller';
import { StaticConfigService } from './config.service';

@Module({
  controllers: [ConfigController],
  providers: [StaticConfigService],
  exports: [StaticConfigService],
})
export class StaticConfigModule {}
