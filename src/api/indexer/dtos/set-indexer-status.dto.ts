import { ErrorCodes } from 'src/constants/error-codes';
import { IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class SetIndexerStatusBodyDto {
  /**
   * Whether the scanner should be enabled or disabled
   */
  @IsBoolean({ message: ErrorCodes.INVALID_ENABLED_ERROR })
  @Type(() => Boolean)
  declare enabled: boolean;
}
