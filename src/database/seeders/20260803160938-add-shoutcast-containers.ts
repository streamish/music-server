import { QueryInterface } from 'sequelize';

// Using a hard-coded container list required for Synology DS Audio.
//
// For new accounts this data is inserted via an `afterCreate` hook set up in the
// account entity.

const containers = ['SHOUTcast', 'User defined', 'My favorite'];

export async function up(queryInterface: QueryInterface) {
  const accounts = await queryInterface.sequelize.query(`SELECT id FROM accounts;`);
  const accountIds = accounts[0].map((account) => (account as { id: number }).id) || [1];
  for (let i = 0, len = accountIds.length; i < len; i += 1) {
    const accountId = accountIds[i];
    // eslint-disable-next-line no-await-in-loop
    await queryInterface.bulkInsert(
      'shoutcast_containers',
      containers.map((title) => ({
        account_id: accountId,
        title,
      })),
    );
  }
}

export async function down(queryInterface: QueryInterface) {
  const accounts = await queryInterface.sequelize.query(`SELECT id FROM accounts;`);
  const accountIds = accounts[0].map((account) => (account as { id: number }).id) || [1];
  for (let i = 0, len = accountIds.length; i < len; i += 1) {
    const accountId = accountIds[i];
    // eslint-disable-next-line no-await-in-loop
    await queryInterface.bulkDelete('shoutcast_containers', {
      account_id: accountId,
      title: containers,
    });
  }
}
