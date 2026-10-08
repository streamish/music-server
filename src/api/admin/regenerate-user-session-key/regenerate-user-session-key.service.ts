import { AccountEntity } from 'src/database/entities';
import { ErrorCodes } from 'src/constants/error-codes';
import { Guid } from 'typescript-guid';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class AdminRegenerateUserSessionKeyService {
  constructor(
    @InjectModel(AccountEntity)
    private readonly accountEntity: typeof AccountEntity,
  ) {}

  async regenerateSessionKey(accountId: number): Promise<void> {
    const account = await this.accountEntity.findByPk(accountId);
    if (!account) {
      throw new NotFoundException(ErrorCodes.ACCOUNT_NOT_FOUND_ERROR);
    }
    await this.accountEntity.update(
      {
        sessionKey: Guid.create(),
      },
      { where: { id: accountId } },
    );
  }
}
