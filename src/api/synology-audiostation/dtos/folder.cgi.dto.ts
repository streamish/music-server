/* eslint-disable max-classes-per-file */
import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { ContentTypeEnum } from 'src/types/enums';
import { IsBoolean, IsEnum, IsInt, IsString } from 'class-validator';
import { SynologyApiEnum, SynologyLibraryEnum, SynologyMethodEnum } from '../synology.enums';
import { SynologyBodyWithPagination } from '../synology.request.dto';
import { SynologyPaginationResponseDto, SynologySuccessResponseDto } from '../synology.response.dto';
import { SynologySongDto } from './song.cgi.dto';
import { Transform } from 'class-transformer';

class FolderBodyDto extends SynologyBodyWithPagination({
  expectedApi: SynologyApiEnum.FOLDER,
  expectedMethod: SynologyMethodEnum.LIST,
  expectedLibrary: SynologyLibraryEnum.ALL,
}) {}

export class SynologyRootFolderBodyDto extends FolderBodyDto {}

export class SynologyFolderBodyDto extends FolderBodyDto {
  /**
   * The ID of the folder.  Synology uses a string with a prefix and the numeric ID, this software
   * only uses the path so an ID will arrive like `/music/artist/album/cd1`
   */
  @Transform(({ value }) => Number(value.split('_').pop()))
  @IsInt()
  declare id: number;

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  declare recursive: boolean;

  @IsString()
  declare additional: string;
}

export class SynologyFolderDto {
  /**
   * The ID value for the folder, for a root path this will be `root_n` otherwise `dir_n` where `n`
   * is the numeric ID of the folder.
   */
  declare id: string;

  /**
   * Indicates whether the folder is a personal folder or a shared folder, however there is no
   * shared folder equivalent in this software so this value is ignored for now but defined to
   * match the Synology API.
   */
  declare is_personal: boolean;

  /**
   * The fully-qualified path to the file
   */
  declare path: string;

  /**
   * The final segment of the folder path
   */
  declare title: string;

  /**
   * The content type, folder or file
   */
  @ApiProperty({
    enum: ContentTypeEnum,
    enumName: 'ContentTypeEnum',
  })
  @IsEnum(ContentTypeEnum)
  declare type: ContentTypeEnum;
}

export class SynologyFolderDataDto extends SynologyPaginationResponseDto {
  /**
   * The number of folders included in the response, this may be less than the total number if there is
   * a combination of folders and files in the directory.
   */
  @IsInt()
  declare folder_total: number;

  /**
   * The ID of the folder currently in scope.  Synology uses a string with a prefix and the numeric ID, this
   * software only uses the path since folders are not tracked separately they are derived from the file paths.
   */
  @IsString()
  declare id?: string;

  @ApiProperty({
    isArray: true,
    type: 'array',
    items: {
      oneOf: [{ $ref: getSchemaPath(SynologyFolderDto) }, { $ref: getSchemaPath(SynologySongDto) }],
    },
  })
  declare items: (SynologyFolderDto | SynologySongDto)[];
}

export class SynologyFolderResponseDto extends SynologySuccessResponseDto {
  @ApiProperty({
    type: SynologyFolderDataDto,
  })
  declare data: SynologyFolderDataDto;
}
