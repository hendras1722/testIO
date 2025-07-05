import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off', // Allows 'any' type
      '@typescript-eslint/ban-types': [
        'error',
        {
          extendDefaults: true,
          types: {
            '{}': false,
          },
        },
      ],
      '@typescript-eslint/no-unsafe-assignment': 'off', // Allows assignment of any
      '@typescript-eslint/no-unsafe-member-access': 'off', // Allows accessing properties on any
      '@typescript-eslint/no-unsafe-call': 'off', // Allows calling functions typed as any
      '@typescript-eslint/no-unsafe-return': 'off', // Allows returning any
    },
  },
]

export default eslintConfig
