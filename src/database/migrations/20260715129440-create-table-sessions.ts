import { DataType, Sequelize } from 'sequelize-typescript';
import { QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface) {
  await queryInterface.createTable('sessions', {
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
    ended_at: DataType.DATE,
    expires_at: DataType.DATE,
    id: {
      type: DataType.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    restrict_session: {
      type: DataType.STRING(50),
      allowNull: true,
    },
    session_token: {
      type: DataType.STRING(128),
      allowNull: false,
      unique: true,
    },
    updated_at: {
      allowNull: true,
      type: DataType.DATE,
    },
    user_agent: DataType.STRING(255),
  });
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.dropTable('sessions');
}
