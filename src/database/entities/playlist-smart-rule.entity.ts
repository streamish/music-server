import { BelongsTo, Column, DataType, ForeignKey, Model, Sequelize, Table } from 'sequelize-typescript';
import { PlaylistEntity } from './playlist.entity';
import { SmartPlaylistFieldEnum, SmartPlaylistIntervalTagEnum, SmartPlaylistOperationEnum } from 'src/types/enums';

/**
 * The PlaylistSmartRuleEntity holds a reference to a smart rule for a user's playlist.  Each
 * rule is a filter that is applied to the songs either in combination with the other rules
 * or individually depending on the rulesConjugal field.  A user may have multiple smart rules
 * for a single playlist.
 */
@Table({
  tableName: 'playlist_smart_rules',
  timestamps: true,
  underscored: true,
})
export class PlaylistSmartRuleEntity extends Model<PlaylistSmartRuleEntity> {
  /**
   * This field is managed by Sequelize and tracks the date and time the row was created.  This
   * field should not be specified if you are inserting and updating data.
   */
  @Column({
    type: DataType.DATE,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
  })
  declare createdAt: Date;

  @Column({
    type: DataType.ENUM(...Object.values(SmartPlaylistFieldEnum)),
    allowNull: false,
  })
  declare field: SmartPlaylistFieldEnum;

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

  @Column({
    type: DataType.ENUM(...Object.values(SmartPlaylistIntervalTagEnum)),
    allowNull: true,
  })
  declare interval: SmartPlaylistIntervalTagEnum | null;

  @Column({
    type: DataType.ENUM(...Object.values(SmartPlaylistOperationEnum)),
    allowNull: false,
  })
  declare operation: SmartPlaylistOperationEnum;

  /**
   * The playlist ID the rule belongs to.
   */
  @Column({
    type: DataType.INTEGER,
    references: {
      model: PlaylistEntity,
      key: 'id',
    },
    onDelete: 'CASCADE',
  })
  @ForeignKey(() => PlaylistEntity)
  declare playlistId: number;

  @BelongsTo(() => PlaylistEntity)
  declare playlist?: PlaylistEntity;

  /**
   * This field is managed by Sequelize and tracks the most recent date and time the row was last
   * updated.  This field should not be specified if you are inserting and updating data.
   */
  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare updatedAt: Date | null;

  @Column(DataType.STRING(50))
  declare value: string;
}
