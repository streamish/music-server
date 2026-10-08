import { AccountEntity } from 'src/database/entities';
import { Body, HttpStatus, Logger, Post } from '@nestjs/common';
import { SynologyApiEndpoint, SynologyController } from './synology.decorator';
import {
  SynologyFolderBodyDto,
  SynologyFolderDto,
  SynologyFolderResponseDto,
  SynologyRootFolderBodyDto,
} from './dtos/folder.cgi.dto';
import { SynologyFolderService } from './folder.service';
import { SynologySongDto } from './dtos';
import { User } from '../user.decorator';
import { plainToInstance } from 'class-transformer';

@SynologyController()
export class SynologyFolderController {
  private readonly logger: Logger = new Logger(SynologyFolderController.name);

  constructor(private readonly folderService: SynologyFolderService) {}

  @SynologyApiEndpoint(Post, '/AudioStation/folder.cgi', HttpStatus.OK, {
    summary: 'Lists folders in the music library',
    description: ['Lists folders found in the music library to enable navigating music by the file path.'].join(' '),
    isAuthenticated: true,
    responses: {
      [HttpStatus.OK]: [SynologyFolderResponseDto],
    },
    bodyModels: [SynologyRootFolderBodyDto, SynologyFolderBodyDto],
    extraModels: [SynologyFolderDto, SynologySongDto],
  })
  async route(
    @User() user: AccountEntity,
    @Body() variousBodies: SynologyRootFolderBodyDto | SynologyFolderBodyDto,
  ): Promise<SynologyFolderResponseDto> {
    if ('id' in variousBodies) {
      const body = plainToInstance(SynologyFolderBodyDto, variousBodies);
      const data = await this.folderService.listFolders(user.id, body.id, body.offset, body.limit);
      return {
        data,
        success: true,
      };
    }
    const body = plainToInstance(SynologyRootFolderBodyDto, variousBodies);
    const data = await this.folderService.listRootFolders(user.id, body.offset, body.limit);
    return {
      data,
      success: true,
    };
  }
}
