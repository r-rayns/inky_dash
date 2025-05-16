//  @ts-check

import {tanstackConfig} from '@tanstack/eslint-config'
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  {
    ignores: ['eslint.config.js', 'prettier.config.js', 'vite.config.js'],
  },
  ...tanstackConfig,
  {
    plugins: {
      'react-hooks': reactHooks
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/no-unnecessary-condition': 'warn'
    }
  }
]
