import { AccountEntity } from 'src/database/entities';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TestDeleteAccountController } from './delete-account.controller';
import { TestDeleteAccountService } from './delete-account.service';

@Module({
  imports: [SequelizeModule.forFeature([AccountEntity])],
  controllers: [TestDeleteAccountController],
  providers: [TestDeleteAccountService],
})
export class TestDeleteAccountModule {}
