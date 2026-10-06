import { AccountEntity } from './account.entity';
import { AlbumEntity } from './album.entity';
import { AssociationEntity } from './association.entity';
import { AssociationTypeEnum } from 'src/types/enums';
import { BelongsTo, Column, DataType, ForeignKey, Model, Sequelize, Table } from 'sequelize-typescript';
import { PlaylistEntity } from './playlist.entity';
import { TrackEntity } from './track.entity';

/**
 * The FavoriteItemEntity represents an item that has been favorited or pinned by the user.
 */
@Table({
  tableName: 'favorite_items',
  timestamps: false,
  underscored: true,
})
export class FavoriteItemEntity extends Model<FavoriteItemEntity> {
  /**
   * The account ID the pinned item belongs to.
   */
  @Column({
    type: DataType.INTEGER,
    references: {
      model: AccountEntity,
      key: 'id',
    },
    onDelete: 'CASCADE',
  })
  @ForeignKey(() => AccountEntity)
  declare accountId: number;

  /**
   * The album ID if an album is pinned
   */
  @Column({
    type: DataType.INTEGER,
    references: {
      model: AlbumEntity,
      key: 'id',
    },
    allowNull: true,
    onDelete: 'CASCADE',
  })
  @ForeignKey(() => AlbumEntity)
  declare albumId?: number;

  @BelongsTo(() => AlbumEntity)
  declare album: AlbumEntity;

  @Column({
    type: DataType.BOOLEAN,
    get() {
      const value = this.getDataValue('allSongs');
      return value === 1 || value === true;
    },
  })
  declare allSongs: boolean;

  /**
   * The association link to an artist, composer or genre
   */
  @Column({
    type: DataType.INTEGER,
    references: {
      model: AssociationEntity,
      key: 'id',
    },
    allowNull: true,
    onDelete: 'CASCADE',
  })
  @ForeignKey(() => AssociationEntity)
  declare associationId?: number;

  @BelongsTo(() => AssociationEntity)
  declare association?: AssociationEntity;

  @Column({
    type: DataType.STRING(50),
    allowNull: true,
  })
  declare associationType?: AssociationTypeEnum;

  /**
   * This field is managed by Sequelize and tracks the date and time the row was created.  This
   * field should not be specified if you are inserting and updating data.
   */
  @Column({
    type: DataType.DATE,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
  })
  declare createdAt: Date;

  /**
   * The folder path if a folder is pinned
   */
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare folderPath: string;

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
   * The playlist ID if a playlist is pinned
   */
  @Column({
    type: DataType.INTEGER,
    references: {
      model: PlaylistEntity,
      key: 'id',
    },
    allowNull: true,
    onDelete: 'CASCADE',
  })
  @ForeignKey(() => PlaylistEntity)
  declare playlistId?: number;

  @BelongsTo(() => PlaylistEntity)
  declare playlist: PlaylistEntity;

  @Column({
    type: DataType.BOOLEAN,
    get() {
      const value = this.getDataValue('randomHundred');
      return value === 1 || value === true;
    },
  })
  declare randomHundred: boolean;

  @Column({
    type: DataType.BOOLEAN,
    get() {
      const value = this.getDataValue('recentlyAdded');
      return value === 1 || value === true;
    },
  })
  declare recentlyAdded: boolean;

  /**
   * The track ID if a track is pinned
   */
  @Column({
    type: DataType.INTEGER,
    references: {
      model: TrackEntity,
      key: 'id',
    },
    allowNull: true,
    onDelete: 'CASCADE',
  })
  @ForeignKey(() => TrackEntity)
  declare trackId?: number;

  @BelongsTo(() => TrackEntity)
  declare track: TrackEntity;

  /**
   * This field is managed by Sequelize and tracks the most recent date and time the row was last
   * updated.  This field should not be specified if you are inserting and updating data.
   */
  @Column(DataType.DATE)
  declare updatedAt?: Date;
}
