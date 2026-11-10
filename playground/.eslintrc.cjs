module.exports = {
  extends: ['../.eslintrc.cjs'],
  overrides: [{
    files: ['src/app/**/*'],
    rules: {
      'import/no-duplicates': 'off',
      'perfectionist/sort-objects': 'off',
      'require-await': 'off',
    },
  }],
};
