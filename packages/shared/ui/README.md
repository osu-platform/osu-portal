# @portal/shared-ui

Переиспользуемая библиотека UI компонентов для OSU Portal.

## Описание

Этот пакет содержит базовые UI компоненты, которые используются во всех частях приложения OSU Portal. Все компоненты полностью независимы от бизнес-логики и используют семантическую систему токенов через CSS custom properties с префиксом `--p-`.

## Структура

```text
src/
├── components/
│   ├── layout/          # Компоненты структуры (Section, Divider)
│   ├── typography/      # Текстовые компоненты (Text)
│   ├── data-display/    # Компоненты отображения данных (CellMini, ScheduleCell)
│   └── navigation/      # Навигационные компоненты (Tabbar, AppleTabbar)
└── index.ts             # Главный файл экспорта
```

## Использование

```tsx
import { Section, Text, Tabbar } from "@portal/shared-ui"

function MyComponent() {
  return (
    <Section title="Заголовок">
      <Text type="text">Содержимое секции</Text>
    </Section>
  )
}
```

## Компоненты

### Layout

- **Section** - Секция с заголовком и содержимым
- **Divider** - Разделительная линия

### Typography

- **Text** - Текстовый компонент с типографикой Telegram UI

### Data Display

- **CellMini** - Компактная ячейка для списков
- **ScheduleCell** - Ячейка для отображения занятия из расписания

### Navigation

- **Tabbar** - Нижняя панель навигации (Telegram стиль)
- **AppleTabbar** - Нижняя панель навигации (Apple стиль с эффектом стекла)

## Темизация

Все компоненты используют CSS переменные с префиксом `--p-`, определяемые через `@portal/shared-theme`:

- `--p-color-bg-primary` - Основной фон
- `--p-color-text-primary` - Основной текст
- `--p-color-surface-section` - Фон секции
- `--p-color-accent` - Акцентный цвет
- и другие...

## Разработка

Для просмотра компонентов используйте Storybook:

```bash
npm run storybook
```

Каждый компонент имеет соответствующий `.stories.tsx` файл с примерами использования.

## Требования

- React ^18.2.0
- @telegram-apps/telegram-ui ^2.1.8
- @portal/shared-theme (для темизации)
