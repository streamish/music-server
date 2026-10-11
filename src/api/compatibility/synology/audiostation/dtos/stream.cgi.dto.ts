/* eslint-disable max-classes-per-file */
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { FileTypeEnum } from 'src/types/enums';
import { IsEnum, IsInt, IsString } from 'class-validator';
import { SynologyApiEnum, SynologyMethodEnum } from '../synology.enums';
import { SynologyBody } from '../synology.request.dto';
import { Transform } from 'class-transformer';

export class StreamCgiQueryDto extends OmitType(
  SynologyBody({
    expectedApi: SynologyApiEnum.STREAM,
    expectedMethod: SynologyMethodEnum.STREAM,
  }),
  ['library'],
) {
  /**
   * The ID of the song.  Synology uses a string with a prefix and the numeric ID, this software
   * only uses the numeric ID so a `music_` prefix is added for Synology, and then stripped off
   * by the `class-transformer` library.
   */
  @IsInt()
  @Transform(({ obj }) => Number.parseInt(obj.id.split('_').pop(), 10))
  declare id: number;
}

export class StreamDto {
  /**
   * The codec of the audio file, e.g. 'flac'
   */
  @ApiProperty({
    enum: FileTypeEnum,
    enumName: 'FileTypeEnum',
    example: FileTypeEnum.FLAC,
  })
  @IsEnum(FileTypeEnum)
  declare codec: FileTypeEnum;

  /**
   * The size of the audio file in bytes
   */
  @IsInt()
  declare fileSize: number;

  /**
   * The path to the audio file on the server
   */
  @IsString()
  declare path: string;
}
