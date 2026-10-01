import { Column, DataType, ForeignKey, Model, Sequelize, Table } from 'sequelize-typescript';
import { ShoutcastContainerEntity } from './shoutcast-container.entity';
import { ShoutcastItemTypeEnum } from 'src/types/enums';

/**
 * The ShoutcastItemEntity represents a genre in the SHOUTcast directory.  The data in this
 * table is populated by a seeder with a hardcoded list of genres.
 */
@Table({
  tableName: 'shoutcast_items',
  timestamps: true,
  underscored: true,
})
export class ShoutcastItemEntity extends Model<ShoutcastItemEntity> {
  /**
   * The container ID the shoutcast item belongs in.
   */
  @Column({
    type: DataType.INTEGER,
    references: {
      model: ShoutcastContainerEntity,
      key: 'id',
    },
    allowNull: true,
    onDelete: 'CASCADE',
  })
  @ForeignKey(() => ShoutcastContainerEntity)
  declare containerId?: number;

  /**
   * This field is managed by Sequelize and tracks the date and time the row was created.  This field should not be
   * specified if you are inserting and updating data.
   */
  @Column({
    type: DataType.DATE,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
  })
  declare createdAt: Date;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  declare desc: string;

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
  @Column(DataType.DATE)
  declare updatedAt?: Date;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  declare url: string;
}
