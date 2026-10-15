import { ApiAccountsModule } from './accounts/accounts.module';
import { ApiAlbumsModule } from './media/albums/albums.module';
import { ApiCompatibilityModule } from './compatibility/compatibility.module';
import { ApiCustomDataModule } from './custom-data/custom-data.module';
import { ApiFavoritesModule } from './favorites/favorites.module';
import { ApiHealthcheckModule } from './healthcheck/healthcheck.module';
import { ApiIndexerModule } from './indexer/indexer.module';
import { ApiMediaModule } from './media/media.module';
import { ApiRatingsModule } from './ratings/ratings.module';
import { ApiRootPathsModule } from './root-paths/root-paths.module';
import { ApiSessionsModule } from './sessions/sessions.module';
import { ApiShoutcastModule } from './shoutcast/shoutcast.module';
import { ApiTestModule } from './test/test.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    ApiAccountsModule,
    ApiAlbumsModule,
    ApiCustomDataModule,
    ApiFavoritesModule,
    ApiHealthcheckModule,
    ApiIndexerModule,
    ApiMediaModule,
    ApiRatingsModule,
    ApiRootPathsModule,
    ApiSessionsModule,
    ApiShoutcastModule,
    /**
     * Compatibility endpoints for different APIs
     */
    ApiCompatibilityModule,
    /**
     * Helper endpoints for test suites
     */
    ...(process.env.NODE_ENV === 'test' ? [ApiTestModule] : []),
  ],
})
export class ApiModule {}
