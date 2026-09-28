import { SynologyApi, createSynologyApi } from '../../test-helper.synology';
import { beforeAll, describe, expect, it } from '@jest/globals';
import { components } from '../../types/api-schema';

describe('/webapi/AudioStation/proxy.cgi', () => {
  let synologyApi: SynologyApi;
  let station: components['schemas']['SynologyRadioItemDto'];

  async function getStreamId(stationId: string) {
    const { data, error } = await synologyApi.getStreamId(stationId);
    const typedData = data as components['schemas']['SynologyProxyStreamInfoResponseDto'];
    return {
      data: typedData,
      error,
      streamId: typedData?.data.stream_id,
    };
  }

  beforeAll(async () => {
    synologyApi = await createSynologyApi();
    // skip this test in CI because GitHub Actions can't proxy the stream
    if (process.env.CI) {
      return;
    }
    const { data } = await synologyApi.listStationsInContainer('SHOUTcast_genre_Blues');
    const typedData = data as components['schemas']['SynologyRadioItemResponseDto'];
    station = typedData.data.radios[0]!;
  });

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
    const { data } = await synologyApi.getStreamSongInfo(streamId);
    const typedData = data as components['schemas']['SynologyProxySongInfoResponseDto'];
    expect(typedData?.data.title).toBeDefined();
  });
});
