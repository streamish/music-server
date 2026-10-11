import { AccountEntity, RootPathEntity } from 'src/database/entities';
import { ApiRootPathsController } from './root-paths.controller';
import { ApiRootPathsService } from './root-paths.service';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [SequelizeModule.forFeature([AccountEntity, RootPathEntity])],
  controllers: [ApiRootPathsController],
  providers: [ApiRootPathsService],
})
export class ApiRootPathsModule {}
