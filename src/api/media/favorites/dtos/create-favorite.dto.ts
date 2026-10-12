import { IsInt } from 'class-validator';
import { SuccessResponseDto } from 'src/api/response.dto';

export class CreateFavoriteResponseDto extends SuccessResponseDto {
  @IsInt()
  declare favoriteId: number;
}
