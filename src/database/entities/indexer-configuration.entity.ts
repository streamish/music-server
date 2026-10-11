import { AccountEntity } from './account.entity';
import { BelongsTo, Column, DataType, ForeignKey, Model, Sequelize, Table } from 'sequelize-typescript';

/**
 * The IndexerConfigurationEntity holds the configuration for the indexer.  Each row
 * is a configuration change.  The row with the highest ID is the current
 * configuration.
 */
@Table({
  tableName: 'indexer_configurations',
  timestamps: true,
  underscored: true,
})
export class IndexerConfigurationEntity extends Model<IndexerConfigurationEntity> {
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
   * The ID of the user that created this configuration change
   */
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    references: {
      model: AccountEntity,
      key: 'id',
    },
    onDelete: 'SET NULL',
  })
  @ForeignKey(() => AccountEntity)
  declare createdByAccountId: number;

  @BelongsTo(() => AccountEntity)
  declare createdByAccount: AccountEntity;

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
    type: DataType.BOOLEAN,
    defaultValue: false,
    get() {
      const value = this.getDataValue('isEnabled');
      return value === 1 || value === true;
    },
  })
  declare isEnabled: boolean;

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
