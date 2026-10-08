import { AccountEntity, SessionEntity } from 'src/database/entities';
import { BadRequestException, Body, HttpStatus, Logger, Post, Req, Res } from '@nestjs/common';
import { Session } from '../session.decorator';
import { SynologyApiEndpoint, SynologyController } from './synology.decorator';
import { SynologyApiEnum, SynologyMethodEnum } from './enums';
import {
  SynologyEntryCertificateBodyDto,
  SynologyEntryCertificateResponseDto,
  SynologyEntryCreatePinBodyDto,
  SynologyEntryDeletePinBodyDto,
  SynologyEntryListPinsBodyDto,
  SynologyEntryListPinsResponseDto,
  SynologyEntryLogoutBodyDto,
  SynologyEntryLogoutResponseDto,
  SynologyEntryPlaylistAddAlbumBodyDto,
  SynologyEntryPlaylistAddArtistBodyDto,
  SynologyEntryPlaylistAddComposerBodyDto,
  SynologyEntryPlaylistAddGenreBodyDto,
  SynologyEntrySignInBodyDto,
  SynologyEntrySignInResponseDto,
} from './dtos';
import { SynologyEntryService } from './entry.service';
import { SynologySuccessResponseDto } from './dtos/synology.dto';
import { User } from '../user.decorator';
import { plainToInstance } from 'class-transformer';
import type { Response } from 'express';

@SynologyController({ allowGuest: true })
export class SynologyEntryController {
  private readonly logger: Logger = new Logger(SynologyEntryController.name);

  constructor(private readonly entryService: SynologyEntryService) {}

  @SynologyApiEndpoint(Post, '/entry.cgi', HttpStatus.OK, {
    summary: 'Authentication, session management, playlists and favorites',
    description: [
      'This endpoint handles system-level operations such as authentication, and favorite/pinned items, and playlists.',
      'Some operations require authentication - logging out, adding to playlists, and listing/managing pinned items.',
      'Other operations do not require authentication - retrieving the encryption key and signing in.',
      'For the actions requiring authentication the request must be made using a session ID and device ID cookie.',
      'To create a session this endpoint first shares the encryption public key so credentials can be submitted.',
      'Credentials are then submitted encrypted with the public key before being sent to this endpoint.',
    ].join(' '),
    isAuthenticated: true,
    responses: {
      [HttpStatus.OK]: [
        SynologyEntryCertificateResponseDto,
        SynologyEntrySignInResponseDto,
        SynologyEntryListPinsResponseDto,
        SynologyEntryLogoutResponseDto,
        SynologySuccessResponseDto,
      ],
    },
    bodyModels: [
      SynologyEntryCertificateBodyDto,
      SynologyEntrySignInBodyDto,
      SynologyEntryListPinsBodyDto,
      SynologyEntryCreatePinBodyDto,
      SynologyEntryDeletePinBodyDto,
      SynologyEntryLogoutBodyDto,
      SynologyEntryPlaylistAddAlbumBodyDto,
      SynologyEntryPlaylistAddArtistBodyDto,
      SynologyEntryPlaylistAddComposerBodyDto,
      SynologyEntryPlaylistAddGenreBodyDto,
    ],
  })
  async route(
    @Body()
    variousBodies:
      | SynologyEntryCertificateBodyDto
      | SynologyEntryCreatePinBodyDto
      | SynologyEntryDeletePinBodyDto
      | SynologyEntrySignInBodyDto
      | SynologyEntryListPinsBodyDto
      | SynologyEntryLogoutBodyDto
      | SynologyEntryPlaylistAddAlbumBodyDto
      | SynologyEntryPlaylistAddArtistBodyDto
      | SynologyEntryPlaylistAddComposerBodyDto
      | SynologyEntryPlaylistAddGenreBodyDto,
    @Req() req: Request,
    @Res({ passthrough: true }) response: Response,
    @User() user?: AccountEntity,
    @Session() session?: SessionEntity,
  ): Promise<
    | SynologyEntryCertificateResponseDto
    | SynologyEntrySignInResponseDto
    | SynologyEntryListPinsResponseDto
    | SynologyEntryLogoutResponseDto
    | SynologySuccessResponseDto
  > {
    // Route #1:  requesting encryption key and field names
    if (
      'api' in variousBodies &&
      variousBodies.api === SynologyApiEnum.ENCRYPTION &&
      variousBodies.method === SynologyMethodEnum.GET_INFO
    ) {
      return this.getEncryptionKey();
    }
    // Route #2:  signing in with encrypted username/password credentials
    if ((!('api' in variousBodies) || variousBodies.api === SynologyApiEnum.AUTH) && '__cIpHeRtExT' in variousBodies) {
      const userAgent = req.headers['user-agent'] || '';
      return this.signIn(userAgent, plainToInstance(SynologyEntrySignInBodyDto, variousBodies), response);
    }
    // Route #3:  returns pinned items
    if (
      user &&
      'api' in variousBodies &&
      variousBodies.api === SynologyApiEnum.PIN &&
      variousBodies.method === SynologyMethodEnum.LIST
    ) {
      return this.listPinnedItems(user, plainToInstance(SynologyEntryListPinsBodyDto, variousBodies));
    }
    // Route #4:  pinning items
    if (
      user &&
      'api' in variousBodies &&
      variousBodies.api === SynologyApiEnum.PIN &&
      variousBodies.method === SynologyMethodEnum.PIN
    ) {
      return this.createPinnedItem(user, plainToInstance(SynologyEntryCreatePinBodyDto, variousBodies));
    }
    // Route #5:  unpinning an item
    if (
      user &&
      'api' in variousBodies &&
      variousBodies.api === SynologyApiEnum.PIN &&
      variousBodies.method === SynologyMethodEnum.UNPIN
    ) {
      return this.deletePinnedItem(user, plainToInstance(SynologyEntryDeletePinBodyDto, variousBodies));
    }
    // Route #6:  logging out, for some reason a request may be made without user/session
    if (
      'api' in variousBodies &&
      variousBodies.api === SynologyApiEnum.AUTH &&
      variousBodies.method === SynologyMethodEnum.LOGOUT
    ) {
      return this.clearSessionToken(user, session);
    }
    if (
      user &&
      'api' in variousBodies &&
      variousBodies.api === SynologyApiEnum.PLAYLIST &&
      variousBodies.method === SynologyMethodEnum.ADD_TRACK
    ) {
      // Route #7:  adding albums to a playlist
      if ('album' in variousBodies) {
        return this.addAlbumToPlaylist(user, plainToInstance(SynologyEntryPlaylistAddAlbumBodyDto, variousBodies));
      }
      // Route #8:  adding artists to a playlist
      if ('artist' in variousBodies) {
        return this.addArtistToPlaylist(user, plainToInstance(SynologyEntryPlaylistAddArtistBodyDto, variousBodies));
      }
      // Route #9:  adding composers to a playlist
      if ('composer' in variousBodies) {
        return this.addComposerToPlaylist(
          user,
          plainToInstance(SynologyEntryPlaylistAddComposerBodyDto, variousBodies),
        );
      }
      // Route #10:  adding genres to a playlist
      if ('genre' in variousBodies) {
        return this.addGenreToPlaylist(user, plainToInstance(SynologyEntryPlaylistAddGenreBodyDto, variousBodies));
      }
    }
    throw new BadRequestException(`Invalid request body for entry.cgi`);
  }

  private async getEncryptionKey(): Promise<SynologyEntryCertificateResponseDto> {
    const data = this.entryService.getEncryptionKey();
    return {
      data,
      success: true,
    };
  }

  private async signIn(
    userAgent: string,
    body: SynologyEntrySignInBodyDto,
    response: Response,
  ): Promise<SynologyEntrySignInResponseDto> {
    const data = await this.entryService.authenticate(userAgent, body);
    response.cookie('id', data.sid, {
      httpOnly: true,
      sameSite: 'strict',
      expires: new Date(Date.now() + 3650 * 24 * 60 * 60 * 1000),
    });
    response.cookie('did', data.did, {
      httpOnly: true,
      sameSite: 'strict',
      expires: new Date(Date.now() + 3650 * 24 * 60 * 60 * 1000),
    });
    return {
      data,
      success: true,
    };
  }

  private async clearSessionToken(
    user?: AccountEntity,
    session?: SessionEntity,
  ): Promise<SynologyEntryLogoutResponseDto> {
    if (user && session) {
      const success = await this.entryService.clearSessionToken(user.id, session.id);
      if (!success) {
        throw new BadRequestException({
          success: false,
          message: 'Failed to log out',
        });
      }
    }
    return {
      success: true,
    };
  }

  private async listPinnedItems(
    user: AccountEntity,
    body: SynologyEntryListPinsBodyDto,
  ): Promise<SynologyEntryListPinsResponseDto> {
    const data = await this.entryService.listPinnedItems(user.id, body.offset, body.limit);
    return {
      data,
      success: true,
    };
  }

  private async createPinnedItem(
    user: AccountEntity,
    body: SynologyEntryCreatePinBodyDto,
  ): Promise<SynologyEntryListPinsResponseDto> {
    const data = await this.entryService.createPinnedItem(user.id, body.items);
    return {
      data,
      success: true,
    };
  }

  private async deletePinnedItem(
    user: AccountEntity,
    body: SynologyEntryDeletePinBodyDto,
  ): Promise<SynologyEntryListPinsResponseDto> {
    const data = await this.entryService.deletePinnedItem(user.id, body.items);
    return {
      data,
      success: true,
    };
  }

  private async addAlbumToPlaylist(
    user: AccountEntity,
    body: SynologyEntryPlaylistAddAlbumBodyDto,
  ): Promise<SynologySuccessResponseDto> {
    await this.entryService.addAlbumToPlaylist(user.id, body.id, body.album, body.album_artist);
    return {
      success: true,
    };
  }

  private async addArtistToPlaylist(
    user: AccountEntity,
    body: SynologyEntryPlaylistAddArtistBodyDto,
  ): Promise<SynologySuccessResponseDto> {
    await this.entryService.addArtistToPlaylist(user.id, body.id, body.artist);
    return {
      success: true,
    };
  }

  private async addComposerToPlaylist(
    user: AccountEntity,
    body: SynologyEntryPlaylistAddComposerBodyDto,
  ): Promise<SynologySuccessResponseDto> {
    await this.entryService.addComposerToPlaylist(user.id, body.id, body.composer);
    return {
      success: true,
    };
  }

  private async addGenreToPlaylist(
    user: AccountEntity,
    body: SynologyEntryPlaylistAddGenreBodyDto,
  ): Promise<SynologySuccessResponseDto> {
    await this.entryService.addGenreToPlaylist(user.id, body.id, body.genre);
    return {
      success: true,
    };
  }
}
