import { Module } from '@nestjs/common';
import { TestListAccountsController } from './list-accounts.controller';
import { TestListAccountsService } from './list-accounts.service';

@Module({
  imports: [SequelizeModule.forFeature([AccountEntity])],
  controllers: [TestListAccountsController],
  providers: [TestListAccountsService],
})
export class TestListAccountsModule {}
