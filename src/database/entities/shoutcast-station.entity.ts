import { AccountEntity } from './account.entity';
import { BelongsTo, Column, DataType, ForeignKey, HasOne, Model, Sequelize, Table } from 'sequelize-typescript';
import { FavoriteItemEntity } from './favorite-item.entity';
import { ShoutcastItemTypeEnum } from 'src/types/enums';

/**
 * The ShoutcastStationEntity represents a genre in the SHOUTcast directory.  The data in this
 * table is populated by a seeder with a hardcoded list of genres.
 */
@Table({
  tableName: 'shoutcast_stations',
  timestamps: true,
  underscored: true,
})
export class ShoutcastStationEntity extends Model<ShoutcastStationEntity> {
  /**
   * The account ID the root path belongs to.
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

  @BelongsTo(() => AccountEntity)
  declare account?: AccountEntity;

  /**
   * This field is managed by Sequelize and tracks the date and time the row was created.  This field should not be
   * specified if you are inserting and updating data.
   */
  @Column({
    type: DataType.DATE,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
  })
  declare createdAt: Date;

  @HasOne(() => FavoriteItemEntity)
  declare favorite?: FavoriteItemEntity | null;

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
   * The title of the genre
   */
  @Column(DataType.STRING(255))
  declare title: string;

  @Column(DataType.ENUM(...Object.values(ShoutcastItemTypeEnum)))
  declare type: ShoutcastItemTypeEnum;

  /**
   * This field is managed by Sequelize and tracks the most recent date and time the row was last updated.  This field
   * should not be specified if you are inserting and updating data.
   */
  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare updatedAt: Date | null;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  declare url: string | null;
}
