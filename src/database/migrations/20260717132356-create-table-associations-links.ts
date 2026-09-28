import { DataType, Sequelize } from 'sequelize-typescript';
import { QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('association_links', {
    association_id: {
      type: DataType.INTEGER,
      allowNull: false,
      references: {
        model: 'associations',
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
    is_artist: {
      type: DataType.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    is_composer: {
      type: DataType.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    is_genre: {
      type: DataType.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    track_id: {
      type: DataType.INTEGER,
      allowNull: true,
      references: {
        model: 'tracks',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    updated_at: {
      type: DataType.DATE,
    },
  });
  await queryInterface.addIndex('association_links', ['association_id'], {
    name: 'idx_association_links_association_id',
  });
  await queryInterface.addIndex('association_links', ['track_id'], {
    name: 'idx_association_links_track_id',
  });
  await queryInterface.addIndex('association_links', ['association_id', 'track_id'], {
    name: 'idx_association_links_association_id_track_id',
  });
  await queryInterface.addIndex('association_links', ['association_id', 'album_id'], {
    name: 'idx_association_links_association_id_album_id',
  });

  await queryInterface.addIndex('association_links', ['album_id'], {
    name: 'idx_association_links_album_artist',
    where: {
      is_artist: 1,
    },
  });
  await queryInterface.addIndex('association_links', ['album_id'], {
    name: 'idx_association_links_album_composer',
    where: {
      is_composer: 1,
    },
  });
  await queryInterface.addIndex('association_links', ['album_id'], {
    name: 'idx_association_links_album_genre',
    where: {
      is_genre: 1,
    },
  });
  await queryInterface.addIndex('association_links', ['track_id'], {
    name: 'idx_association_links_track_artist',
    where: {
      is_artist: 1,
    },
  });
  await queryInterface.addIndex('association_links', ['track_id'], {
    name: 'idx_association_links_track_composer',
    where: {
      is_composer: 1,
    },
  });
  await queryInterface.addIndex('association_links', ['track_id'], {
    name: 'idx_association_links_track_genre',
    where: {
      is_genre: 1,
    },
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeIndex('association_links', 'idx_association_links_association_id');
  await queryInterface.removeIndex('association_links', 'idx_association_links_track_id');
  await queryInterface.removeIndex('association_links', 'idx_association_links_association_id_track_id');
  await queryInterface.removeIndex('association_links', 'idx_association_links_association_id_album_id');
  await queryInterface.removeIndex('association_links', 'idx_association_links_album_artist');
  await queryInterface.removeIndex('association_links', 'idx_association_links_album_composer');
  await queryInterface.removeIndex('association_links', 'idx_association_links_album_genre');
  await queryInterface.removeIndex('association_links', 'idx_association_links_track_artist');
  await queryInterface.removeIndex('association_links', 'idx_association_links_track_composer');
  await queryInterface.removeIndex('association_links', 'idx_association_links_track_genre');
  await queryInterface.dropTable('association_links');
}
