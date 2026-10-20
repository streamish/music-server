import { BadRequestException, Injectable } from '@nestjs/common';
import { ErrorCodes } from 'src/constants/error-codes';
import { LibraryService } from 'src/library/library.service';
import { sep } from 'node:path';

@Injectable()
export class ApiFoldersService {
  constructor(private readonly libraryService: LibraryService) {}

  /**
   * Returns the subfolder and tracks from the collated root paths containing the
   * specified folder path, eg `/root1/artist 1` merged with `/root2/artist 1`
   * to create a combined view of the contents.
   * @param userId The authenticated user ID
   * @param currentPath The current path within the folder tree to retrieve
   */
  async listFolderContents(userId: number, currentPath: string) {
    if (!currentPath || !currentPath.startsWith(sep)) {
      throw new BadRequestException(ErrorCodes.INVALID_FOLDER_PATH_ERROR);
    }
    return this.libraryService.listFolderContentsByPath(userId, currentPath);
  }
}
