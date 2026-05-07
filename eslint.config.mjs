// Flat-config ESLint entrypoint. Two configurations are exported: one for
// plain JS/TS files (typescript-eslint parser) and one extending the
// recommended Astro config. The styleRules block is the project-wide
// formatting contract; do not relax without sweeping existing code.
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';

// Mandatory braces and 2-space indent are project conventions referenced
// in CLAUDE.md. brace-style with allowSingleLine: false rules out
// `if (foo) { return; }` so the body always sits on its own line.
const styleRules = {
  curly: ['error', 'all'],
  'brace-style': ['error', '1tbs', { allowSingleLine: false }],
  indent: ['error', 2, { SwitchCase: 1 }],
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
