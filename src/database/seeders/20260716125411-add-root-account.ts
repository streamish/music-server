import { QueryInterface } from 'sequelize';

export async function up(queryInterface: QueryInterface) {
  await queryInterface.sequelize.query(
    `INSERT INTO accounts(username, password_hash, roles, session_key) 
    VALUES ('root', '', '', '');`,
  );
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.sequelize.query(
    `DELETE FROM shoutcast_containers WHERE account_id = (SELECT id FROM accounts WHERE username = 'root');`,
  );
}
