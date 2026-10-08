import { AccountEntity } from 'src/database/entities/account.entity';
import { AuthenticationService } from 'src/authentication/authentication.service';
import { Guid } from 'typescript-guid';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable } from '@nestjs/common';
import { TestCreateAccountBodyDto } from './create-account.dto';

@Injectable()
export class TestCreateAccountService {
  constructor(
    @InjectModel(AccountEntity) private readonly accountEntity: typeof AccountEntity,
    private readonly authenticationService: AuthenticationService,
  ) {}

  async createAccount(data: TestCreateAccountBodyDto): Promise<AccountEntity> {
    const passwordHash = await this.authenticationService.generatePasswordHash(data.password);
    return this.accountEntity.create({
      username: data.username,
      passwordHash,
      roles: data.roles,
      sessionKey: Guid.create(),
    } as AccountEntity);
  }
}
