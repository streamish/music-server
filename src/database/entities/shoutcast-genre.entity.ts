import { AccountEntity } from './account.entity';
import { Column, DataType, ForeignKey, Model, Sequelize, Table } from 'sequelize-typescript';

/**
 * The ShoutcastGenreEntity represents a genre in the ShoutCast system.  These are populated from
 * a hardcoded list in a database seeder script when the database is created, and then managed
 * by users individually.
 */
@Table({
  tableName: 'shoutcast_genres',
  timestamps: true,
  underscored: true,
})
export class ShoutcastGenreEntity extends Model<ShoutcastGenreEntity> {
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
  declare accountId: number;

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
   * The name of the genre
   */
  @Column(DataType.STRING(255))
  declare name: string;

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
