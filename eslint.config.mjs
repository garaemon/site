// Flat-config ESLint entrypoint. Layers the typescript-eslint recommended
// rules (no-unused-vars, no-explicit-any, etc.) and eslint-plugin-astro's
// recommended config under a project-wide styleRules block. Relaxing any
// of these rules should be done with a sweep across existing code, since
// commit history shows they were introduced after the initial migration.
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
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: ['**/*.{ts,tsx,mts,cts}'],
  })),
  {
    files: ['**/*.{js,mjs,ts,tsx,mts,cts}'],
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
