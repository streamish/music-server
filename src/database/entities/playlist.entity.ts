import { AccountEntity } from './account.entity';
import { Column, DataType, ForeignKey, HasMany, Model, Sequelize, Table } from 'sequelize-typescript';
import { PlaylistItemEntity } from './playlist-item.entity';
import { PlaylistSmartRuleEntity } from './playlist-smart-rule.entity';
import { PlaylistTypeEnum, SmartPlaylistConjugalEnum } from 'src/types/enums';

/**
 * The PlaylistEntity holds a reference to a user's playlist. A user may have
 * multiple playlists.  They can be "normal" or "smart".  A "normal" playlist
 * is a container for adding songs and radio stations.  A "smart" playlist is
 * a set of rules that filter songs.
 */
@Table({
  tableName: 'playlists',
  timestamps: true,
  underscored: true,
})
export class PlaylistEntity extends Model<PlaylistEntity> {
  /**
   * The account ID the playlist belongs to.
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
   * This field is managed by Sequelize and tracks the date and time the row was created.  This
   * field should not be specified if you are inserting and updating data.
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

  @HasMany(() => PlaylistItemEntity)
  declare items?: PlaylistItemEntity[];

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare name: string;

  @HasMany(() => PlaylistSmartRuleEntity)
  declare rules?: PlaylistSmartRuleEntity[];

  @Column({
    type: DataType.ENUM(...Object.values(SmartPlaylistConjugalEnum)),
    allowNull: true,
  })
  declare rulesConjugal: SmartPlaylistConjugalEnum | null;

  @Column({
    type: DataType.ENUM(...Object.values(PlaylistTypeEnum)),
    allowNull: false,
  })
  declare type: PlaylistTypeEnum;

  /**
   * This field is managed by Sequelize and tracks the most recent date and time the row was last
   * updated.  This field should not be specified if you are inserting and updating data.
   */
  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare updatedAt: Date | null;
}
