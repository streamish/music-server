import { ApiAssociationsController } from './associations.controller';
import { ApiAssociationsService } from './associations.service';
import { LibraryModule } from 'src/library/library.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [LibraryModule],
  controllers: [ApiAssociationsController],
  providers: [ApiAssociationsService],
})
export class ApiAssociationsModule {}
