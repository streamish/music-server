import { ApiAlbumsController } from './albums.controller';
import { ApiAlbumsService } from './albums.service';
import { LibraryModule } from 'src/library/library.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [LibraryModule],
  controllers: [ApiAlbumsController],
  providers: [ApiAlbumsService],
})
export class ApiAlbumsModule {}
