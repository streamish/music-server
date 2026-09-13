import { AccountEntity } from './account.entity';
import { AlbumEntity } from './album.entity';
import { ArtistEntity } from './artist.entity';
import { BelongsTo, Column, DataType, ForeignKey, Model, Sequelize, Table } from 'sequelize-typescript';
import { ComposerEntity } from './composer.entity';
import { GenreEntity } from './genre.entity';
import { PlaylistEntity } from './playlist.entity';

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
    allowNull: true,
    onDelete: 'CASCADE',
  })
  @ForeignKey(() => AccountEntity)
  declare accountId?: number;

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
   * The artist ID if an artist is pinned
   */
  @Column({
    type: DataType.INTEGER,
    references: {
      model: ArtistEntity,
      key: 'id',
    },
    allowNull: true,
    onDelete: 'CASCADE',
  })
  @ForeignKey(() => ArtistEntity)
  declare artistId?: number;

  @BelongsTo(() => ArtistEntity)
  declare artist: ArtistEntity;

  /**
   * The composer ID if a composer is pinned
   */
  @Column({
    type: DataType.INTEGER,
    references: {
      model: ComposerEntity,
      key: 'id',
    },
    allowNull: true,
    onDelete: 'CASCADE',
  })
  @ForeignKey(() => ComposerEntity)
  declare composerId?: number;

  @BelongsTo(() => ComposerEntity)
  declare composer: ComposerEntity;

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
   * The genre ID if a genre is pinned
   */
  @Column({
    type: DataType.INTEGER,
    references: {
      model: GenreEntity,
      key: 'id',
    },
    allowNull: true,
    onDelete: 'CASCADE',
  })
  @ForeignKey(() => GenreEntity)
  declare genreId?: number;

  @BelongsTo(() => GenreEntity)
  declare genre: GenreEntity;

  /**
   * The ID of the table row is the first file ID that was found in the folder path
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
   * This field is managed by Sequelize and tracks the most recent date and time the row was last
   * updated.  This field should not be specified if you are inserting and updating data.
   */
  @Column(DataType.DATE)
  declare updatedAt?: Date;
}
