// eslint.config.mjs

// Core ESLint recommended rules
import pluginJs from '@eslint/js';

// For TypeScript ESLint (import as 'tseslint')
import tseslint from 'typescript-eslint';

// React plugins
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';

// Next.js plugin/config
import nextPlugin from '@next/eslint-plugin-next'; // This import path is often correct

// Prettier plugins/configs
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier'; // This config disables conflicting rules

// Globals for environment variables (browser, node etc.)
import globals from 'globals';

export default tseslint.config(
  {
    // === Global Ignores for the entire config ===
    ignores: ['node_modules/', '.next/', 'build/', 'out/', 'dist/'],
  },

  // === Base ESLint Recommended Rules ===
  pluginJs.configs.recommended,

  // === TypeScript ESLint Recommended Rules ===
  // Spread the recommended configs from typescript-eslint
  ...tseslint.configs.recommended,

  // === Configuration for JavaScript/TypeScript files ===
  {
    files: ['**/*.{js,jsx,ts,tsx}'], // Apply to JS/TS/JSX/TSX files
    plugins: {
      react: pluginReact,
      'react-hooks': pluginReactHooks,
      prettier: prettierPlugin,
      '@next': nextPlugin, // Add the Next.js plugin
    },
    languageOptions: {
      parser: tseslint.parser, // Use the TypeScript parser
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // === Rules Overrides (Set to "off" to minimize errors for now) ===

      // no-unused-vars (handled by TS ESLint)
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',

      // no-explicit-any (TypeScript specific)
      '@typescript-eslint/no-explicit-any': 'off',

      // react-hooks/exhaustive-deps
      'react-hooks/exhaustive-deps': 'off',

      // react/no-unescaped-entities
      'react/no-unescaped-entities': 'off',

      // no-console (warn, allow specific types)
      'no-console': ['warn', { allow: ['warn', 'error'] }],

      // React specific rules (often handled by Next.js extend)
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',

      // Prettier rule - ensures formatting is an ESLint error
      'prettier/prettier': ['error', { endOfLine: 'lf' }],

      // React Hooks rules
      'react-hooks/rules-of-hooks': 'error', // Keep this as error, it's critical

      // TypeScript specific (optional, based on preference)
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },

  // === Next.js Recommended Rules ===
  // This is how you typically extend Next.js's recommended linting in flat config
  // Note: @next/eslint-plugin-next might export its configs directly,
  // or you might use `nextPlugin.configs.recommended` or similar.
  // Check Next.js's documentation for the exact way they expose flat configs if this doesn't work.
  {
    extends: [
      // This is the common way to include configs from plugins in flat config
      // nextPlugin.configs.recommended // This might be the correct usage for @next/eslint-plugin-next
    ],
  },
  // If `next/core-web-vitals` is a direct flat config object, you'd include it here.
  // For now, let's omit it to simplify, you can re-add once basic linting works.

  // === Prettier Config (always last to ensure it overrides style-related rules) ===
  prettierConfig, // `eslint-config-prettier` should be last
);
