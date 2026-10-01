import { BelongsTo, Column, DataType, ForeignKey, Model, Sequelize, Table } from 'sequelize-typescript';
import { PlaylistEntity } from './playlist.entity';
import { TrackEntity } from './track.entity';

/**
 * The PlaylistEntity holds a reference to a user's playlist. A user may have
 * multiple playlists.  They can be "normal" or "smart".  A "normal" playlist
 * is a container for adding songs and radio stations.  A "smart" playlist is
 * a set of rules that filter songs.
 */
@Table({
  tableName: 'playlist_items',
  timestamps: true,
  underscored: true,
})
export class PlaylistItemEntity extends Model<PlaylistItemEntity> {
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
   * The file ID of the item in the playlist
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
  declare track?: TrackEntity;

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
   * The playlist ID the item belongs to.
   */
  @Column({
    type: DataType.INTEGER,
    references: {
      model: PlaylistEntity,
      key: 'id',
    },
    allowNull: false,
    onDelete: 'CASCADE',
  })
  @ForeignKey(() => PlaylistEntity)
  declare playlistId: number;

  @BelongsTo(() => PlaylistEntity)
  declare playlist: PlaylistEntity;

  @Column(DataType.INTEGER)
  declare position: number;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  declare radioStationTitle?: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  declare radioStationUrl?: string;

  /**
   * This field is managed by Sequelize and tracks the most recent date and time the row was last updated.  This field
   * should not be specified if you are inserting and updating data.
   */
  @Column(DataType.DATE)
  declare updatedAt?: Date;
}
