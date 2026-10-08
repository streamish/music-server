import { AccountEntity } from 'src/database/entities';
import { Body, HttpStatus, Logger, Post } from '@nestjs/common';
import { SynologyApiEndpoint, SynologyController } from './synology.decorator';
import { SynologyDefaultGenreResponseDto, SynologyGenreBodyDto, SynologyGenreResponseDto } from './dtos';
import { SynologyGenreService } from './genre.service';
import { SynologyMethodEnum } from './synology.enums';
import { User } from '../user.decorator';

@SynologyController()
export class SynologyGenreController {
  private readonly logger: Logger = new Logger(SynologyGenreController.name);

  constructor(private readonly genreService: SynologyGenreService) {}

  @SynologyApiEndpoint(Post, '/AudioStation/genre.cgi', HttpStatus.OK, {
    summary: 'Lists genres in the music library or default genres',
    description: [
      'Returns a list of genres found in the music library, or a hard-coded list of default genres.',
      'The default genres are hard-coded, Synology internally remaps them to actual genres but this server does not.',
      'Each track can have one or more genres separated by `,` and they will each be counted as a separate genre.',
      'For instance, a track with the genre "Rock, Pop" will be counted as both "Rock" and "Pop".',
    ].join(' '),
    responses: {
      [HttpStatus.OK]: [SynologyGenreResponseDto, SynologyDefaultGenreResponseDto],
    },
  })
  async route(
    @User() user: AccountEntity,
    @Body() body: SynologyGenreBodyDto,
  ): Promise<SynologyGenreResponseDto | SynologyDefaultGenreResponseDto> {
    // Route #1:  the default genres presented in the "recommended genre" section of the app
    if (body.method === SynologyMethodEnum.LIST_DEFAULT_GENRE) {
      const data = await this.genreService.listDefaultGenres();
      return {
        data,
        success: true,
      };
    }
    // Route #2:  the genres present in the music catalog
    const data = await this.genreService.listGenres(user.id, body.offset || 0, body.limit || 100000);
    return {
      data,
      success: true,
    };
  }
}
