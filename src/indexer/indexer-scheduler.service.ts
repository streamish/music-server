import { ConfigService } from 'src/config/config.service';
import { Cron, CronExpression, Interval, Timeout } from '@nestjs/schedule';
import { FSWatcher, watch } from 'node:fs';
import { IndexerLogService } from './indexer-log.service';
import { IndexerService } from './indexer.service';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { RootPathEntity, TrackEntity } from 'src/database/entities';

@Injectable()
export class IndexerSchedulerService implements OnModuleDestroy {
  private readonly logger = new Logger(IndexerSchedulerService.name);

  private readonly scannerQueue: number[] = [];

  private readonly watchedFolders: Record<number, FSWatcher> = {};

  private isIndexing = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly indexerService: IndexerService,
    private readonly indexerLog: IndexerLogService,
    @InjectModel(RootPathEntity)
    private readonly rootPathEntity: typeof RootPathEntity,
    @InjectModel(TrackEntity)
    private readonly trackEntity: typeof TrackEntity,
  ) {}

  @Timeout(1000)
  async manualStart(): Promise<void> {
    this.indexerLog.addLogEntry(0, 0, 'Queueing root paths (manualStart)');
    await this.refreshFileWatchers();
    await this.processQueuedPath();
  }

  @Timeout(1)
  async testingStart(): Promise<void> {
    if (this.configService.isTesting()) {
      const rootPaths = await this.rootPathEntity.findAll({
        attributes: ['id'],
      });
      rootPaths.forEach((rootPath) => this.enqueueRootPath(rootPath.id));
      const queueLength = this.scannerQueue.length;
      for (let i = 0; i < queueLength; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        await this.processQueuedPath();
      }
    }
    this.indexerLog.addLogEntry(0, 0, 'Finished test indexing');
  }

  @Cron(CronExpression.EVERY_HOUR)
  async periodicRefresh(): Promise<void> {
    this.indexerLog.addLogEntry(0, 0, 'Queueing root paths (periodicRefresh)');
    const rootPaths = await this.rootPathEntity.findAll({
      attributes: ['id'],
    });
    rootPaths.forEach((rootPath) => this.enqueueRootPath(rootPath.id));
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async vacuumDatabase(): Promise<void> {
    this.indexerLog.addLogEntry(0, 0, 'Vacuuming database');
    await this.trackEntity.sequelize?.query('VACUUM');
  }

  @Interval(10000)
  async refreshFileWatchers(): Promise<void> {
    const rootPaths = await this.rootPathEntity.findAll({
      attributes: ['id', 'rootPath'],
    });
    for (let i = 0; i < rootPaths.length; i += 1) {
      const rootPath = rootPaths[i];
      if (rootPath && !this.watchedFolders[rootPath.id]) {
        // eslint-disable-next-line no-await-in-loop
        this.indexerLog.addLogEntry(0, 0, `Setting up watcher for root path: ${rootPath.rootPath}`);
        const watcher = watch(rootPath.rootPath, (eventType, filename) => {
          this.indexerLog.addLogEntry(
            0,
            0,
            `File system event detected: ${eventType} - ${filename} (root path: ${rootPath.rootPath})`,
          );
          this.enqueueRootPath(rootPath.id);
        });
        this.watchedFolders[rootPath.id] = watcher;
        watcher.on('error', (error) => {
          this.logger.error(
            `File system watcher failed for root path ${rootPath.rootPath}: ${error.message}`,
            error.stack,
          );
          this.indexerLog.addLogEntry(0, rootPath.id, `File system watcher failed: ${error.message}`);
          watcher.close();
          delete this.watchedFolders[rootPath.id];
        });
        this.enqueueRootPath(rootPath.id);
      }
    }

    const currentRootPathIds = rootPaths.map((rootPath) => rootPath.id);
    Object.entries(this.watchedFolders).forEach(([rootPathIdString, watcher]) => {
      const rootPathId = Number(rootPathIdString);
      if (!currentRootPathIds.includes(rootPathId)) {
        watcher.close();
        delete this.watchedFolders[rootPathId];
        const queueIndex = this.scannerQueue.indexOf(rootPathId);
        if (queueIndex !== -1) {
          this.scannerQueue.splice(queueIndex, 1);
        }
      }
    });
  }

  @Interval(10000)
  async processQueuedPath(): Promise<void> {
    if (!this.scannerQueue.length || this.isIndexing) {
      return;
    }

    this.isIndexing = true;
    const rootPathId = this.scannerQueue.shift();
    try {
      if (rootPathId === undefined) {
        return;
      }
      const systemConfiguration = await this.indexerService.getSystemConfiguration();
      this.indexerLog.setLogSizeLimit(systemConfiguration.indexerLogSize);
      if (await this.indexerService.isDisabled()) {
        this.enqueueRootPath(rootPathId);
        this.indexerLog.addLogEntry(
          0,
          0,
          `scanner is disabled, queue will be processed later (${this.scannerQueue.length})`,
        );
        return;
      }

      this.indexerLog.addLogEntry(0, 0, `checking for queued root paths to scan (${this.scannerQueue.length})`);
      const rootPath = await this.rootPathEntity.findByPk(rootPathId);
      if (!rootPath) {
        return;
      }

      await this.indexerService.scanRootPath(rootPath);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to scan queued root path ${rootPathId}: ${message}`,
        error instanceof Error ? error.stack : undefined,
      );
      if (rootPathId !== undefined) {
        this.enqueueRootPath(rootPathId);
      }
      this.indexerLog.addLogEntry(0, rootPathId ?? 0, `Failed to scan queued root path: ${message}`);
    } finally {
      this.isIndexing = false;
    }
  }

  onModuleDestroy(): void {
    Object.values(this.watchedFolders).forEach((watcher) => watcher.close());
  }

  private enqueueRootPath(rootPathId: number): void {
    if (!this.scannerQueue.includes(rootPathId)) {
      this.scannerQueue.push(rootPathId);
    }
  }
}
