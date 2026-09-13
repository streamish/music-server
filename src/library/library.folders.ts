import { FileEntity } from 'src/database/entities';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable } from '@nestjs/common';
import { UserTreeItemDto } from 'src/api/user/folder-structure/folder-structure.dto';
import { sep } from 'node:path';

@Injectable()
export class LibraryFolderService {
  constructor(@InjectModel(FileEntity) private readonly fileEntity: typeof FileEntity) {}

  // eslint-disable-next-line class-methods-use-this
  buildTree(tracks: FileEntity[]): UserTreeItemDto[] {
    const root: UserTreeItemDto = {
      folder: '',
      file: '',
      fullPath: '',
      id: 0,
      children: [],
    };
    let folderId = 0;
    const directoryMap = new Map([['', root]]);
    for (let i = 0, len = tracks?.length; i < len; i += 1) {
      const track = tracks[i];
      if (track) {
        const { filePath } = track;
        const parts = filePath.split('/').filter(Boolean);
        let currentPath = '';
        let parent = root;
        for (let j = 0, jLen = parts.length; j < jLen; j += 1) {
          const part = parts[j];
          if (part) {
            currentPath += `/${part}`;
            let node = directoryMap.get(currentPath);
            if (!node) {
              const isFile = j === parts.length - 1;
              if (!isFile) {
                folderId += 1;
              }
              node = {
                folder: isFile ? '' : part,
                fullPath: currentPath,
                ...(isFile
                  ? { id: folderId, file: track.filePath.split(sep).pop() || '' }
                  : { children: [], file: part, id: folderId }),
              };
              parent.children?.push(node);
              directoryMap.set(currentPath, node);
            }
            parent = node;
          }
        }
      }
    }
    function sortChildren(node: UserTreeItemDto) {
      node.children?.sort((a, b) => (a.folder || a.file || '').localeCompare(b.folder || b.file || ''));
      node.children?.forEach(sortChildren);
    }
    sortChildren(root);
    return root.children || [];
  }

  async getTreeStructure(accountId: number) {
    const files = await this.fileEntity.findAll({
      attributes: ['filePath'],
      where: {
        accountId,
      },
    });
    return this.buildTree(files);
  }
}
