/* eslint-disable max-classes-per-file */
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsEnum, IsInt, IsString } from 'class-validator';
import { SynologyApiEnum, SynologyMethodEnum } from '../synology.enums';
import { SynologyBody } from '../synology.request.dto';
import { SynologySuccessResponseDto } from '../synology.response.dto';

export class SynologyEntryCertificateBodyDto extends OmitType(
  SynologyBody({
    expectedApi: SynologyApiEnum.ENCRYPTION,
    expectedMethod: SynologyMethodEnum.GET_INFO,
  }),
  ['library'],
) {}

export class SynologyEntryCertificateDataDto {
  @ApiProperty({
    example: '__cIpHeRtExT',
  })
  @IsString()
  @IsEnum(['__cIpHeRtExT'])
  declare cipherkey: string;

  @ApiProperty({
    example: '__cIpHeRtOkEn',
  })
  @IsString()
  @IsEnum(['__cIpHeRtOkEn'])
  declare ciphertoken: string;

  /**
   * RSA-4096 public key
   */
  @IsString()
  declare public_key: string;

  /**
   * UNIX-timestamp in seconds
   */
  @IsInt()
  declare server_time: number;
}

export class SynologyEntryCertificateResponseDto extends SynologySuccessResponseDto {
  @ApiProperty({
    type: SynologyEntryCertificateDataDto,
  })
  declare data: SynologyEntryCertificateDataDto;
}
