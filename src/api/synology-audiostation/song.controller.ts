import { AccountEntity } from 'src/database/entities';
import { Body, HttpStatus, Logger, Post } from '@nestjs/common';
import { SynologyApiEndpoint, SynologyController } from './synology.decorator';
import {
  SynologySongResponseDto,
  SynologySongsBodyDto,
  SynologySongsByAlbumArtistBodyDto,
  SynologySongsByAlbumBodyDto,
  SynologySongsByAlbumComposerBodyDto,
  SynologySongsByAlbumDefaultGenreBodyDto,
  SynologySongsByAlbumGenreBodyDto,
  SynologySongsByArtistBodyDto,
  SynologySongsByComposerBodyDto,
  SynologySongsByDefaultGenreBodyDto,
  SynologySongsByGenreBodyDto,
  SynologySongsRateBodyDto,
} from './dtos';
import { SynologySongService } from './song.service';
import { SynologySuccessResponseDto } from './dtos/synology.dto';
import { User } from '../user.decorator';
import { plainToInstance } from 'class-transformer';

@SynologyController()
export class SynologySongController {
  private readonly logger: Logger = new Logger(SynologySongController.name);

  constructor(private readonly songService: SynologySongService) {}

  @SynologyApiEndpoint(Post, '/AudioStation/song.cgi', HttpStatus.OK, {
    summary: 'Lists songs in the music library',
    description:
      'Lists songs found in the music library.  The songs can be filtered by album, artist, composer, or genre.',
    isAuthenticated: true,
    isPaginated: true,
    responses: {
      [HttpStatus.OK]: [SynologySongResponseDto, SynologySuccessResponseDto],
    },
    bodyModels: [
      SynologySongsBodyDto,
      SynologySongsByAlbumArtistBodyDto,
      SynologySongsByAlbumBodyDto,
      SynologySongsByAlbumComposerBodyDto,
      SynologySongsByAlbumDefaultGenreBodyDto,
      SynologySongsByAlbumGenreBodyDto,
      SynologySongsByArtistBodyDto,
      SynologySongsByComposerBodyDto,
      SynologySongsByDefaultGenreBodyDto,
      SynologySongsByGenreBodyDto,
      SynologySongsRateBodyDto,
      SynologySongResponseDto,
      SynologySuccessResponseDto,
    ],
  })
  async route(
    @User() user: AccountEntity,
    @Body()
    variousBodies:
      | SynologySongsBodyDto
      | SynologySongsByAlbumBodyDto
      | SynologySongsByArtistBodyDto
      | SynologySongsByAlbumArtistBodyDto
      | SynologySongsByComposerBodyDto
      | SynologySongsByAlbumComposerBodyDto
      | SynologySongsByAlbumGenreBodyDto
      | SynologySongsByGenreBodyDto
      | SynologySongsByDefaultGenreBodyDto
      | SynologySongsByAlbumDefaultGenreBodyDto,
  ): Promise<SynologySongResponseDto | SynologySuccessResponseDto> {
    if ('composer' in variousBodies) {
      // Route #1:  Composer tracks for an album
      if ('album' in variousBodies) {
        const body = plainToInstance(SynologySongsByAlbumComposerBodyDto, variousBodies);
        const data = await this.songService.listComposerAlbumTracks(
          user.id,
          body.composer,
          body.album,
          body.album_artist,
          body.offset,
          body.limit,
        );
        return {
          data,
          success: true,
        };
      }
      // Route #2:  Composer tracks
      const body = plainToInstance(SynologySongsByComposerBodyDto, variousBodies);
      const data = await this.songService.listComposerTracks(user.id, body.composer, body.offset, body.limit);
      return {
        data,
        success: true,
      };
    }
    if ('genre' in variousBodies) {
      // Route #3:  Genre tracks for an album
      if ('album' in variousBodies) {
        const body = plainToInstance(SynologySongsByAlbumGenreBodyDto, variousBodies);
        const data = await this.songService.listGenreAlbumTracks(
          user.id,
          body.album,
          body.album_artist,
          body.genre,
          body.offset,
          body.limit,
        );
        return {
          data,
          success: true,
        };
      }
      // Route #4:  Genre tracks
      const body = plainToInstance(SynologySongsByGenreBodyDto, variousBodies);
      const data = await this.songService.listGenreTracks(user.id, body.genre, body.offset, body.limit);
      return {
        data,
        success: true,
      };
    }
    if ('genre_filter' in variousBodies) {
      // Route #5:  Default genre tracks for an album
      if ('album' in variousBodies) {
        const body = plainToInstance(SynologySongsByAlbumDefaultGenreBodyDto, variousBodies);
        const data = await this.songService.listGenreAlbumTracks(
          user.id,
          body.album,
          body.album_artist,
          body.genre_filter,
          body.offset,
          body.limit,
        );
        return {
          data,
          success: true,
        };
      }
      // Route #6:  Default genre tracks
      const body = plainToInstance(SynologySongsByAlbumDefaultGenreBodyDto, variousBodies);
      const data = await this.songService.listGenreTracks(user.id, body.genre_filter, body.offset, body.limit);
      return {
        data,
        success: true,
      };
    }
    // Route #7:  Album tracks
    if ('album' in variousBodies) {
      const body = plainToInstance(SynologySongsByAlbumBodyDto, variousBodies);
      const data = await this.songService.listAlbumTracks(
        user.id,
        body.album,
        body.album_artist,
        body.offset,
        body.limit,
      );
      return {
        data,
        success: true,
      };
    }
    // Route #8:  Artist tracks
    if ('artist' in variousBodies) {
      const body = plainToInstance(SynologySongsByArtistBodyDto, variousBodies);
      const data = await this.songService.listArtistTracks(user.id, body.artist, body.offset, body.limit);
      return {
        data,
        success: true,
      };
    }
    // Route #9:  Rating one or more track(s)
    if ('rating' in variousBodies) {
      const body = plainToInstance(SynologySongsRateBodyDto, variousBodies);
      await this.songService.rateTracks(user.id, body.id, body.rating);
      return {
        success: true,
      };
    }
    // Route #10:  Generic track list
    const body = plainToInstance(SynologySongsBodyDto, variousBodies);
    const data = await this.songService.listTracks(user.id, body.offset, body.limit);
    return {
      data,
      success: true,
    };
  }
}
