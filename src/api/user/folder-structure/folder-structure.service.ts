import { Injectable } from '@nestjs/common';
import { LibraryService } from 'src/library/library.service';

@Injectable()
export class UserFolderStructureService {
  constructor(private readonly libraryService: LibraryService) {}

  async getTreeStructure(accountId: number) {
    return this.libraryService.listFolders(accountId);
  }
}
