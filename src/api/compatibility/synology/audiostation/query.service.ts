import { Injectable } from '@nestjs/common';

@Injectable()
export class SynologyQueryService {
  // eslint-disable-next-line class-methods-use-this
  getApiCapabilities(): unknown {
    return {
      'SYNO.API.Auth': {
        maxVersion: 7,
        minVersion: 1,
        path: 'entry.cgi',
      },
      'SYNO.API.Auth.Key': {
        maxVersion: 7,
        minVersion: 7,
        path: 'entry.cgi',
        requestFormat: 'JSON',
      },
      'SYNO.API.Auth.Key.Code': {
        maxVersion: 7,
        minVersion: 7,
        path: 'entry.cgi',
        requestFormat: 'JSON',
      },
      'SYNO.API.Auth.RedirectURI': {
        maxVersion: 1,
        minVersion: 1,
        path: 'entry.cgi',
        requestFormat: 'JSON',
      },
      'SYNO.API.Auth.Type': {
        maxVersion: 1,
        minVersion: 1,
        path: 'entry.cgi',
        requestFormat: 'JSON',
      },
      'SYNO.API.Auth.UIConfig': {
        maxVersion: 1,
        minVersion: 1,
        path: 'entry.cgi',
        requestFormat: 'JSON',
      },
      'SYNO.API.Encryption': {
        maxVersion: 1,
        minVersion: 1,
        path: 'entry.cgi',
        requestFormat: 'JSON',
      },
      'SYNO.API.Info': {
        maxVersion: 1,
        minVersion: 1,
        path: 'entry.cgi',
        requestFormat: 'JSON',
      },
      'SYNO.API.OTP': {
        maxVersion: 1,
        minVersion: 1,
        path: 'otp.cgi',
      },
      'SYNO.AudioPlayer': {
        maxVersion: 2,
        minVersion: 2,
        path: 'entry.cgi',
        requestFormat: 'JSON',
      },
      'SYNO.AudioPlayer.Stream': {
        maxVersion: 2,
        minVersion: 2,
        path: 'entry.cgi',
        requestFormat: 'JSON',
      },
      'SYNO.AudioStation.Album': {
        maxVersion: 3,
        minVersion: 1,
        path: 'AudioStation/album.cgi',
      },
      'SYNO.AudioStation.Artist': {
        maxVersion: 4,
        minVersion: 1,
        path: 'AudioStation/artist.cgi',
      },
      'SYNO.AudioStation.Browse.Playlist': {
        maxVersion: 1,
        minVersion: 1,
        path: 'entry.cgi',
        requestFormat: 'JSON',
      },
      'SYNO.AudioStation.Composer': {
        maxVersion: 2,
        minVersion: 1,
        path: 'AudioStation/composer.cgi',
      },
      'SYNO.AudioStation.Cover': {
        maxVersion: 3,
        minVersion: 1,
        path: 'AudioStation/cover.cgi',
      },
      'SYNO.AudioStation.Download': {
        maxVersion: 1,
        minVersion: 1,
        path: 'AudioStation/download.cgi',
      },
      'SYNO.AudioStation.Folder': {
        maxVersion: 3,
        minVersion: 1,
        path: 'AudioStation/folder.cgi',
      },
      'SYNO.AudioStation.Genre': {
        maxVersion: 3,
        minVersion: 1,
        path: 'AudioStation/genre.cgi',
      },
      'SYNO.AudioStation.Info': {
        maxVersion: 6,
        minVersion: 1,
        path: 'AudioStation/info.cgi',
      },
      'SYNO.AudioStation.Lyrics': {
        maxVersion: 2,
        minVersion: 1,
        path: 'AudioStation/lyrics.cgi',
      },
      'SYNO.AudioStation.LyricsSearch': {
        maxVersion: 2,
        minVersion: 1,
        path: 'AudioStation/lyrics_search.cgi',
      },
      'SYNO.AudioStation.MediaServer': {
        maxVersion: 1,
        minVersion: 1,
        path: 'AudioStation/media_server.cgi',
      },
      'SYNO.AudioStation.Pin': {
        maxVersion: 1,
        minVersion: 1,
        path: 'entry.cgi',
        requestFormat: 'JSON',
      },
      'SYNO.AudioStation.Playlist': {
        maxVersion: 3,
        minVersion: 1,
        path: 'AudioStation/playlist.cgi',
      },
      'SYNO.AudioStation.Proxy': {
        maxVersion: 2,
        minVersion: 1,
        path: 'AudioStation/proxy.cgi',
      },
      'SYNO.AudioStation.Radio': {
        maxVersion: 2,
        minVersion: 1,
        path: 'AudioStation/radio.cgi',
      },
      'SYNO.AudioStation.RemotePlayer': {
        maxVersion: 3,
        minVersion: 1,
        path: 'AudioStation/remote_player.cgi',
      },
      'SYNO.AudioStation.RemotePlayerStatus': {
        maxVersion: 2,
        minVersion: 1,
        path: 'AudioStation/remote_player_status.cgi',
      },
      'SYNO.AudioStation.Search': {
        maxVersion: 1,
        minVersion: 1,
        path: 'AudioStation/search.cgi',
      },
      'SYNO.AudioStation.Song': {
        maxVersion: 3,
        minVersion: 1,
        path: 'AudioStation/song.cgi',
      },
      'SYNO.AudioStation.Stream': {
        maxVersion: 2,
        minVersion: 1,
        path: 'AudioStation/stream.cgi',
      },
      'SYNO.AudioStation.Tag': {
        maxVersion: 1,
        minVersion: 1,
        path: 'entry.cgi',
        requestFormat: 'JSON',
      },
      'SYNO.AudioStation.VoiceAssistant.Browse': {
        maxVersion: 1,
        minVersion: 1,
        path: 'entry.cgi',
        requestFormat: 'JSON',
      },
      'SYNO.AudioStation.VoiceAssistant.Challenge': {
        maxVersion: 1,
        minVersion: 1,
        path: 'entry.cgi',
        requestFormat: 'JSON',
      },
      'SYNO.AudioStation.VoiceAssistant.Info': {
        maxVersion: 1,
        minVersion: 1,
        path: 'entry.cgi',
        requestFormat: 'JSON',
      },
      'SYNO.AudioStation.VoiceAssistant.Stream': {
        maxVersion: 1,
        minVersion: 1,
        path: 'entry.cgi',
        requestFormat: 'JSON',
      },
      'SYNO.AudioStation.WebPlayer': {
        maxVersion: 1,
        minVersion: 1,
        path: 'AudioStation/web_player.cgi',
      },
      'SYNO.Auth.ForgotPwd': {
        maxVersion: 1,
        minVersion: 1,
        path: 'entry.cgi',
        requestFormat: 'JSON',
      },
      'SYNO.Auth.RescueEmail': {
        maxVersion: 1,
        minVersion: 1,
        path: 'entry.cgi',
        requestFormat: 'JSON',
      },
    };
  }
}
