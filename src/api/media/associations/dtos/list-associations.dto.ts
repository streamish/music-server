/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { LibraryAssociationDto, LibraryAssociationWithTracksDto } from 'src/library/dtos';
import { PaginatedResponseDataDto } from 'src/api/response.dto';

export class ListAssociationsResponseDto extends PaginatedResponseDataDto {
  @ApiProperty({
    type: LibraryAssociationDto,
    isArray: true,
  })
  declare associations: LibraryAssociationDto[];
}

export class ListAssociationsWithTracksResponseDto extends PaginatedResponseDataDto {
  @ApiProperty({
    type: LibraryAssociationWithTracksDto,
    isArray: true,
  })
  declare associations: LibraryAssociationWithTracksDto[];
}
