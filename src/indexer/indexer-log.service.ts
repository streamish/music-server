import { Injectable, Logger } from '@nestjs/common';
import type { LogEntry } from './types';

/**
 * In-memory ring buffer of indexer activity, also mirrored to the application logger.
 * Account and root path IDs of `0` mean the entry is not specific to either.
 */
@Injectable()
export class IndexerLogService {
  private readonly logger: Logger = new Logger(IndexerLogService.name);

  public readonly logs: LogEntry[] = [];

  private logSizeLimit: number = 1000;

  addLogEntry(accountId: number, rootPathId: number, message: string): void {
    this.logger.log(`[accountId: ${accountId} rootPathId: ${rootPathId}] ${message}`);
    this.logs.push({ accountId, rootPathId, message, date: new Date() });
    this.trim();
  }

  setLogSizeLimit(limit: number): void {
    this.logSizeLimit = limit;
    this.trim();
  }

  private trim(): void {
    if (this.logs.length > this.logSizeLimit) {
      this.logs.splice(0, this.logs.length - this.logSizeLimit);
    }
  }
}
