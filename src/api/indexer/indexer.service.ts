import { AccountEntity, IndexerConfigurationEntity, RootPathEntity } from 'src/database/entities';
import { ErrorCodes } from 'src/constants/error-codes';
import { IndexerConfigurationDto, LogWithUserEntryDto } from './dtos';
import { IndexerService } from 'src/indexer/indexer.service';
import { Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { LogEntry } from 'src/indexer/types';

function logToRow(
  item: LogEntry,
  usernameMap: Record<number, string>,
  rootPaths: Record<number, string>,
): LogWithUserEntryDto {
  return {
    ...item,
    username: usernameMap[item.accountId] || '',
    rootPath: rootPaths[item.rootPathId] || '',
  };
}

function configurationToRow(config: IndexerConfigurationEntity): IndexerConfigurationDto {
  return {
    id: config.id,
    isEnabled: config.isEnabled,
    createdAt: config.createdAt,
    createdByAccountId: config.createdByAccountId,
    createdByUsername: config.createdByAccount?.username || 'Unknown',
  };
}

@Injectable()
export class ApiIndexerService {
  constructor(
    @InjectModel(AccountEntity)
    private readonly accountEntity: typeof AccountEntity,
    @InjectModel(IndexerConfigurationEntity)
    private readonly indexerConfigurationEntity: typeof IndexerConfigurationEntity,
    @InjectModel(RootPathEntity)
    private readonly rootPathEntity: typeof RootPathEntity,
    @Inject(IndexerService) private readonly indexerService: IndexerService,
  ) {}

  private async getUsernameMap() {
    const accounts = await this.accountEntity.findAll({
      attributes: ['id', 'username'],
    });
    const accountMap: Record<number, string> = {};
    accounts.forEach((account) => {
      accountMap[account.id] = account.username;
    });
    return accountMap;
  }

  private async getRootPaths(accountId?: number) {
    const rootPaths = await this.rootPathEntity.findAll({
      attributes: ['id', 'rootPath'],
      where: {
        ...(accountId ? { accountId } : {}),
      },
    });
    const rootPathMap: Record<number, string> = {};
    rootPaths.forEach((rootPath) => {
      rootPathMap[rootPath.id] = rootPath.rootPath;
    });
    return rootPathMap;
  }

  async getConfiguration() {
    const configuration = await this.indexerConfigurationEntity.findOne({
      attributes: ['id', 'isEnabled', 'createdAt', 'createdByAccountId'],
      include: [
        {
          model: AccountEntity,
          attributes: ['username'],
          as: 'createdByAccount',
        },
      ],
      order: [['id', 'DESC']],
    });
    if (!configuration) {
      throw new InternalServerErrorException(ErrorCodes.INDEXER_CONFIGURATION_NOT_FOUND_ERROR);
    }
    return configurationToRow(configuration);
  }

  async listIndexerLogs(accountId?: number, rootPathId?: number, search?: string) {
    const usernameMap = await this.getUsernameMap();
    const rootPaths = await this.getRootPaths();
    const searchNormalized = search?.toLowerCase()?.trim() || '';
    return this.indexerService.logs
      .filter(
        (item) =>
          (!accountId || item.accountId === accountId) &&
          (!rootPathId || item.rootPathId === rootPathId) &&
          (!searchNormalized || item.message.toLowerCase().indexOf(searchNormalized) > -1),
      )
      .map((item) => logToRow(item, usernameMap, rootPaths))
      .reverse();
  }

  async listIndexerLogsByUser(accountId: number, rootPathId?: number, search?: string) {
    const rootPaths = await this.getRootPaths(accountId);
    if (rootPathId && !rootPaths[rootPathId]) {
      throw new NotFoundException(ErrorCodes.INVALID_ROOT_PATH_ID_ERROR);
    }
    const searchNormalized = search?.toLowerCase()?.trim() || '';
    return this.indexerService.logs
      .filter(
        (item) =>
          item.accountId === accountId &&
          (!rootPathId || item.rootPathId === rootPathId) &&
          (!searchNormalized || item.message.toLowerCase().indexOf(searchNormalized) > -1),
      )
      .map((item) => logToRow(item, {}, rootPaths))
      .reverse();
  }

  async setStatus(accountId: number, enabled: boolean) {
    return this.indexerConfigurationEntity.create({
      isEnabled: enabled,
      createdByAccountId: accountId,
    } as IndexerConfigurationEntity);
  }
}
