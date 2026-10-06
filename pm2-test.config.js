module.exports = {
  apps: [
    {
      args: 'dotenv -e .env.test -- npm run start:test',
      error_file: '/dev/null',
      ignore_watch: ['node_modules', 'dist', '.git'],
      merge_logs: true,
      name: 'streamish-test-api',
      out_file: '/dev/null',
      script: 'npx',
      watch_delay: 1000,
      watch: ['src'],
    },
  ],
};
