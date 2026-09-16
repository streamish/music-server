import { Module } from '@nestjs/common';
import { TestDeleteAccountModule } from './delete-account/delete-account.module';
import { TestDuplicateAccountModule } from './duplicate-account/duplicate-account.module';

@Module({
  imports: [TestDuplicateAccountModule, TestDeleteAccountModule],
})
export class TestModule {}
