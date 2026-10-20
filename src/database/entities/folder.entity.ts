import { AccountEntity } from './account.entity';
import { Column, DataType, ForeignKey, Model, Sequelize, Table } from 'sequelize-typescript';

/**
 * The FolderEntity holds a mapping of folders for an account for browsing media collections
 * by folder path.
 */
@Table({
  tableName: 'folders',
  timestamps: true,
  underscored: true,
})
export class FolderEntity extends Model<FolderEntity> {
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
   * This field is managed by Sequelize and tracks the date and time the row was created.  This
   * field should not be specified if you are inserting and updating data.
   */
  @Column({
    type: DataType.DATE,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
  })
  declare readonly createdAt: Date;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
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
  declare readonly id: number;

  /**
   * This field is managed by Sequelize and tracks the most recent date and time the row was last
   * updated.  This field should not be specified if you are inserting and updating data.
   */
  @Column({
    type: DataType.DATE,
  })
  declare readonly updatedAt?: Date;
}
