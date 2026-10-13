import { QueryInterface } from 'sequelize';

// Using a hard-coded genre list even though genres can be requested live from the
// SHOUTcast API an API key is required for retrieving them and it's not clear if
// this data ever changes.
//
// For new accounts this data is inserted via an `afterCreate` hook set up in the
// account entity.
const genres = [
  'Alternative',
  'Blues',
  'Classical',
  'Country',
  'Easy Listening',
  'Electronic',
  'Folk',
  'Themes',
  'Rap',
  'Inspirational',
  'International',
  'Jazz',
  'Latin',
  'Metal',
  'New Age',
  'Decades',
  'Pop',
  'R&B and Urban',
  'Reggae',
  'Rock',
  'Seasonal and Holiday',
  'Soundtracks',
  'Talk',
  'Misc',
  'Public Radio',
];

export async function up(queryInterface: QueryInterface) {
  const rootAccount = await queryInterface.sequelize.query(`SELECT id FROM accounts WHERE username = 'root' LIMIT 1`);
  const rootAccountId = (rootAccount[0][0] as Record<string, number>)?.id || 0;
  await queryInterface.bulkInsert(
    'shoutcast_genres',
    genres.map((name) => ({
      account_id: rootAccountId,
      name,
    })),
  );
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.bulkDelete('shoutcast_genres', {
    name: genres,
  });
}
