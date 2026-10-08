/* eslint-disable max-classes-per-file */
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsString } from 'class-validator';
import { SynologyApiEnum, SynologyLibraryEnum, SynologyMethodEnum } from '../synology.enums';
import { SynologyBody } from '../synology.request.dto';
import { SynologySuccessResponseDto } from '../synology.response.dto';

export class SynologyInfoBodyDto extends OmitType(
  SynologyBody({
    expectedApi: SynologyApiEnum.AUDIOSTATION_INFO,
    expectedMethod: SynologyMethodEnum.GET_INFO,
  }),
  ['library'],
) {}

class SynologyInfoAmeStatus {
  @IsInt()
  declare ame_major_version: number;

  @IsBoolean()
  declare has_aac: boolean;

  @IsBoolean()
  declare has_license: boolean;

  @IsBoolean()
  declare is_aac_activated: boolean;

  @IsBoolean()
  declare is_ame_broken: boolean;

  @IsBoolean()
  declare is_ame_install: boolean;

  @IsBoolean()
  declare need_aac_transcoding: boolean;
}

class SynologyInfoPrivilege {
  @IsBoolean()
  declare playlist_edit: boolean;

  @IsBoolean()
  declare remote_player: boolean;

  @IsBoolean()
  declare sharing: boolean;

  @IsBoolean()
  declare tag_edit: boolean;

  @IsBoolean()
  declare upnp_browse: boolean;
}

class SynologyInfoSettings {
  @IsBoolean()
  declare audio_show_virtual_library: boolean;

  @IsBoolean()
  declare disable_upnp: boolean;

  @IsBoolean()
  declare enable_download: boolean;

  @IsBoolean()
  declare prefer_using_html5: boolean;

  @IsBoolean()
  declare transcode_to_mp3: boolean;
}

export class SynologyInfoDataDto {
  @ApiProperty({
    type: SynologyInfoAmeStatus,
  })
  declare ame_status: SynologyInfoAmeStatus;

  @IsEnum(SynologyLibraryEnum)
  declare browse_personal_library: SynologyLibraryEnum;

  @IsBoolean()
  declare dsd_decode_capability: boolean;

  @IsBoolean()
  declare enable_equalizer: boolean;

  @IsBoolean()
  declare enable_personal_library: boolean;

  @IsBoolean()
  declare enable_user_home: boolean;

  @IsBoolean()
  declare has_music_share: boolean;

  @IsBoolean()
  declare is_manager: boolean;

  @IsInt()
  declare playing_queue_max: number;

  @ApiProperty({
    type: SynologyInfoPrivilege,
  })
  declare privilege: SynologyInfoPrivilege;

  @IsBoolean()
  declare remote_controller: boolean;

  @IsBoolean()
  declare same_subnet: boolean;

  @IsString()
  declare serial_number: string;

  @ApiProperty({
    type: SynologyInfoSettings,
  })
  declare settings: SynologyInfoSettings;

  @IsString()
  declare sid: string;

  @IsBoolean()
  declare support_bluetooth: boolean;

  @IsBoolean()
  declare support_usb: boolean;

  @IsBoolean()
  declare support_virtual_library: boolean;

  @IsString({ each: true })
  declare transcode_capability: string[];

  @IsInt()
  declare version: number;

  @IsString()
  declare version_string: string;
}

export class SynologyInfoResponseDto extends SynologySuccessResponseDto {
  @ApiProperty({
    type: SynologyInfoDataDto,
  })
  declare data: SynologyInfoDataDto;
}
