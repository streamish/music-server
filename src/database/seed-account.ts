import { Guid } from 'typescript-guid';
import { QueryInterface } from 'sequelize';
import bcrypt from 'bcryptjs';

export async function createSeedAccount(
  queryInterface: QueryInterface,
  username: string,
  password: string,
  roles: string,
) {
  const passwordHash = await bcrypt.hash(password, 10);
  const sessionKey = Guid.create().toString();
  const newAccount = await queryInterface.sequelize.query(
    `INSERT INTO accounts(username, password_hash, roles, session_key) 
    VALUES ('${username}', '${passwordHash}', '${roles}', '${sessionKey}') RETURNING *;`,
  );
  const newAccountId = (newAccount[1] as Record<string, number>).lastID;
  const rootAccount = await queryInterface.sequelize.query(`SELECT id FROM accounts WHERE username = 'root' LIMIT 1`);
  const rootAccountId = (rootAccount[0][0] as Record<string, number>)?.id || 0;
  if (!rootAccountId) {
    throw new Error('Root account not found');
  }
  // insert shoutcast containers
  const containers = await queryInterface.sequelize.query(
    `SELECT * FROM shoutcast_containers WHERE account_id = ${rootAccountId};`,
  );
  const mappedContainers = (containers[0] as { title: string }[]).map((container) => {
    return {
      account_id: newAccountId,
      title: container.title,
    };
  });
  await queryInterface.bulkInsert('shoutcast_containers', mappedContainers);
  // insert shoutcast genres
  const genres = await queryInterface.sequelize.query(
    `SELECT * FROM shoutcast_genres WHERE account_id = ${rootAccountId};`,
  );
  const mappedGenres = (genres[0] as { name: string }[]).map((genre) => {
    return {
      account_id: newAccountId,
      name: genre.name,
    };
  });
  await queryInterface.bulkInsert('shoutcast_genres', mappedGenres);
}

export async function deleteSeedAccount(queryInterface: QueryInterface, username: string) {
  await queryInterface.sequelize.query(
    `DELETE FROM shoutcast_containers WHERE account_id = (SELECT id FROM accounts WHERE username = '${username}');`,
  );
  await queryInterface.sequelize.query(
    `DELETE FROM shoutcast_genres WHERE account_id = (SELECT id FROM accounts WHERE username = '${username}');`,
  );
  await queryInterface.sequelize.query(`DELETE FROM accounts WHERE username = '${username}';`);
}
