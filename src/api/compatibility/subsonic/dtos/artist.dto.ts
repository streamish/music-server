// eslint-disable-next-line max-classes-per-file
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubsonicArtistAlbumDto {
  @ApiProperty({ type: String })
  declare id: string;

  @ApiProperty({ type: String })
  declare name: string;
}

export class SubsonicArtistDto {
  @ApiPropertyOptional({ type: SubsonicArtistAlbumDto, isArray: true })
  declare album?: SubsonicArtistAlbumDto[];

  @ApiPropertyOptional({ type: 'integer' })
  declare albumCount?: number;

  @ApiProperty({ type: String })
  declare coverArt: string;

  @ApiProperty({ type: String })
  declare id: string;

  @ApiProperty({ type: String })
  declare name: string;

  @ApiPropertyOptional({ type: String })
  declare starred?: string;
}
