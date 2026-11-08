// .storybook/preview.tsx
import React, { StrictMode } from 'react';
import type { Preview } from '@storybook/react';
import { Controls, Description, Primary, Stories, Subtitle, Title } from '@storybook/addon-docs/blocks';
import { INITIAL_VIEWPORTS } from 'storybook/viewport';
import { ThemeProvider, presets, getPreset, DEFAULT_THEME_ID } from '@portal/shared-theme';
import { AppRoot } from '@portal/shared-ui';

/**
 * Вьюпорты, в которых портал реально живёт. Модульные экраны рисуются
 * в webview мессенджера, а не на десктопе, поэтому узкий телефон —
 * значение по умолчанию: перенос заголовка в четыре строки и «стена кнопок»
 * существуют только на такой ширине.
 */
const portalViewports = {
  portalPhone: {
    name: 'Портал — телефон (375×812)',
    styles: { width: '375px', height: '812px' },
    type: 'mobile' as const,
  },
  portalPhoneSmall: {
    name: 'Портал — узкий телефон (320×640)',
    styles: { width: '320px', height: '640px' },
    type: 'mobile' as const,
  },
  ...INITIAL_VIEWPORTS,
};

/** Токен фона канваса: `secondary` — фон страницы, на котором лежат блоки. */
const SURFACE_TOKENS = {
  primary: 'bgPrimary',
  secondary: 'bgSecondary',
} as const;

const preview: Preview = {
  // Enable autodocs Documentation page for ALL stories globally (Storybook 10)
  tags: ['autodocs'],
  parameters: {
    docs: {
      inlineStories: true,
      source: {
        state: 'open',
      },
      // Documentation page layout: title → subtitle → description → primary story → controls table → all other stories
      page: () => (
        <>
          <Title />
          <Subtitle />
          <Description />
          <Primary />
          <Controls />
          <Stories includePrimary={false} />
        </>
      ),
    },

    controls: {
      expanded: true,
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    // Disable built-in backgrounds to let ThemeProvider control it
    backgrounds: {
      disable: true,
      grid: {
        disable: true,
      },
    },

    viewport: {
      options: portalViewports,
    },

    layout: 'centered',

    /**
     * На какой поверхности лежит стори.
     *
     * `primary` — подложка карточки/блока: подходит примитивам кит-а, которые
     * и живут внутри блока. `secondary` — фон страницы: обязателен для
     * экранов модулей, иначе блок и фон красятся одним токеном и композиция
     * из островков выглядит бесшовным документом, которым она не является.
     */
    surface: 'primary',

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    }
  },
  globalTypes: {
    theme: {
      description: 'Тема портала (пресеты из @portal/shared-theme)',
      toolbar: {
        title: 'Тема',
        icon: 'paintbrush',
        // Список берётся из пакета тем, а не дублируется здесь: в тулбаре
        // всегда ровно то, что пользователь может выбрать в настройках.
        items: presets.map((preset) => ({
          value: preset.id,
          title: preset.name,
        })),
        dynamicTitle: true,
      },
    },
    platform: {
      description: 'Platform for components',
      toolbar: {
        title: 'Platform',
        icon: 'mobile',
        items: ['base', 'ios'],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: DEFAULT_THEME_ID,
    platform: 'base',
    viewport: { value: 'portalPhone', isRotated: false },
  },
  decorators: [
    // StrictMode wrapper
    (Story) => (
      <StrictMode>
        <Story />
      </StrictMode>
    ),
    // AppRoot + ThemeProvider wrapper
    (Story, context) => {
      const themeId = context.globals.theme || DEFAULT_THEME_ID;
      const platform = context.globals.platform || 'base';
      const currentTheme = getPreset(themeId) ?? getPreset(DEFAULT_THEME_ID)!;
      const surface = context.parameters.surface === 'secondary' ? 'secondary' : 'primary';
      const backgroundColor = currentTheme.tokens[SURFACE_TOKENS[surface]];
      const textColor = currentTheme.tokens.textPrimary;
      // `fullscreen` — обещание, что стори занимает экран целиком. Паддинг
      // канваса ломает его: элементы, которые уезжают за края блока
      // (горизонтальные ленты, full-bleed обложки), упираются в него и
      // выглядят просто сдвинутыми.
      const padding = context.parameters.layout === 'fullscreen' ? 0 : '2rem';

      return (
        <AppRoot appearance={currentTheme.tokens.scheme} platform={platform}>
          <div style={{ backgroundColor, color: textColor, padding, minHeight: '100%' }}>
            <ThemeProvider
              userTheme={{
                mode: { type: 'preset', presetId: themeId },
              }}
            >
              <Story />
            </ThemeProvider>
          </div>
        </AppRoot>
      );
    },
  ],
};

export default preview;
