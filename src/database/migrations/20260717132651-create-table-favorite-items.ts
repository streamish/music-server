import { DataType, Sequelize } from 'sequelize-typescript';
import { QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('favorite_items', {
    account_id: {
      type: DataType.INTEGER,
      allowNull: true,
      references: {
        model: 'accounts',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    album_id: {
      type: DataType.INTEGER,
      allowNull: true,
      references: {
        model: 'albums',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    all_songs: {
      type: DataType.BOOLEAN,
      allowNull: true,
    },
    artist_id: {
      type: DataType.INTEGER,
      allowNull: true,
      references: {
        model: 'artists',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    composer_id: {
      type: DataType.INTEGER,
      allowNull: true,
      references: {
        model: 'composers',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    created_at: {
      type: DataType.DATE,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    folder_path: {
      type: DataType.STRING(500),
      allowNull: true,
    },
    genre_id: {
      type: DataType.INTEGER,
      allowNull: true,
      references: {
        model: 'genres',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    id: {
      type: DataType.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    playlist_id: {
      type: DataType.INTEGER,
      allowNull: true,
      references: {
        model: 'playlists',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    random_hundred: {
      type: DataType.BOOLEAN,
      allowNull: true,
    },
    recently_added: {
      type: DataType.BOOLEAN,
      allowNull: true,
    },
    updated_at: {
      type: DataType.DATE,
    },
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('favorite_items');
}
