// eslint-disable-next-line max-classes-per-file
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, ValidateIf } from 'class-validator';
import { SubsonicAlbumListTypeEnum } from '../subsonic.enums';
import { SubsonicResponseDto, SubsonicResponseObject } from '../subsonic.dto';

export class SubsonicAlbumListQueryDto {
  @ApiProperty({ enum: SubsonicAlbumListTypeEnum, enumName: 'SubsonicAlbumListTypeEnum' })
  @IsEnum(SubsonicAlbumListTypeEnum)
  declare type: SubsonicAlbumListTypeEnum;

  @IsInt()
  @IsOptional()
  declare size?: number;

  @IsInt()
  @IsOptional()
  declare offset?: number;

  @IsInt()
  @ValidateIf((object) => object.type === SubsonicAlbumListTypeEnum.BY_YEAR)
  @IsOptional()
  declare fromYear?: number;

  @IsInt()
  @ValidateIf((object) => object.type === SubsonicAlbumListTypeEnum.BY_YEAR)
  @IsOptional()
  declare toYear?: number;

  @IsString()
  @ValidateIf((object) => object.type === SubsonicAlbumListTypeEnum.BY_GENRE)
  @IsOptional()
  declare genre?: string;

  @IsInt()
  @IsOptional()
  declare musicFolderId?: number;
}

export class SubsonicAlbumList2QueryDto extends OmitType(SubsonicAlbumListQueryDto, ['musicFolderId'] as const) {}

export class SubsonicAlbumListResponseDto extends SubsonicResponseDto {
  declare albumList: { album: SubsonicResponseObject[] };
}

export class SubsonicAlbumList2ResponseDto extends SubsonicResponseDto {
  declare albumList2: { album: SubsonicResponseObject[] };
}
