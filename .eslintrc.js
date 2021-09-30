module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin', 'prettier'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    'padding-line-between-statements': [
      'error',
      { blankLine: 'always', prev: '*', next: '*' },
      { blankLine: 'any', prev: 'class', next: 'class' },
      { blankLine: 'any', prev: ['let', 'const'], next: ['let', 'const'] },
      { blankLine: 'any', prev: 'expression', next: 'expression' },
      { blankLine: 'any', prev: ['import', 'export'], next: ['import', 'export'] },
    ]
  }
};
