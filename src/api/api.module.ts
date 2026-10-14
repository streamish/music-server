import { ApiAccountsModule } from './accounts/accounts.module';
import { ApiAlbumsModule } from './media/albums/albums.module';
import { ApiCompatibilityModule } from './compatibility/compatibility.module';
import { ApiHealthcheckModule } from './healthcheck/healthcheck.module';
import { ApiIndexerModule } from './indexer/indexer.module';
import { ApiMediaModule } from './media/media.module';
import { ApiRootPathsModule } from './root-paths/root-paths.module';
import { ApiSessionsModule } from './sessions/sessions.module';
import { ApiShoutcastModule } from './shoutcast/shoutcast.module';
import { ApiTestModule } from './test/test.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    ApiAccountsModule,
    ApiCompatibilityModule,
    ApiAlbumsModule,
    ApiHealthcheckModule,
    ApiIndexerModule,
    ApiMediaModule,
    ApiRootPathsModule,
    ApiSessionsModule,
    ApiShoutcastModule,
    /**
     * Helper endpoints for test suites
     */
    ...(process.env.NODE_ENV === 'test' ? [ApiTestModule] : []),
  ],
})
export class ApiModule {}
