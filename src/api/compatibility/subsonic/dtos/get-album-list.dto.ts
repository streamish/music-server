// eslint-disable-next-line max-classes-per-file
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, ValidateIf } from 'class-validator';
import { SubsonicAlbumDto } from './album.dto';
import { SubsonicAlbumListTypeEnum } from '../subsonic.enums';
import { SubsonicResponseDto } from '../subsonic.dto';

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

export class SubsonicAlbumDataDto {
  @ApiProperty({ type: SubsonicAlbumDto, isArray: true })
  declare album: SubsonicAlbumDto[];
}

export class SubsonicAlbumListResponseDto extends SubsonicResponseDto {
  @ApiProperty({ type: SubsonicAlbumDataDto })
  declare albumList: SubsonicAlbumDataDto;
}

export class SubsonicAlbumList2ResponseDto extends SubsonicResponseDto {
  @ApiProperty({ type: SubsonicAlbumDataDto })
  declare albumList2: SubsonicAlbumDataDto;
}
