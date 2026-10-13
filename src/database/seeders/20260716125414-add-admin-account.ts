import { QueryInterface } from 'sequelize';
import { createSeedAccount, deleteSeedAccount } from '../seed-account';

const username = process.env.DEFAULT_ADMIN_USERNAME || 'admin';
const password = process.env.DEFAULT_ADMIN_PASSWORD || 'admin';

export async function up(queryInterface: QueryInterface) {
  await createSeedAccount(queryInterface, username, password, 'admin');
}

export async function down(queryInterface: QueryInterface) {
  await deleteSeedAccount(queryInterface, username);
}
