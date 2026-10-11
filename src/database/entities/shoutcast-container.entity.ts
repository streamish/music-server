import { AccountEntity } from './account.entity';
import { Column, DataType, ForeignKey, Model, Sequelize, Table } from 'sequelize-typescript';

/**
 * The ShoutcastContainerEntity represents a container for genres, favorites and
 * stations the user has added.  The data in this table is populated by a seeder
 * with a default list of containers.
 */
@Table({
  tableName: 'shoutcast_containers',
  timestamps: true,
  underscored: true,
})
export class ShoutcastContainerEntity extends Model<ShoutcastContainerEntity> {
  /**
   * The account ID the file belongs to.
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
  declare accountId?: number;

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
   * The title of the container
   */
  @Column(DataType.STRING(255))
  declare title: string;

  /**
   * This field is managed by Sequelize and tracks the most recent date and time the row was last updated.  This field
   * should not be specified if you are inserting and updating data.
   */
  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare updatedAt: Date | null;
}
