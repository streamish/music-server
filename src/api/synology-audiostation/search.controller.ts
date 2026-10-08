import { AccountEntity } from 'src/database/entities';
import { Body, HttpStatus, Logger, Post } from '@nestjs/common';
import { SynologyApiEndpoint, SynologyController } from './synology.decorator';
import { SynologySearchBodyDto, SynologySearchResponseDto } from './dtos/search.cgi.dto';
import { SynologySearchService } from './search.service';
import { User } from '../user.decorator';

@SynologyController()
export class SynologySearchController {
  private readonly logger: Logger = new Logger(SynologySearchController.name);

  constructor(private readonly searchService: SynologySearchService) {}

  @SynologyApiEndpoint(Post, '/AudioStation/search.cgi', HttpStatus.OK, {
    summary: 'Searches for artists, albums and songs in the music library',
    description: [
      'Searches for artists, albums and songs in the music library matching a search query.',
      'The search is case-insensitive and supports partially matching names and titles.',
    ].join(' '),
    isAuthenticated: true,
    responses: {
      [HttpStatus.OK]: SynologySearchResponseDto,
    },
  })
  async route(@User() user: AccountEntity, @Body() body: SynologySearchBodyDto): Promise<SynologySearchResponseDto> {
    const data = await this.searchService.listSearchResults(user.id, body.keyword);
    return {
      data,
      success: true,
    };
  }
}
