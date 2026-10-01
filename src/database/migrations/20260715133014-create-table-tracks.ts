import { DataTypes, QueryInterface, Sequelize } from 'sequelize';

export async function up(queryInterface: QueryInterface) {
  await queryInterface.createTable('tracks', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    account_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'accounts',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    album_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'albums',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    bit_rate: DataTypes.INTEGER,
    channels: DataTypes.INTEGER,
    comment: DataTypes.STRING(255),
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    disc_number: DataTypes.INTEGER,
    duration: DataTypes.FLOAT,
    file_mtime: DataTypes.DATE,
    file_path: {
      comment: 'The path to the file relative to the root folder path',
      type: DataTypes.STRING(255),
    },
    file_size: DataTypes.INTEGER,
    file_type: DataTypes.STRING(50),
    frequency: DataTypes.INTEGER,
    rating: DataTypes.INTEGER,
    root_path_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'root_paths',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    title: DataTypes.STRING(255),
    track_number: DataTypes.INTEGER,
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    year: DataTypes.INTEGER,
  });
  await queryInterface.addIndex('tracks', ['album_id'], {
    name: 'idx_tracks_album_id',
  });
  await queryInterface.addIndex('tracks', ['account_id'], {
    name: 'idx_tracks_account_id',
  });
  await queryInterface.addIndex('tracks', ['album_id', 'rating'], {
    name: 'idx_tracks_album_id_rating',
  });
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.removeIndex('tracks', 'idx_tracks_album_id');
  await queryInterface.removeIndex('tracks', 'idx_tracks_account_id');
  await queryInterface.removeIndex('tracks', 'idx_tracks_album_id_rating');
  await queryInterface.dropTable('tracks');
}
