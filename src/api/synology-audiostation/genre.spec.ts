import { SynologyApi, createSynologyApi } from '../../test-helper.synology';
import { beforeAll, describe, expect, it } from '@jest/globals';
import { components } from '../../types/api-schema';

describe('/webapi/AudioStation/genre.cgi', () => {
  let synologyApi: SynologyApi;

  async function listGenres(offset = 0, limit = 0) {
    const { data, error } = await synologyApi.listGenres(offset, limit);
    const typedData = data as components['schemas']['SynologyGenreResponseDto'];
    return { data: typedData, error, genres: typedData?.data.genres || [], total: typedData?.data.total || 0 };
  }

  async function listDefaultGenres() {
    const { data, error } = await synologyApi.listDefaultGenres();
    const typedData = data as components['schemas']['SynologyDefaultGenreResponseDto'];
    return {
      data: typedData,
      error,
      defaultGenres: typedData?.data.default_genres || [],
      total: typedData?.data.total || 0,
    };
  }

  beforeAll(async () => {
    synologyApi = await createSynologyApi();
  });

  it('should list all genres with no filters', async () => {
    const { genres, total } = await listGenres();
    expect(total).toBe(11);
    expect(genres.length).toBe(11);
    expect(genres[0]?.name).toBe('Acid');
    expect(genres[1]?.name).toBe('Acid Jazz');
    expect(genres[2]?.name).toBe('Acoustic');
    expect(genres[3]?.name).toBe('Ballad');
    expect(genres[4]?.name).toBe('Bebob');
    expect(genres[5]?.name).toBe('Bluegrass');
    expect(genres[6]?.name).toBe('Chanson');
    expect(genres[7]?.name).toBe('Chorus');
    expect(genres[8]?.name).toBe('Dance');
    expect(genres[9]?.name).toBe('EDM');
    expect(genres[10]?.name).toBe('Rock');
  });

  it('should paginate all genres with no filters', async () => {
    // page 1
    const { genres, total } = await listGenres(0, 3);
    expect(total).toBe(11);
    expect(genres.length).toBe(3);
    expect(genres[0]?.name).toBe('Acid');
    expect(genres[1]?.name).toBe('Acid Jazz');
    expect(genres[2]?.name).toBe('Acoustic');
    // page 2
    const { genres: genres2, total: total2 } = await listGenres(3, 3);
    expect(total2).toBe(11);
    expect(genres2.length).toBe(3);
    expect(genres2[0]?.name).toBe('Ballad');
    expect(genres2[1]?.name).toBe('Bebob');
    expect(genres2[2]?.name).toBe('Bluegrass');
    // page 3
    const { genres: genres3, total: total3 } = await listGenres(6, 3);
    expect(total3).toBe(11);
    expect(genres3.length).toBe(3);
    expect(genres3[0]?.name).toBe('Chanson');
    expect(genres3[1]?.name).toBe('Chorus');
    expect(genres3[2]?.name).toBe('Dance');
    // page 4
    const { genres: genres4, total: total4 } = await listGenres(9, 3);
    expect(total4).toBe(11);
    expect(genres4.length).toBe(2);
    expect(genres4[0]?.name).toBe('EDM');
    expect(genres4[1]?.name).toBe('Rock');
  });

  it('should list all default genres', async () => {
    const { defaultGenres, total } = await listDefaultGenres();
    expect(total).toBe(13);
    expect(defaultGenres.length).toBe(13);
    expect(defaultGenres[0]?.name).toBe('Ballad');
    expect(defaultGenres[1]?.name).toBe('Blues/Soul');
    expect(defaultGenres[2]?.name).toBe('Classical');
    expect(defaultGenres[3]?.name).toBe('Country');
    expect(defaultGenres[4]?.name).toBe('EDM/Dance');
    expect(defaultGenres[5]?.name).toBe('Funk');
    expect(defaultGenres[6]?.name).toBe('Hip-Hop/R&B');
    expect(defaultGenres[7]?.name).toBe('Jazz');
    expect(defaultGenres[8]?.name).toBe('Pop');
    expect(defaultGenres[9]?.name).toBe('Reggae');
    expect(defaultGenres[10]?.name).toBe('Rock/Metal');
    expect(defaultGenres[11]?.name).toBe('Soundtrack');
    expect(defaultGenres[12]?.name).toBe('World/Spiritual');
  });
});
