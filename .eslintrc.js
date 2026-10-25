module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin', 'check-file', 'folders', 'sort-imports-es6-autofix'],
  extends: [
    'airbnb-base',
    'airbnb-typescript/base',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js', 'jest.*', 'pm2-*.js', 'dist', 'dist-test', 'node_modules', 'api-schema.ts'],
  rules: {
    // single quotes
    '@typescript-eslint/quotes': ['error', 'single', { allowTemplateLiterals: true }],
    // folder naming convention
    'folders/match-regex': [2, /^[a-z0-9-]+$/, '/src'],
    // filename naming convention
    'check-file/filename-naming-convention': [
      'error',
      {
        '*.{js,ts,json}': 'KEBAB_CASE',
      },
    ],
    // import sorting
    'import/order': 'off',
    'sort-imports-es6-autofix/sort-imports-es6': [
      2,
      {
        ignoreCase: false,
        ignoreMemberSort: false,
        memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
      },
    ],
    // maximum line length
    'max-len': ['error', { code: 120 }],
    // allow named exports even if there's only one
    'import/prefer-default-export': 'off',
  },
  overrides: [
    {
      // sequelize entity relations are bidirectional and resolved lazily
      files: ['src/database/entities/*.entity.ts'],
      rules: { 'import/no-cycle': 'off' },
    },
  ],
};
