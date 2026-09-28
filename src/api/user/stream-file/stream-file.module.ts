import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize/dist/sequelize.module';
import { TrackEntity } from 'src/database/entities';
import { UserStreamFileController } from './stream-file.controller';
import { UserStreamFileService } from './stream-file.service';

@Module({
  imports: [SequelizeModule.forFeature([TrackEntity])],
  controllers: [UserStreamFileController],
  providers: [UserStreamFileService],
})
export class UserStreamFileModule {}
