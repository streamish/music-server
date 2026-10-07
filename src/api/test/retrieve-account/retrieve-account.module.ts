import { AccountEntity } from 'src/database/entities/account.entity';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TestRetrieveAccountController } from './retrieve-account.controller';
import { TestRetrieveAccountService } from './retrieve-account.service';

@Module({
  imports: [SequelizeModule.forFeature([AccountEntity])],
  controllers: [TestRetrieveAccountController],
  providers: [TestRetrieveAccountService],
})
export class TestRetrieveAccountModule {}
