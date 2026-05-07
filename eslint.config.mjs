import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';

const styleRules = {
  curly: ['error', 'all'],
  'brace-style': ['error', '1tbs', { allowSingleLine: false }],
};

export default [
  {
    ignores: ['dist/**', 'node_modules/**', '.astro/**'],
  },
  {
    files: ['**/*.{js,mjs,ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: styleRules,
  },
  ...astro.configs.recommended.map((config) => ({
    ...config,
    rules: {
      ...(config.rules ?? {}),
      ...styleRules,
    },
  })),
];
