import { ApiHealthcheckController } from './healthcheck.controller';
import { Module } from '@nestjs/common';

@Module({
  controllers: [ApiHealthcheckController],
})
export class ApiHealthcheckModule {}
