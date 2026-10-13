import { DataTypes, QueryInterface, Sequelize } from 'sequelize';

export async function up(queryInterface: QueryInterface) {
  await queryInterface.createTable('shoutcast_genres', {
    account_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'accounts',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: DataTypes.STRING(255),
    updated_at: {
      allowNull: true,
      type: DataTypes.DATE,
    },
  });
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.dropTable('shoutcast_genres');
}
