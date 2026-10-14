import { Module } from '@nestjs/common';
import { QnapModule } from './qnap/music-station/qnap.module';
import { SynologyModule } from './synology/audiostation/synology.module';

@Module({
  imports: [
    ...(process.env.QNAP_MUSIC_STATION_ENABLED ? [QnapModule] : []),
    ...(process.env.SYNOLOGY_AUDIOSTATION_ENABLED ? [SynologyModule] : []),
  ],
})
export class ApiCompatibilityModule {}
