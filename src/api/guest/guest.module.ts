import { GuestCreateSessionModule } from './create-session/create-session.module';
import { GuestHealthcheckModule } from './healthcheck/healthcheck.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [GuestCreateSessionModule, GuestHealthcheckModule],
})
export class GuestModule {}
