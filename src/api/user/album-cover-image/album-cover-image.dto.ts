import { ErrorCodes } from 'src/constants/error-codes';
import { IdQueryDtoFactory } from 'src/api/request.dto';
import { IsInt, Max, Min } from 'class-validator';

export class UserAlbumCoverImageQueryDto extends IdQueryDtoFactory(ErrorCodes.INVALID_ALBUM_ID_ERROR) {
  /**
   * The width/height size of the image in pixels
   */
  @IsInt({ message: ErrorCodes.INVALID_COVER_SIZE_ERROR })
  @Min(100, { message: ErrorCodes.INVALID_COVER_SIZE_ERROR })
  @Max(1000, { message: ErrorCodes.INVALID_COVER_SIZE_ERROR })
  declare size: number;
}
