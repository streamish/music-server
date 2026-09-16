import { AccountEntity, AlbumEntity, FileEntity, RootPathEntity } from 'src/database/entities';
import { ErrorCodes } from 'src/constants/error-codes';
import { Guid } from 'typescript-guid';
import { IndexerService } from 'src/indexer/indexer.service';
import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class TestDuplicateAccountService {
  constructor(
    @InjectModel(AccountEntity)
    private readonly accountEntity: typeof AccountEntity,
    @InjectModel(AlbumEntity)
    private readonly albumEntity: typeof AlbumEntity,
    @InjectModel(FileEntity)
    private readonly fileEntity: typeof FileEntity,
    @Inject(IndexerService)
    private readonly indexerService: IndexerService,
    @InjectModel(RootPathEntity)
    private readonly rootPathEntity: typeof RootPathEntity,
  ) {}

  async duplicateAccount(username: string, newUsername: string) {
    const account = await this.accountEntity.findOne({ where: { username } });
    if (!account) {
      throw new Error(ErrorCodes.ACCOUNT_NOT_FOUND_ERROR);
    }

    // copy the account
    const newAccount = await this.accountEntity.create({
      ...account.toJSON(),
      username: newUsername,
      sessionKey: Guid.create(),
      id: undefined,
    } as unknown as AccountEntity);
    // copy the root paths
    const rootPaths = await this.rootPathEntity.findAll({ where: { accountId: account.id } });
    const rootPathRemap: Record<number, number> = {};
    for (let i = 0, len = rootPaths.length; i < len; i += 1) {
      const rootPath = rootPaths[i];
      if (rootPath) {
        // eslint-disable-next-line no-await-in-loop
        const newRootPath = await this.rootPathEntity.create({
          ...rootPath.toJSON(),
          accountId: newAccount.id,
          id: undefined,
        } as unknown as RootPathEntity);
        rootPathRemap[rootPath.id] = newRootPath.id;
      }
    }
    // copy the albums
    const albums = await this.albumEntity.findAll({ where: { accountId: account.id } });
    const albumRemap: Record<number, number> = {};
    for (let i = 0, len = albums.length; i < len; i += 1) {
      const album = albums[i];
      if (album) {
        // eslint-disable-next-line no-await-in-loop
        const newAlbum = await this.albumEntity.create({
          ...album.toJSON(),
          accountId: newAccount.id,
          rootPathId: rootPathRemap[album.rootPathId],
          id: undefined,
        } as unknown as AlbumEntity);
        albumRemap[album.id] = newAlbum.id;
      }
    }
    // copy the files
    const files = await this.fileEntity.findAll({ where: { accountId: account.id } });
    for (let i = 0, len = files.length; i < len; i += 1) {
      const file = files[i];
      if (file) {
        // eslint-disable-next-line no-await-in-loop
        await this.fileEntity.create({
          ...file.toJSON(),
          accountId: newAccount.id,
          rootPathId: rootPathRemap[file.rootPathId],
          albumId: albumRemap[file.albumId],
          createdAt: new Date(1970, 0, 1),
          updatedAt: undefined,
          id: undefined,
        } as unknown as FileEntity);
      }
    }
    // re-index the new files
    const newFiles = await this.fileEntity.findAll({ where: { accountId: newAccount.id } });
    for (let i = 0, len = newFiles.length; i < len; i += 1) {
      const newFile = newFiles[i];
      if (newFile) {
        // eslint-disable-next-line no-await-in-loop
        await this.indexerService.scanFile(newFile.id);
      }
    }
    return newAccount;
  }
}
