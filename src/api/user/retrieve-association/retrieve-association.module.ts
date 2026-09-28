import { LibraryModule } from 'src/library/library.module';
import { Module } from '@nestjs/common';
import { UserRetrieveAssociationController } from './retrieve-association.controller';
import { UserRetrieveAssociationService } from './retrieve-association.service';

@Module({
  imports: [LibraryModule],
  controllers: [UserRetrieveAssociationController],
  providers: [UserRetrieveAssociationService],
})
export class UserRetrieveAssociationModule {}
