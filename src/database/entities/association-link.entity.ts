import { AlbumEntity } from './album.entity';
import { AssociationEntity } from './association.entity';
import { BelongsTo, Column, DataType, ForeignKey, Model, Sequelize, Table } from 'sequelize-typescript';
import { TrackEntity } from './track.entity';

/**
 * The AssociationLinkEntity holds a reference to the association between a person, genre
 * or group/band/etc and a track or an album.  Album associations are distinct from track
 * associations, for instance an album might be credited to a single artist while the
 * tracks include many individual collaborations.
 */
@Table({
  tableName: 'association_links',
  timestamps: true,
  underscored: true,
})
export class AssociationLinkEntity extends Model<AssociationLinkEntity> {
  /**
   * The linked album ID if the association is to an album rather than a track.
   */
  @Column({
    type: DataType.INTEGER,
    references: {
      model: AlbumEntity,
      key: 'id',
    },
    allowNull: true,
  })
  @ForeignKey(() => AlbumEntity)
  declare albumId?: number;

  /**
   * The linked album.
   */
  @BelongsTo(() => AlbumEntity)
  declare album?: AlbumEntity;

  /**
   * The linked association if the association is to an album rather than a track.
   */
  @Column({
    type: DataType.INTEGER,
    references: {
      model: AssociationEntity,
      key: 'id',
    },
    onDelete: 'CASCADE',
  })
  @ForeignKey(() => AssociationEntity)
  declare associationId: number;

  /**
   * The linked association.
   */
  @BelongsTo(() => AssociationEntity)
  declare association?: AssociationEntity;

  /**
   * This field is managed by Sequelize and tracks the date and time the row was created.  This field should not be
   * specified if you are inserting and updating data.
   */
  @Column({
    type: DataType.DATE,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
  })
  declare createdAt: Date;

  /**
   * The ID of the table row is an integer that is assigned by the database when the row is created.
   */
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
  })
  declare id: number;

  /**
   * Flag for the association being as an artist.  Multiple flags can be selected.
   */
  @Column(DataType.BOOLEAN)
  declare isArtist: boolean;

  /**
   * Flag for the association being as a composer.  Multiple flags can be selected.
   */
  @Column(DataType.BOOLEAN)
  declare isComposer: boolean;

  /**
   * Flag for the association being as a genre.  Multiple flags can be selected.
   */
  @Column(DataType.BOOLEAN)
  declare isGenre: boolean;

  /**
   * The linked track ID if the association is to a track rather than an album.
   */
  @Column({
    type: DataType.INTEGER,
    references: {
      model: TrackEntity,
      key: 'id',
    },
    onDelete: 'CASCADE',
  })
  @ForeignKey(() => TrackEntity)
  declare trackId: number;

  /**
   * The linked track if the association is to a track rather than an album.
   */
  @BelongsTo(() => TrackEntity)
  declare track?: TrackEntity;

  /**
   * This field is managed by Sequelize and tracks the most recent date and time the row was last updated.  This field
   * should not be specified if you are inserting and updating data.
   */
  @Column(DataType.DATE)
  declare updatedAt?: Date;
}
