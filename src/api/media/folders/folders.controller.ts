import { AccountEntity } from 'src/database/entities/account.entity';
import { ApiEndpoint } from 'src/api/api.decorator';
import { ApiFoldersService } from './folders.service';
import { Controller, Get, HttpStatus } from '@nestjs/common';
import { FolderStructureResponseDto } from './dtos';
import { User } from 'src/api/user.decorator';

@Controller('/api')
export class ApiFoldersController {
  constructor(private readonly foldersService: ApiFoldersService) {}

  @ApiEndpoint(Get, 'folder-structure', HttpStatus.OK, {
    summary: 'Retrieve library folder structure',
    description: [
      `Returns a tree structure starting with the root folders and nesting their folder and music file contents.`,
      `This is used for browsing libraries by folder which can be helpful when metadata is ambiguous or incomplete.`,
    ].join(' '),
    allowAdministrator: true,
    allowUser: true,
    responses: {
      [HttpStatus.OK]: FolderStructureResponseDto,
    },
  })
  async getTreeStructure(@User() user: AccountEntity) {
    const items = await this.foldersService.getTreeStructure(user.id);
    return {
      items,
      success: true,
    };
  }
}
