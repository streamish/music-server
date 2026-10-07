import { AccountEntity } from 'src/database/entities/account.entity';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { TestCreateAccountController } from './create-account.controller';
import { TestCreateAccountService } from './create-account.service';

@Module({
  imports: [SequelizeModule.forFeature([AccountEntity])],
  controllers: [TestCreateAccountController],
  providers: [TestCreateAccountService],
})
export class TestCreateAccountModule {}
