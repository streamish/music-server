// eslint-disable-next-line max-classes-per-file
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, ValidateIf } from 'class-validator';
import { SubsonicAlbumListType } from '../subsonic.enums';

export class SubsonicAlbumListQueryDto {
  @ApiProperty({ enum: SubsonicAlbumListType, enumName: 'SubsonicAlbumListType' })
  @IsEnum(SubsonicAlbumListType)
  declare type: SubsonicAlbumListType;

  @IsInt()
  @IsOptional()
  declare size?: number;

  @IsInt()
  @IsOptional()
  declare offset?: number;

  @IsInt()
  @ValidateIf((object) => object.type === SubsonicAlbumListType.BY_YEAR)
  @IsOptional()
  declare fromYear?: number;

  @IsInt()
  @ValidateIf((object) => object.type === SubsonicAlbumListType.BY_YEAR)
  @IsOptional()
  declare toYear?: number;

  @IsString()
  @ValidateIf((object) => object.type === SubsonicAlbumListType.BY_GENRE)
  @IsOptional()
  declare genre?: string;

  @IsInt()
  @IsOptional()
  declare musicFolderId?: number;
}

export class SubsonicAlbumList2QueryDto extends OmitType(SubsonicAlbumListQueryDto, ['musicFolderId'] as const) {}
