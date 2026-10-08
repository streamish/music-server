import { AccountEntity } from 'src/database/entities/account.entity';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TestListAccountsController } from './list-accounts.controller';
import { TestListAccountsService } from './list-accounts.service';

@Module({
  imports: [SequelizeModule.forFeature([AccountEntity])],
  controllers: [TestListAccountsController],
  providers: [TestListAccountsService],
})
export class TestListAccountsModule {}
