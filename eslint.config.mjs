import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import globals from 'globals'
import nextPlugin from '@next/eslint-plugin-next'
import reactHooks from 'eslint-plugin-react-hooks'

// Correctness checks; TypeScript remains the type/undefined-name gate for TS.
export default tseslint.config(
  { ignores: ['.next/**', '.next-showrooms*/**', 'public/maplibre/**', 'node_modules/**', '.vercel/**', 'data/**', 'next-env.d.ts'] },
  {
    files: ['**/*.{js,cjs,mjs,ts,tsx}'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    plugins: { '@next/next': nextPlugin, 'react-hooks': reactHooks },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': 'off',
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-useless-escape': 'warn',
      '@next/next/no-img-element': 'warn',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { parser: tseslint.parser },
    plugins: { '@typescript-eslint': tseslint.plugin },
    rules: {
      'no-undef': 'off',
      'no-redeclare': 'off',
      'no-unused-expressions': 'off',
      'no-dupe-class-members': 'off',
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },
)
