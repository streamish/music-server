import { type SynologyApiClient, createSynologyApi } from '../../test-helper';
import { SynologyApiEnum, SynologyMethodEnum, type components } from '../../types/api-schema';
import { beforeAll, describe, expect, it } from '@jest/globals';

describe('/webapi/AudioStation/proxy.cgi', () => {
  let api: Awaited<SynologyApiClient>;
  let station: components['schemas']['SynologyRadioItemDto'];

  beforeAll(async () => {
    api = await createSynologyApi();
    // skip this test in CI because GitHub Actions can't proxy the stream
    if (process.env.CI) {
      return;
    }
    const { data } = await api.POST('/webapi/AudioStation/radio.cgi', {
      body: {
        api: SynologyApiEnum.SYNO_AudioStation_Radio,
        container: 'SHOUTcast_genre_Blues',
        method: SynologyMethodEnum.list,
        version: 1,
        offset: 0,
        limit: 100_000,
      },
    });
    const typedData = data as components['schemas']['SynologyRadioItemResponseDto'];
    station = typedData.data.radios[0]!;
  });

  async function getStreamId(stationId: string) {
    const { data, error } = await api.POST('/webapi/AudioStation/proxy.cgi', {
      body: {
        api: SynologyApiEnum.SYNO_AudioStation_Proxy,
        method: SynologyMethodEnum.getstreamid,
        version: 1,
        id: stationId,
      },
    });
    const typedData = data as components['schemas']['SynologyProxyStreamInfoResponseDto'];
    return {
      data: typedData,
      error,
      streamId: typedData?.data.stream_id,
    };
  }

  async function getStreamSongInfo(streamId: string) {
    return api.POST('/webapi/AudioStation/proxy.cgi', {
      body: {
        api: SynologyApiEnum.SYNO_AudioStation_Proxy,
        method: SynologyMethodEnum.getsonginfo,
        version: 1,
        // this value is transformed into a number so the posted payload mismatches the type
        // also this ID value is dependent on no other stream having been created, there currently
        // isn't a mechanism for fetching the actual ID which might be 2, 3 etc.
        stream_id: streamId as unknown as number,
      },
    });
  }

  it('should create a stream ID', async () => {
    // skip this test in CI because GitHub Actions can't proxy the stream
    if (process.env.CI) {
      expect(true).toBe(true);
      return;
    }
    const { streamId } = await getStreamId(station.id);
    expect(streamId).toBeDefined();
  });

  it('should return current playing information', async () => {
    // skip this test in CI because GitHub Actions can't proxy the stream
    if (process.env.CI) {
      expect(true).toBe(true);
      return;
    }
    // ensure the stream exists
    const { streamId } = await getStreamId(station.id);
    if (!streamId) {
      throw new Error('Stream ID not found for station');
    }
    const { data } = await getStreamSongInfo(streamId);
    const typedData = data as components['schemas']['SynologyProxySongInfoResponseDto'];
    expect(typedData?.data.title).toBeDefined();
  });
});
