import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from '../session/entities/session.entity';
import { PluginsController } from './plugins.controller';
import { PluginsService } from './plugins.service';

@Module({
  imports: [TypeOrmModule.forFeature([Session], 'data')],
  controllers: [PluginsController],
  providers: [PluginsService],
  exports: [PluginsService],
})
export class PluginsApiModule {}

