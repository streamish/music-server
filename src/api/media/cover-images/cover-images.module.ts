import { ApiCoverImageController } from './cover-images.controller';
import { ApiCoverImageService } from './cover-images.service';
import { CoverImagesModule } from 'src/cover-images/cover-images.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [CoverImagesModule],
  controllers: [ApiCoverImageController],
  providers: [ApiCoverImageService],
  exports: [ApiCoverImageService],
})
export class ApiCoverImageModule {}
