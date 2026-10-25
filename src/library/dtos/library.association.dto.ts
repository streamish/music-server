import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsInt, IsString } from 'class-validator';

export class LibraryAssociationDto {
  /**
   * The date the person or group was added to the library
   */
  @ApiProperty({
    type: Date,
    format: 'date-time',
  })
  @IsDate()
  declare createdAt: Date;

  /**
   * The favorite data for the album if it exists
   */
  @IsInt()
  declare favoriteId?: number;

  /**
   * The internally-generated unique ID of the person or group
   */
  @IsInt()
  declare id: number;

  /**
   * The name of the associated person or group.
   */
  @IsString()
  declare name: string;
}
