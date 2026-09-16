import { DataType, Sequelize } from 'sequelize-typescript';
import { QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('artists', {
    account_id: {
      type: DataType.INTEGER,
      allowNull: false,
      references: {
        model: 'accounts',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    created_at: {
      type: DataType.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    id: {
      type: DataType.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    name: DataType.STRING(255),
    name_normalized: DataType.STRING(255),
    updated_at: {
      type: DataType.DATE,
    },
  });
  await queryInterface.addIndex('artists', ['name_normalized'], {
    name: 'idx_artists_name_normalized',
  });
  await queryInterface.addIndex('artists', ['name'], {
    name: 'idx_artists_name',
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeIndex('artists', 'idx_artists_name_normalized');
  await queryInterface.removeIndex('artists', 'idx_artists_name');
  await queryInterface.dropTable('artists');
}
