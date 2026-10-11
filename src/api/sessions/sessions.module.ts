import { AccountEntity, SessionEntity, SystemConfigurationEntity } from 'src/database/entities';
import { ApiSessionsController } from './sessions.controller';
import { ApiSessionsService } from './sessions.service';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [SequelizeModule.forFeature([AccountEntity, SessionEntity, SystemConfigurationEntity])],
  controllers: [ApiSessionsController],
  providers: [ApiSessionsService],
})
export class ApiSessionsModule {}
