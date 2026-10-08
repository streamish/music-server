import { AccountEntity } from 'src/database/entities/account.entity';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable } from '@nestjs/common';
import { TestListAccountDto } from './list-accounts.dto';

@Injectable()
export class TestListAccountsService {
  constructor(@InjectModel(AccountEntity) private readonly accountEntity: typeof AccountEntity) {}

  async listAccounts(): Promise<TestListAccountDto[]> {
    const accounts = await this.accountEntity.findAll();
    return accounts.map((account) => {
      return {
        id: account.id,
        username: account.username,
        roles: account.roles,
      };
    });
  }
}
