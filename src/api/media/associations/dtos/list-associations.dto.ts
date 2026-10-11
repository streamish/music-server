/* eslint-disable max-classes-per-file */
import { LibraryAssociationDto, LibraryAssociationWithTracksDto } from 'src/library/dtos';
import { createPaginatedArrayResponseDto } from 'src/api/response.dto';

export class ListAssociationsResponseDto extends createPaginatedArrayResponseDto(
  'associations',
  LibraryAssociationDto,
) {}

export class ListAssociationsWithTracksResponseDto extends createPaginatedArrayResponseDto(
  'associations',
  LibraryAssociationWithTracksDto,
) {}
