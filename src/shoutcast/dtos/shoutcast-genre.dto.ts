import { IsInt, IsString } from 'class-validator';

export class ShoutcastGenreDto {
  @IsInt()
  declare id: number;

  @IsString()
  declare name: string;
}
