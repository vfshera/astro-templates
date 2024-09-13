import astroEslintParser from 'astro-eslint-parser'
import typescriptEslintParser from '@typescript-eslint/parser'
import astroPlugin from 'eslint-plugin-astro'

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...astroPlugin.configs.recommended,
  {
    files: ['**/*.astro'],
    languageOptions: {
      parser: astroEslintParser,
      parserOptions: {
        parser: typescriptEslintParser,
        extraFileExtensions: ['.astro']
      }
    }
  },
  {
    files: ['**/*.js', '**/*.ts'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: typescriptEslintParser,
      parserOptions: {
        tsconfigRootDir: process.cwd()
      }
    }
  },
  {
    rules: {
      'padding-line-between-statements': [
        'warn',
        { blankLine: 'always', prev: '*', next: 'return' },
        {
          blankLine: 'always',
          prev: ['const', 'let', 'var', 'block-like', 'export'],
          next: '*'
        },
        {
          blankLine: 'always',
          prev: ['const', 'let', 'var', 'block-like', 'export'],
          next: ['const', 'let', 'var', 'block-like', 'export']
        }
      ],
      'no-console': 'warn'
    }
  }
]
