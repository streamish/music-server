import { AccountEntity, RootPathEntity } from 'src/database/entities';
import { AdminRootPathDto } from './list-root-paths.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize';

type PathWithCounts = RootPathEntity & { fileCount: number; totalSize: number };

function pathToRow(rootPath: PathWithCounts): AdminRootPathDto {
  return {
    id: rootPath.id,
    rootPath: rootPath.rootPath,
    accountId: rootPath.accountId,
    createdAt: rootPath.createdAt,
    updatedAt: rootPath.updatedAt ?? undefined,
    username: rootPath.account?.username ?? 'Unknown',
    fileCount: rootPath.fileCount ?? 0,
    totalSize: rootPath.totalSize ?? 0,
  };
}

@Injectable()
export class AdminListRootPathsService {
  constructor(
    @InjectModel(RootPathEntity)
    private readonly rootPathEntity: typeof RootPathEntity,
  ) {}

  async listRootPaths(): Promise<AdminRootPathDto[]> {
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
    });
    return rootPaths.map((rootPath) => pathToRow(rootPath.get({ plain: true }) as PathWithCounts));
  }
}
