import { InjectModel } from '@nestjs/sequelize';
import { Injectable } from '@nestjs/common';
import { RootPathEntity } from 'src/database/entities';
import { Sequelize } from 'sequelize';
import { UserRootPathDto } from './list-root-paths.dto';

type PathWithCounts = RootPathEntity & { fileCount: number; totalSize: number };

function pathToRow(rootPath: PathWithCounts): UserRootPathDto {
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
export class UserListRootPathsService {
  constructor(
    @InjectModel(RootPathEntity)
    private readonly rootPathEntity: typeof RootPathEntity,
  ) {}

  async listRootPaths(accountId: number): Promise<UserRootPathDto[]> {
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
      where: {
        accountId,
      },
    });
    return rootPaths.map((rootPath) => pathToRow(rootPath.get({ plain: true }) as PathWithCounts));
  }
}
