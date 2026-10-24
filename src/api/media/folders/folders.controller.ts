import { AccountEntity } from 'src/database/entities';
import { ApiEndpoint } from 'src/api/api.decorator';
import { ApiFoldersService } from './folders.service';
import { Controller, Get, HttpStatus, Query } from '@nestjs/common';
import { ListFolderContentsQueryDto, ListFolderContentsResponseDto } from './dtos';
import { User } from 'src/api/user.decorator';

@Controller('/api')
export class ApiFoldersController {
  constructor(private readonly foldersService: ApiFoldersService) {}

  @ApiEndpoint(Get, 'list-folder-contents', HttpStatus.OK, {
    summary: 'Retrieve library folder structure',
    description: [
      `Returns a tree structure starting with the root folders and nesting their folder and music file contents.`,
      `This is used for browsing libraries by folder which can be helpful when metadata is ambiguous or incomplete.`,
    ].join(' '),
    allowAdministrator: true,
    allowUser: true,
    responses: {
      [HttpStatus.OK]: ListFolderContentsResponseDto,
    },
  })
  async listFolderContents(@User() user: AccountEntity, @Query() query: ListFolderContentsQueryDto) {
    const folder = await this.foldersService.listFolderContents(user.id, query.path);
    return {
      folder,
      success: true,
    };
  }
}
