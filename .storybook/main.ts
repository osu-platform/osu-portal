import type { StorybookConfig } from '@storybook/react-vite';
import tsconfigPaths from 'vite-tsconfig-paths';

const config: StorybookConfig = {
  stories: [
    // UI Kit — namespaced under "UI Kit/" in sidebar
    {
      directory: '../packages/shared/ui/src',
      titlePrefix: 'UI Kit',
      files: '**/*.@(mdx|stories.@(ts|tsx|js|jsx))',
    },
    // Theme stories
    {
      directory: '../packages/shared/theme',
      titlePrefix: 'Theme',
      files: '**/*.stories.@(ts|tsx|js|jsx)',
    },
    // Core package stories (future)
    {
      directory: '../packages/runtime',
      titlePrefix: 'Runtime',
      files: '**/*.stories.@(ts|tsx|js|jsx)',
    },
    // Module stories (future)
    {
      directory: '../packages/modules',
      titlePrefix: 'Modules',
      files: '**/*.stories.@(ts|tsx|js|jsx)',
    },
    // App-level stories (future)
    '../apps/**/src/**/*.stories.@(ts|tsx|js|jsx)',
    '../apps/**/src/**/*.mdx',
  ],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-vitest',
    '@chromatic-com/storybook',
  ],
  framework: '@storybook/react-vite',
  docs: {
    defaultName: 'Documentation'
  },
  typescript: {
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      shouldRemoveUndefinedFromOptional: true,
      propFilter: (prop) => {
        // Exclude props inherited from node_modules (e.g. HTMLAttributes)
        if (prop.parent) {
          return !prop.parent.fileName.includes('node_modules');
        }
        if (!prop.declarations || prop.declarations.length === 0) {
          return false;
        }
        return !prop.declarations[0].fileName.includes('node_modules');
      },
    },
  },
  viteFinal: async (config) => {
    config.plugins = config.plugins ?? [];
    config.plugins.push(tsconfigPaths());
    return config;
  },
};
export default config;