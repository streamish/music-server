import { QueryInterface } from 'sequelize';

// Using a hard-coded container list required for Synology DS Audio.
//
// For new accounts this data is inserted via an `afterCreate` hook set up in the
// account entity.

const containers = ['SHOUTcast', 'User defined', 'My favorite'];

export async function up(queryInterface: QueryInterface) {
  const rootAccount = await queryInterface.sequelize.query(`SELECT id FROM accounts WHERE username = 'root' LIMIT 1`);
  const rootAccountId = (rootAccount[0][0] as Record<string, number>)?.id || 0;
  await queryInterface.bulkInsert(
    'shoutcast_containers',
    containers.map((title) => ({
      account_id: rootAccountId,
      title,
    })),
  );
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.bulkDelete('shoutcast_containers', {
    title: containers,
  });
}
