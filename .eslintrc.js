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
    'folders/match-regex': [2, /^[a-z0-9-]+$/, '/src'],
    'check-file/filename-naming-convention': [
      'error',
      {
        '*.{js,ts,json}': 'KEBAB_CASE',
      },
    ],
    // module import/export sorting
    'import/order': 'off',
    'import/no-cycle': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/prefer-default-export': 'off',
    'sort-imports-es6-autofix/sort-imports-es6': [
      2,
      {
        ignoreCase: false,
        ignoreMemberSort: false,
        memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
      },
    ],
    // line length
    'max-len': ['error', { code: 120 }],
  },
};
