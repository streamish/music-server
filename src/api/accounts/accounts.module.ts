import { AccountEntity } from 'src/database/entities';
import { ApiAccountsController } from './accounts.controller';
import { ApiAccountsService } from './accounts.service';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [SequelizeModule.forFeature([AccountEntity])],
  controllers: [ApiAccountsController],
  providers: [ApiAccountsService],
})
export class ApiAccountsModule {}
