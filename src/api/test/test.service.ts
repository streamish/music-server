import { AccountEntity, AlbumEntity, FolderEntity, RootPathEntity, TrackEntity } from 'src/database/entities';
import { AuthenticationService } from 'src/authentication/authentication.service';
import { CreateTestAccountBodyDto, TestAccountDto } from './dtos';
import { ErrorCodes } from 'src/constants/error-codes';
import { Guid } from 'typescript-guid';
import { IndexerService } from 'src/indexer/indexer.service';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

function accountToRow(account: AccountEntity): TestAccountDto {
  return {
    accountId: account.id,
    username: account.username,
    roles: account.roles,
  };
}

@Injectable()
export class ApiTestService {
  constructor(
    @InjectModel(AccountEntity)
    private readonly accountEntity: typeof AccountEntity,
    @InjectModel(AlbumEntity)
    private readonly albumEntity: typeof AlbumEntity,
    private readonly authenticationService: AuthenticationService,
    @InjectModel(FolderEntity)
    private readonly folderEntity: typeof FolderEntity,
    @InjectModel(TrackEntity)
    private readonly trackEntity: typeof TrackEntity,
    @Inject(IndexerService)
    private readonly indexerService: IndexerService,
    @InjectModel(RootPathEntity)
    private readonly rootPathEntity: typeof RootPathEntity,
  ) {}

  /**
   * Creates a test account with no root path or media that can be used for testing operations.
   * @param data The account information
   * @returns The test account details
   */
  async createTestAccount(data: CreateTestAccountBodyDto) {
    const passwordHash = await this.authenticationService.generatePasswordHash(data.password);
    const account = await this.accountEntity.create({
      username: data.username,
      passwordHash,
      roles: data.roles,
      sessionKey: Guid.create(),
    } as AccountEntity);
    return accountToRow(account);
  }

  /**
   * Deletes the specified account
   * @param userId The authenticated user ID
   * @throws If the specified account is not found
   */
  async deleteTestAccount(userId: number) {
    const account = await this.accountEntity.findByPk(userId, { attributes: ['id'] });
    if (!account) {
      throw new NotFoundException(ErrorCodes.ACCOUNT_NOT_FOUND_ERROR);
    }
    await account.destroy();
  }

  /**
   * Duplicates the specified account including copying the root path and media data
   * @param username The account to copy
   * @param newUsername The new account username to create
   * @returns The new account details
   */
  async duplicateTestAccount(username: string, newUsername: string) {
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
    const files = await this.trackEntity.findAll({ where: { accountId: account.id } });
    for (let i = 0, len = files.length; i < len; i += 1) {
      const file = files[i];
      if (file) {
        // eslint-disable-next-line no-await-in-loop
        await this.trackEntity.create({
          ...file.toJSON(),
          accountId: newAccount.id,
          rootPathId: rootPathRemap[file.rootPathId],
          albumId: albumRemap[file.albumId],
          createdAt: new Date(1970, 0, 1),
          updatedAt: undefined,
          id: undefined,
        } as unknown as TrackEntity);
      }
    }
    // copy the folders
    const folders = await this.folderEntity.findAll({ where: { accountId: account.id } });
    for (let i = 0, len = folders.length; i < len; i += 1) {
      const folder = folders[i];
      if (folder) {
        // eslint-disable-next-line no-await-in-loop
        await this.folderEntity.create({
          ...folder.toJSON(),
          accountId: newAccount.id,
          createdAt: new Date(1970, 0, 1),
          updatedAt: undefined,
          id: undefined,
        } as unknown as FolderEntity);
      }
    }
    // re-index the new files
    const newFiles = await this.trackEntity.findAll({ where: { accountId: newAccount.id } });
    for (let i = 0, len = newFiles.length; i < len; i += 1) {
      const newFile = newFiles[i];
      if (newFile) {
        // eslint-disable-next-line no-await-in-loop
        await this.indexerService.scanFile(newFile.id);
      }
    }
    return accountToRow(newAccount);
  }

  /**
   * Lists all accounts
   * @returns Array of all accounts
   */
  async listAccounts() {
    const accounts = await this.accountEntity.findAll();
    return accounts.map(accountToRow);
  }

  /**
   * Retrieves an account by username
   * @param username The username to look up
   * @throws If the specified account is not found
   * @returns Returns the specified account
   */
  async retrieveTestAccount(username: string) {
    const account = await this.accountEntity.findOne({
      attributes: ['id', 'username', 'roles'],
      where: {
        username,
      },
    });
    if (!account?.id) {
      throw new NotFoundException(ErrorCodes.ACCOUNT_NOT_FOUND_ERROR);
    }
    return accountToRow(account);
  }
}
