import { AccountEntity } from 'src/database/entities/account.entity';
import { ErrorCodes } from 'src/constants/error-codes';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable, NotFoundException } from '@nestjs/common';
import { TestRetrieveAccountDto } from './retrieve-account.dto';

@Injectable()
export class TestRetrieveAccountService {
  constructor(@InjectModel(AccountEntity) private readonly accountEntity: typeof AccountEntity) {}

  async retrieveAccount(username: string): Promise<TestRetrieveAccountDto> {
    const account = await this.accountEntity.findOne({
      where: {
        username,
      },
    });
    if (!account?.id) {
      throw new NotFoundException(ErrorCodes.ACCOUNT_NOT_FOUND_ERROR);
    }
    return {
      id: account.id,
      username: account.username,
      roles: account.roles,
    };
  }
}
