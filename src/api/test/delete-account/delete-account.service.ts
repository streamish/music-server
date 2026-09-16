import { AccountEntity } from 'src/database/entities';
import { ErrorCodes } from 'src/constants/error-codes';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TestDeleteAccountService {
  constructor(
    @InjectModel(AccountEntity)
    private readonly accountEntity: typeof AccountEntity,
  ) {}

  async deleteAccount(accountId: number): Promise<void> {
    const account = await this.accountEntity.findOne({ where: { id: accountId } });
    if (!account) {
      throw new Error(ErrorCodes.ACCOUNT_NOT_FOUND_ERROR);
    }
    await account.destroy();
  }
}
