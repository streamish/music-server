import { AccountEntity } from 'src/database/entities';
import { Body, HttpStatus, Logger, Post } from '@nestjs/common';
import { SynologyApiEndpoint, SynologyController } from './synology.decorator';
import {
  SynologyArtistResponseDto,
  SynologyArtistsBodyDto,
  SynologyArtistsByDefaultGenreBodyDto,
  SynologyArtistsByGenreBodyDto,
} from './dtos';
import { SynologyArtistService } from './artist.service';
import { User } from '../user.decorator';
import { plainToInstance } from 'class-transformer';

@SynologyController()
export class SynologyArtistController {
  private readonly logger: Logger = new Logger(SynologyArtistController.name);

  constructor(private readonly artistService: SynologyArtistService) {}

  @SynologyApiEndpoint(Post, '/AudioStation/artist.cgi', HttpStatus.OK, {
    summary: 'Lists artists in the music library',
    description: 'Lists artists found in the music library.  The artists can be filtered by genre.',
    isAuthenticated: true,
    isPaginated: true,
    responses: {
      [HttpStatus.OK]: SynologyArtistResponseDto,
    },
    bodyModels: [SynologyArtistsBodyDto, SynologyArtistsByGenreBodyDto, SynologyArtistsByDefaultGenreBodyDto],
  })
  async route(
    @User() user: AccountEntity,
    @Body()
    variousBodies: SynologyArtistsBodyDto | SynologyArtistsByGenreBodyDto | SynologyArtistsByDefaultGenreBodyDto,
  ) {
    // Route #1:  artists in a genre
    if ('genre' in variousBodies) {
      return this.listArtistsInGenre(user, plainToInstance(SynologyArtistsByGenreBodyDto, variousBodies));
    }
    // Route #2:  artists in a "default" genre
    if ('genre_filter' in variousBodies) {
      return this.listArtistsInDefaultGenre(user, plainToInstance(SynologyArtistsByDefaultGenreBodyDto, variousBodies));
    }
    // Route #3:  all artists
    return this.listArtists(user, plainToInstance(SynologyArtistsBodyDto, variousBodies));
  }

  private async listArtistsInGenre(user: AccountEntity, body: SynologyArtistsByGenreBodyDto) {
    const data = await this.artistService.listArtistsByGenre(user.id, body.genre, body.offset, body.limit);
    return {
      data,
      success: true,
    };
  }

  private async listArtistsInDefaultGenre(user: AccountEntity, body: SynologyArtistsByDefaultGenreBodyDto) {
    const data = await this.artistService.listArtistsByGenre(user.id, body.genre_filter, body.offset, body.limit);
    return {
      data,
      success: true,
    };
  }

  private async listArtists(user: AccountEntity, body: SynologyArtistsBodyDto) {
    const data = await this.artistService.listArtists(user.id, body.offset, body.limit);
    return {
      data,
      success: true,
    };
  }
}
