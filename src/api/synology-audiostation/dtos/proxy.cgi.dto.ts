/* eslint-disable max-classes-per-file */
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';
import { SynologyApiEnum, SynologyMethodEnum } from '../synology.enums';
import { SynologyBody } from '../synology.request.dto';
import { SynologySuccessResponseDto } from '../synology.response.dto';
import { Transform } from 'class-transformer';

export class SynologyProxySongInfoBodyDto extends OmitType(
  SynologyBody({
    expectedApi: SynologyApiEnum.PROXY,
    expectedMethod: SynologyMethodEnum.GET_SONG_INFO,
  }),
  ['library'] as const,
) {
  /**
   * The SHOUTcast stream ID
   */
  @IsInt()
  @Transform(({ value }) => Number.parseInt(value.split('_').pop(), 10))
  declare stream_id: number;
}

export class SynologyProxyStreamQueryDto extends OmitType(
  SynologyBody({
    expectedApi: SynologyApiEnum.PROXY,
    expectedMethod: SynologyMethodEnum.STREAM,
  }),
  ['library'] as const,
) {
  /**
   * The SHOUTcast stream ID
   */
  @IsInt()
  @Transform(({ value }) => Number.parseInt(value.split('_').pop(), 10))
  declare stream_id: number;
}

export class SynologyProxyStreamInfoBodyDto extends OmitType(
  SynologyBody({
    expectedApi: SynologyApiEnum.PROXY,
    expectedMethod: SynologyMethodEnum.GET_STREAM_ID,
  }),
  ['library'] as const,
) {
  /**
   * The title of the SHOUTcast radio station
   */
  @IsString()
  declare id: string;
}

export class SynologyProxyDeleteSongInfoBodyDto extends OmitType(
  SynologyBody({
    expectedApi: SynologyApiEnum.PROXY,
    expectedMethod: SynologyMethodEnum.DELETE_SONG_INFO,
  }),
  ['library'] as const,
) {
  /**
   * The array index of the song to delete from the SHOUTcast radio station
   */
  @IsInt()
  @Transform(({ value }) => Number.parseInt(value.split('_').pop(), 10))
  declare stream_id: number;
}

export class SynologyProxySongInfoResponseDto extends SynologySuccessResponseDto {
  @ApiProperty()
  declare data: {
    title: string;
  };
}

export class SynologyProxyStreamInfoResponseDto extends SynologySuccessResponseDto {
  @ApiProperty()
  declare data: {
    stream_id: string;
    format: string;
  };
}
