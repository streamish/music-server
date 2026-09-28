import { Column, DataType, ForeignKey, Model, Sequelize, Table } from 'sequelize-typescript';
import { TrackEntity } from './track.entity';

/**
 * The TrackCustomDataEntity holds information that overrides the embedded data in a file.  This
 * information is superimposed on the file metadata during the indexing process, allowing it to
 * control the indexed data.
 */
@Table({
  tableName: 'tracks_custom_data',
  timestamps: true,
  underscored: true,
})
export class TrackCustomDataEntity extends Model<TrackCustomDataEntity> {
  @Column(DataType.STRING(1000))
  declare albumArtists: string;

  @Column(DataType.STRING(255))
  declare albumTitle: string;

  @Column(DataType.STRING(1000))
  declare artists: string;

  @Column(DataType.STRING(255))
  declare comment: string;

  @Column(DataType.STRING(255))
  declare composers: string;

  /**
   * This field is managed by Sequelize and tracks the date and time the row was created.  This
   * field should not be specified if you are
   * inserting and updating data.
   */
  @Column({
    type: DataType.DATE,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
  })
  declare createdAt: Date;

  @Column(DataType.INTEGER)
  declare discNumber: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    references: {
      model: TrackEntity,
      key: 'id',
    },
    onDelete: 'CASCADE',
  })
  @ForeignKey(() => TrackEntity)
  declare trackId: number;

  @Column(DataType.STRING(1000))
  declare genres: string;

  /**
   * The ID of the table row is always aligned with the file ID
   */
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    allowNull: false,
    autoIncrement: false,
  })
  declare id: number;

  @Column(DataType.STRING(255))
  declare title: string;

  @Column(DataType.INTEGER)
  declare trackNumber: number;

  /**
   * This field is managed by Sequelize and tracks the most recent date and time the row was last
   * updated.  This field should not be specified if you are inserting and updating data.
   */
  @Column(DataType.DATE)
  declare updatedAt?: Date;

  @Column(DataType.INTEGER)
  declare year: number;
}
