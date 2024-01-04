module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  overrides: [],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@stylistic/recommended-extends',
  ],
  rules: {},
}
