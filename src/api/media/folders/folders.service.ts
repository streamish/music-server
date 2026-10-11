import { Injectable } from '@nestjs/common';
import { LibraryFolderDto } from 'src/library/dtos';
import { LibraryService } from 'src/library/library.service';

@Injectable()
export class ApiFoldersService {
  constructor(private readonly libraryService: LibraryService) {}

  /**
   * Returns the tree-structure of the folders and files from the collated root paths
   * @param {number} accountId The authenticted account ID
   * @returns
   */
  async getTreeStructure(accountId: number): Promise<LibraryFolderDto[]> {
    return this.libraryService.listFolders(accountId);
  }
}
