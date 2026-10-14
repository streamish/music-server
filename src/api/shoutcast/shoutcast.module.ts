import { ApiShoutcastController } from './shoutcast.controller';
import { ApiShoutcastService } from './shoutcast.service';
import { FavoritesModule } from 'src/favorites/favorites.module';
import { Module } from '@nestjs/common';
import { ShoutcastModule } from 'src/shoutcast/shoutcast.module';

@Module({
  imports: [FavoritesModule, ShoutcastModule],
  controllers: [ApiShoutcastController],
  providers: [ApiShoutcastService],
})
export class ApiShoutcastModule {}
