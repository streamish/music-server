import { AccountEntity } from 'src/database/entities/account.entity';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable } from '@nestjs/common';
import { TestCreateAccountBodyDto } from './create-account.dto';

@Injectable()
export class TestCreateAccountService {
  constructor(@InjectModel(AccountEntity) private readonly accountEntity: typeof AccountEntity) {}

  async createAccount(data: TestCreateAccountBodyDto): Promise<AccountEntity> {
    return this.accountEntity.create({
      username: data.username,
      password: data.password,
      roles: data.roles,
    } as unknown as AccountEntity);
  }
}
