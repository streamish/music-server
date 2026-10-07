import { Module } from '@nestjs/common';
import { TestCreateAccountModule } from './create-account/create-account.module';
import { TestDeleteAccountModule } from './delete-account/delete-account.module';
import { TestDuplicateAccountModule } from './duplicate-account/duplicate-account.module';
import { TestListAccountsModule } from './list-accounts/list-accounts.module';
import { TestRetrieveAccountModule } from './retrieve-account/retrieve-account.module';

@Module({
  imports: [
    TestCreateAccountModule,
    TestDuplicateAccountModule,
    TestDeleteAccountModule,
    TestListAccountsModule,
    TestRetrieveAccountModule,
  ],
})
export class TestModule {}
