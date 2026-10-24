import { AssociationTypeEnum } from 'src/types/enums';
import { CoverImagesService } from 'src/cover-images/cover-images.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ApiCoverImageService {
  constructor(private readonly coverImagesService: CoverImagesService) {}

  async getAlbumCovers(albumIds: number[], associationId: number, associationType: AssociationTypeEnum, size: number) {
    return this.coverImagesService.getAlbumCovers(albumIds, associationId, associationType, size);
  }

  async getAlbumCover(albumId: number | number[], size: number) {
    return this.coverImagesService.getAlbumCover(albumId, size);
  }

  async getAssociationCover(userId: number, associationId: number, size: number, type: AssociationTypeEnum) {
    return this.coverImagesService.getAssociationCover(userId, associationId, size, type);
  }
}
