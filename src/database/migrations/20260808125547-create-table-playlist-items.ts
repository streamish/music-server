import { DataTypes, QueryInterface, Sequelize } from 'sequelize';

export async function up(queryInterface: QueryInterface) {
  await queryInterface.createTable('playlist_items', {
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    track_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'tracks',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    playlist_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'playlists',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    position: DataTypes.INTEGER,
    radio_station_title: DataTypes.STRING(255),
    radio_station_url: DataTypes.STRING(255),
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  });
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.dropTable('playlist_items');
}
