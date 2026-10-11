import { Injectable } from '@nestjs/common';
import { LibraryService } from 'src/library/library.service';

@Injectable()
export class ApiFoldersService {
  constructor(private readonly libraryService: LibraryService) {}

  /**
   * Returns the tree-structure of the folders and files from the collated root paths
   * @param userId The authenticated user ID
   * @returns
   */
  async getTreeStructure(userId: number) {
    return this.libraryService.listFolders(userId);
  }
}
