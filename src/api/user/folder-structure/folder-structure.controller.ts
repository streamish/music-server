import { AccountEntity } from 'src/database/entities/account.entity';
import { ApiEndpoint, UserController } from 'src/api/api.decorator';
import { Get, HttpStatus } from '@nestjs/common';
import { User } from 'src/api/user.decorator';
import { UserFolderStructureResponseDto } from './folder-structure.dto';
import { UserFolderStructureService } from './folder-structure.service';

@UserController()
export class UserFolderStructureController {
  constructor(private readonly listFoldersService: UserFolderStructureService) {}

  @ApiEndpoint(Get, 'folder-structure', HttpStatus.OK, {
    summary: 'Retrieve library folder structure',
    description: [
      `Returns a tree structure starting with the root folders and nesting their folder and music file contents.`,
      `This is used for browsing libraries by folder which can be helpful when metadata is ambiguous or incomplete.`,
    ].join('\n'),
    isAuthenticated: true,
    responses: {
      [HttpStatus.OK]: UserFolderStructureResponseDto,
    },
  })
  async get(@User() user: AccountEntity) {
    const items = await this.listFoldersService.getTreeStructure(user.id);
    return {
      items,
      success: true,
    };
  }
}
