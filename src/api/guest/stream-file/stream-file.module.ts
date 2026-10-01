import { GuestStreamFileController } from './stream-file.controller';
import { GuestStreamFileService } from './stream-file.service';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize/dist/sequelize.module';
import { TrackEntity } from 'src/database/entities';

@Module({
  imports: [SequelizeModule.forFeature([TrackEntity])],
  controllers: [GuestStreamFileController],
  providers: [GuestStreamFileService],
})
export class GuestStreamFileModule {}
