import { Injectable } from '@nestjs/common';
import { SynologyInfoDataDto } from './dtos/info.cgi.dto';
import { SynologyLibraryEnum } from './synology.enums';

@Injectable()
export class SynologyInfoService {
  // eslint-disable-next-line class-methods-use-this
  async getConfiguration(sessionTokenHash: string): Promise<SynologyInfoDataDto> {
    return {
      ame_status: {
        ame_major_version: 0,
        has_aac: false,
        has_license: false,
        is_aac_activated: false,
        is_ame_broken: false,
        is_ame_install: false,
        need_aac_transcoding: false,
      },
      browse_personal_library: SynologyLibraryEnum.ALL,
      dsd_decode_capability: true,
      enable_equalizer: false,
      enable_personal_library: false,
      enable_user_home: false,
      has_music_share: true,
      is_manager: false,
      playing_queue_max: 8192,
      privilege: {
        playlist_edit: false,
        remote_player: false,
        sharing: false,
        tag_edit: false,
        upnp_browse: false,
      },
      remote_controller: false,
      same_subnet: false,
      serial_number: '0000000000000',
      settings: {
        audio_show_virtual_library: true,
        disable_upnp: false,
        enable_download: false,
        prefer_using_html5: true,
        transcode_to_mp3: true,
      },
      sid: sessionTokenHash,
      support_bluetooth: false,
      support_usb: false,
      support_virtual_library: true,
      transcode_capability: ['wav', 'mp3'],
      version: 6006,
      version_string: '7.2.1-6006',
    };
  }
}
