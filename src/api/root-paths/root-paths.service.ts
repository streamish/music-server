import { AccountEntity, RootPathEntity } from 'src/database/entities';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ErrorCodes } from 'src/constants/error-codes';
import { InjectModel } from '@nestjs/sequelize';
import { RootPathDto, RootPathWithUserDto } from './dtos';
import { Sequelize } from 'sequelize';
import { existsSync } from 'node:fs';

type PathWithCounts = RootPathEntity & { fileCount: number; totalSize: number };

function rootPathWithUserToRow(rootPath: PathWithCounts): RootPathWithUserDto {
  return {
    id: rootPath.id,
    rootPath: rootPath.rootPath,
    createdAt: rootPath.createdAt,
    updatedAt: rootPath.updatedAt ?? undefined,
    username: rootPath.account?.username ?? 'Unknown',
    fileCount: rootPath.fileCount ?? 0,
    totalSize: rootPath.totalSize ?? 0,
  };
}

function rootPathToRow(rootPath: PathWithCounts): RootPathDto {
  return {
    id: rootPath.id,
    rootPath: rootPath.rootPath,
    createdAt: rootPath.createdAt,
    updatedAt: rootPath.updatedAt ?? undefined,
    fileCount: rootPath.fileCount ?? 0,
    totalSize: rootPath.totalSize ?? 0,
  };
}

@Injectable()
export class ApiRootPathsService {
  constructor(
    @InjectModel(AccountEntity)
    private readonly accountEntity: typeof AccountEntity,
    @InjectModel(RootPathEntity)
    private readonly rootPathEntity: typeof RootPathEntity,
  ) {}

  /**
   * Creates a root path for the specified user.
   * @param userId The authenticated user ID
   * @param rootPath The fully-qualified path to add
   * @throws If the specified account is not found
   * @throws If the specified root path does not exist on the drive
   * @throws If the specified root path has already been added to the account
   */
  async createRootPath(userId: number, rootPath: string) {
    const account = await this.accountEntity.findByPk(userId);
    if (!account) {
      throw new NotFoundException(ErrorCodes.ACCOUNT_NOT_FOUND_ERROR);
    }
    if (!existsSync(rootPath)) {
      throw new BadRequestException(ErrorCodes.ROOT_PATH_DOES_NOT_EXIST_ERROR);
    }
    const existingRootPath = await this.rootPathEntity.findOne({
      where: { rootPath, accountId: userId },
    });
    if (existingRootPath) {
      throw new BadRequestException(ErrorCodes.DUPLICATE_ROOT_PATH_ERROR);
    }
    await this.rootPathEntity.create({
      rootPath,
      accountId: userId,
    } as RootPathEntity);
  }

  /**
   * Deletes a root path for a user from the platform.
   * @param rootPathId The ID of the root path to delete
   * @throws If the specified root path is not found
   */
  async deleteUserRootPath(rootPathId: number) {
    const existingRootPath = await this.rootPathEntity.findOne({
      where: {
        id: rootPathId,
      },
      attributes: ['id', 'accountId'],
    });
    if (!existingRootPath) {
      throw new NotFoundException(ErrorCodes.ROOT_PATH_NOT_FOUND_ERROR);
    }
    return this.deleteRootPath(existingRootPath.accountId, existingRootPath.id);
  }

  /**
   * Deletes a root path from the platform.
   * @param rootPathId The ID of the root path to delete
   * @throws If the specified root path is not found
   */
  async deleteRootPath(accountId: number, rootPathId: number) {
    const existingRootPath = await this.rootPathEntity.findOne({
      where: {
        id: rootPathId,
        accountId,
      },
      attributes: ['id'],
    });
    if (!existingRootPath) {
      throw new NotFoundException(ErrorCodes.ROOT_PATH_NOT_FOUND_ERROR);
    }
    await this.rootPathEntity.destroy({
      where: { id: rootPathId },
      cascade: true,
    });
  }

  /**
   * Lists all root paths optionally filtered by any user
   * @param userId The authenticated user ID
   * @throws If the specified album is not found
   * @throws If the specified account is not found
   * @returns Array of root paths with accounts.
   */
  async listUserRootPaths(userId?: number) {
    if (userId) {
      const account = await this.accountEntity.findByPk(userId, { attributes: ['id'] });
      if (!account) {
        throw new NotFoundException(ErrorCodes.ACCOUNT_NOT_FOUND_ERROR);
      }
    }
    const rootPaths = await this.rootPathEntity.findAll({
      attributes: [
        'id',
        'rootPath',
        'accountId',
        'createdAt',
        'updatedAt',
        [
          Sequelize.literal(`(SELECT COUNT(*) FROM "tracks" WHERE "tracks"."root_path_id" = "RootPathEntity"."id")`),
          'fileCount',
        ],
        [
          Sequelize.literal(
            `(SELECT SUM(file_size) FROM "tracks" WHERE "tracks"."root_path_id" = "RootPathEntity"."id")`,
          ),
          'totalSize',
        ],
      ],
      include: [
        {
          model: AccountEntity,
          attributes: ['username'],
        },
      ],
      where: {
        ...(userId ? { accountId: userId } : {}),
      },
    });
    return rootPaths.map((rootPath) => rootPathWithUserToRow(rootPath.get({ plain: true }) as PathWithCounts));
  }

  /**
   * Lists all root paths for the specified user.
   * @param userId The authenticated user ID
   * @throws If the specified account is not found
   * @returns Array of root paths.
   */
  async listRootPaths(userId: number) {
    const account = await this.accountEntity.findByPk(userId, { attributes: ['id'] });
    if (!account) {
      throw new NotFoundException(ErrorCodes.ACCOUNT_NOT_FOUND_ERROR);
    }
    const rootPaths = await this.rootPathEntity.findAll({
      attributes: [
        'id',
        'rootPath',
        'createdAt',
        'updatedAt',
        [
          Sequelize.literal(`(SELECT COUNT(*) FROM "tracks" WHERE "tracks"."root_path_id" = "RootPathEntity"."id")`),
          'fileCount',
        ],
        [
          Sequelize.literal(
            `(SELECT SUM(file_size) FROM "tracks" WHERE "tracks"."root_path_id" = "RootPathEntity"."id")`,
          ),
          'totalSize',
        ],
      ],
      where: {
        accountId: userId,
      },
    });
    return rootPaths.map((rootPath) => rootPathToRow(rootPath.get({ plain: true }) as PathWithCounts));
  }

  /**
   * Updates a root path to point to a new location.  To preserve custom data this should be
   * done in a multi-step operation:
   * 1) disable indexing service
   * 2) move files to new root path location
   * 3) update root path to new location
   * 4) enable indexing service
   * @param rootPathId The ID of the root path to update.
   * @param newPath The new path to set for the root path.
   * @throws If the specified root path is not found
   * @throws If the specified root path does not exist on the drive
   * @throws If the specified root path has already been added to the account
   */
  async updateRootPath(rootPathId: number, newPath: string) {
    const rootPath = await this.rootPathEntity.findByPk(rootPathId);
    if (!rootPath) {
      throw new NotFoundException(ErrorCodes.ROOT_PATH_NOT_FOUND_ERROR);
    }
    if (!existsSync(newPath)) {
      throw new BadRequestException(ErrorCodes.ROOT_PATH_DOES_NOT_EXIST_ERROR);
    }
    const existingRootPath = await this.rootPathEntity.findOne({
      where: { rootPath: newPath, accountId: rootPath.accountId },
    });
    if (existingRootPath) {
      throw new BadRequestException(ErrorCodes.DUPLICATE_ROOT_PATH_ERROR);
    }
    await this.rootPathEntity.update({ rootPath: newPath }, { where: { id: rootPathId } });
  }
}
