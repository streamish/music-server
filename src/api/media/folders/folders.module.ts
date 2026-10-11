import { ApiFoldersController } from './folders.controller';
import { ApiFoldersService } from './folders.service';
import { LibraryModule } from 'src/library/library.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [LibraryModule],
  controllers: [ApiFoldersController],
  providers: [ApiFoldersService],
})
export class ApiFoldersModule {}
