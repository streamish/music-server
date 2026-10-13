import { QueryInterface } from 'sequelize';
import { createSeedAccount, deleteSeedAccount } from '../seed-account';

const username = process.env.DEFAULT_USER_USERNAME || 'user';
const password = process.env.DEFAULT_USER_PASSWORD || 'user';

export async function up(queryInterface: QueryInterface) {
  await createSeedAccount(queryInterface, username, password, 'user');
}

export async function down(queryInterface: QueryInterface) {
  await deleteSeedAccount(queryInterface, username);
}
