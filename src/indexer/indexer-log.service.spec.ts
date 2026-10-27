import { IndexerLogService } from './indexer-log.service';
import { Logger } from '@nestjs/common';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

describe('IndexerLogService', () => {
  let service: IndexerLogService;

  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    service = new IndexerLogService();
  });

  it('should record entries with their account, root path and message', () => {
    service.addLogEntry(1, 2, 'hello');

    expect(service.logs).toHaveLength(1);
    expect(service.logs[0]).toMatchObject({ accountId: 1, rootPathId: 2, message: 'hello' });
    expect(service.logs[0]?.date).toBeInstanceOf(Date);
  });

  it('should discard the oldest entries beyond the size limit', () => {
    service.setLogSizeLimit(3);
    for (let i = 1; i <= 5; i += 1) {
      service.addLogEntry(0, 0, `entry ${i}`);
    }

    expect(service.logs.map((entry) => entry.message)).toEqual(['entry 3', 'entry 4', 'entry 5']);
  });

  it('should trim existing entries when the size limit is lowered', () => {
    for (let i = 1; i <= 5; i += 1) {
      service.addLogEntry(0, 0, `entry ${i}`);
    }

    service.setLogSizeLimit(2);

    expect(service.logs.map((entry) => entry.message)).toEqual(['entry 4', 'entry 5']);
  });
});
