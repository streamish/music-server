/* eslint-disable max-classes-per-file */
import { IsString } from 'class-validator';
import { OmitType } from '@nestjs/swagger';
import { SynologyApiEnum, SynologyMethodEnum } from '../synology.enums';
import { SynologyBody } from '../synology.request.dto';
import { SynologySuccessResponseDto } from '../synology.response.dto';

export class SynologyEntryLogoutBodyDto extends OmitType(
  SynologyBody({
    expectedApi: SynologyApiEnum.AUTH,
    expectedMethod: SynologyMethodEnum.LOGOUT,
  }),
  ['library'],
) {
  /**
   * The session ID to terminate.
   */
  @IsString()
  declare _sid: string;
}

export class SynologyEntryLogoutResponseDto extends SynologySuccessResponseDto {}
