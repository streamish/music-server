module.exports = {
  apps: [
    {
      args: 'dotenv -e .env -- npm run start:dev',
      error_file: '/dev/null',
      ignore_watch: ['node_modules', 'dist', '.git'],
      merge_logs: true,
      name: 'streamish-dev-api',
      out_file: '/dev/null',
      script: 'npx',
      watch_delay: 1000,
      watch: ['src'],
    },
  ],
};
