import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsInt, IsString } from 'class-validator';

export class LibraryAssociationDto {
  /**
   * The date the person, group or genre was added to the library.
   */
  @ApiProperty({
    type: Date,
    format: 'date-time',
  })
  @IsDate()
  declare createdAt: Date;

  /**
   * The favorite ID reference for the album if it exists.
   */
  @IsInt()
  declare favoriteId?: number;

  /**
   * The internally-generated unique ID of the person, group or genre.
   */
  @IsInt()
  declare id: number;

  /**
   * The name of the associated person, group or genre.
   */
  @IsString()
  declare name: string;
}
