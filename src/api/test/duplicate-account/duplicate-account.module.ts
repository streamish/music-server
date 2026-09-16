import { AccountEntity, AlbumEntity, FileEntity, RootPathEntity } from 'src/database/entities';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TestDuplicateAccountController } from './duplicate-account.controller';
import { TestDuplicateAccountService } from './duplicate-account.service';

@Module({
  imports: [SequelizeModule.forFeature([AccountEntity, AlbumEntity, FileEntity, RootPathEntity])],
  controllers: [TestDuplicateAccountController],
  providers: [TestDuplicateAccountService],
})
export class TestDuplicateAccountModule {}
