import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { SynologyApiEnum, SynologyMethodEnum, SynologyQueryEnum } from '../synology.enums';
import { SynologyBody } from '../synology.request.dto';

export class QueryCgiBodyDto extends OmitType(
  SynologyBody({
    expectedApi: SynologyApiEnum.INFO,
    expectedMethod: SynologyMethodEnum.QUERY,
  }),
  ['library'],
) {
  /**
   * It is not clear what Synology uses this for, but requests to `query.cgi` and `entry.cgi` return
   * hardcoded responses so this value is ignored for now but defined to match the Synology API.
   */
  @ApiProperty({
    enum: SynologyQueryEnum,
    enumName: 'SynologyQueryEnum',
    required: false,
  })
  @IsOptional()
  @IsEnum(SynologyQueryEnum)
  declare query?: SynologyQueryEnum;
}
