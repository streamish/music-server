import { AccountEntity } from './account.entity';
import { AssociationLinkEntity } from './association-link.entity';
import { Column, DataType, ForeignKey, HasMany, Model, Sequelize, Table } from 'sequelize-typescript';

/**
 * The AssociationEntity holds all of the information required for an album or song association
 */
@Table({
  tableName: 'associations',
  timestamps: true,
  underscored: true,
})
export class AssociationEntity extends Model<AssociationEntity> {
  /**
   * The account ID the album belongs to.
   */
  @Column({
    type: DataType.INTEGER,
    references: {
      model: AccountEntity,
      key: 'id',
    },
    allowNull: true,
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

  @HasMany(() => AssociationLinkEntity)
  declare associationLinks: AssociationLinkEntity[];

  /**
   * The name of the association
   */
  @Column(DataType.STRING(255))
  declare name: string;

  /**
   * The normalized name of the association
   */
  @Column(DataType.STRING(255))
  declare nameNormalized: string;

  /**
   * This field is managed by Sequelize and tracks the most recent date and time the row was last updated.  This field
   * should not be specified if you are inserting and updating data.
   */
  @Column(DataType.DATE)
  declare updatedAt?: Date;
}
