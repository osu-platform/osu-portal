# Архитектура @portal/shared-ui

## Обзор

`@portal/shared-ui` - это переиспользуемая библиотека UI компонентов для OSU Portal, построенная по принципам Feature-Sliced Design и независимая от бизнес-логики приложения.

## Принципы Дизайна

### 1. Независимость от бизнес-логики

Компоненты UI kit не содержат:

- Бизнес-логику приложения
- Прямые вызовы API
- Зависимости от store/state management
- Специфичную для домена логику (расписание, пользователи и т.д.)

Вместо этого компоненты:

- Принимают данные через props
- Вызывают колбэки для обработки событий
- Используют композицию для сложных случаев

### 2. Семантическая система токенов

Все стили используют CSS переменные с префиксом `--p-` (portal):

```css
/* ❌ Плохо - прямое указание цвета */
color: #ff0000;

/* ❌ Плохо - специфичное имя */
color: var(--red-color);

/* ✅ Хорошо - семантический токен */
color: var(--p-color-destructive);
```

Это обеспечивает:

- Единообразную темизацию
- Автоматическую адаптацию под светлую/темную тему
- Легкость кастомизации
- Обратную совместимость через fallback

### 3. Telegram UI Integration

Компоненты используют `@telegram-apps/telegram-ui` там, где это уместно:

- Text компонент - обертка над Telegram типографикой
- Tabbar - использует Telegram UI компонент
- Следование дизайн-гайдам Telegram Mini Apps

### 4. TypeScript-first

Все компоненты:

- Строго типизированы
- Имеют экспортируемые типы props
- Поддерживают generics где необходимо
- Документированы через JSDoc

### 5. Accessibility

- Keyboard navigation support
- ARIA attributes
- Semantic HTML
- Focus management

## Структура пакета

```
packages/shared/ui/
├── package.json              # Конфигурация пакета
├── tsconfig.json             # TypeScript конфиг
├── README.md                 # Общая документация
├── USAGE_EXAMPLES.md         # Примеры использования
├── CSS_VARIABLES.md          # Документация по CSS переменным
├── ARCHITECTURE.md           # Этот файл
├── .gitignore
└── src/
    ├── index.ts              # Главный файл экспорта
    ├── declarations.d.ts     # Type declarations для CSS модулей
    └── components/
        ├── layout/           # Layout компоненты
        │   ├── Section/
        │   │   ├── Section.tsx
        │   │   ├── Section.module.css
        │   │   ├── Section.stories.tsx
        │   │   └── index.ts
        │   └── Divider/
        │       ├── Divider.tsx
        │       ├── Divider.stories.tsx
        │       └── index.ts
        ├── typography/       # Текстовые компоненты
        │   └── Text/
        │       ├── Text.tsx
        │       ├── types.ts
        │       ├── Text.stories.tsx
        │       └── index.ts
        ├── data-display/     # Компоненты отображения данных
        │   ├── CellMini/
        │   │   ├── CellMini.tsx
        │   │   ├── CellMini.module.css
        │   │   ├── CellMini.stories.tsx
        │   │   └── index.ts
        │   └── ScheduleCell/
        │       ├── ScheduleCell.tsx
        │       ├── ScheduleCell.module.css
        │       ├── ScheduleCell.stories.tsx
        │       └── index.ts
        └── navigation/       # Навигационные компоненты
            ├── Tabbar/
            │   ├── Tabbar.tsx
            │   ├── Tabbar.module.css
            │   ├── types.ts
            │   ├── Tabbar.stories.tsx
            │   └── index.ts
            └── AppleTabbar/
                ├── AppleTabbar.tsx
                ├── AppleTabbar.module.css
                ├── AppleTabbar.stories.tsx
                └── index.ts
```

## Категории Компонентов

### Layout (Структура)

**Назначение**: Компоненты для организации контента на странице

- `Section` - Контейнер с заголовком, поддерживает сворачивание и кнопки управления
- `Divider` - Разделительная линия

**Принципы**:

- Минимальная логика отображения
- Гибкость через props и children
- Поддержка любого контента

### Typography (Типографика)

**Назначение**: Текстовые компоненты с правильной типографикой

- `Text` - Универсальный текстовый компонент с различными вариантами

**Принципы**:

- Использование Telegram UI типографики
- Семантические цвета
- Типобезопасность

### Data Display (Отображение данных)

**Назначение**: Компоненты для отображения структурированных данных

- `CellMini` - Компактная ячейка для списков и меню
- `ScheduleCell` - Ячейка с множественными слотами для сложных данных

**Принципы**:

- Slot-based композиция
- Loading states
- Интерактивность через callbacks

### Navigation (Навигация)

**Назначение**: Компоненты навигации

- `Tabbar` - Нижняя навигация (Telegram стиль)
- `AppleTabbar` - Нижняя навигация с glass effect (Apple стиль)

**Принципы**:

- Decoupled от роутинга
- Controlled components
- Flexible item rendering

## Паттерны Использования

### Controlled Components

Компоненты не управляют собственным состоянием, если оно должно быть синхронизировано:

```tsx
// ✅ Хорошо - controlled
const [activeTab, setActiveTab] = useState('home');

<Tabbar
  items={tabs}
  activeId={activeTab}
  onItemClick={setActiveTab}
/>

// ❌ Плохо - uncontrolled с внутренним состоянием
<Tabbar items={tabs} defaultActiveId="home" />
```

### Slot Pattern

Для сложных компонентов используется slot pattern:

```tsx
<ScheduleCell
  before={<Icon />} // Left slot
  sup={<Time />} // Above text
  text={<Title />} // Main content
  sub={<Subtitle />} // Below text
  additional={<Type />} // Additional info
  bottom={<Location />} // Bottom info
  after={<Arrow />} // Right slot
/>
```

### Composition over Configuration

Предпочитаем композицию конфигурации:

```tsx
// ✅ Хорошо - композиция
<Section title="Список">
  {items.map(item => (
    <CellMini key={item.id} {...item} />
  ))}
</Section>

// ❌ Плохо - конфигурация
<Section title="Список" items={items} renderItem={renderCellMini} />
```

## Стилизация

### CSS Modules

Используем CSS Modules для локализации стилей:

```tsx
import styles from "./Component.module.css"

;<div className={styles.container}>
  <div className={styles.header}>...</div>
</div>
```

### CSS Variables

Все значения, зависящие от темы, используют CSS переменные:

```css
.container {
  background-color: var(--p-color-bg-primary);
  color: var(--p-color-text-primary);
  border: 1px solid var(--p-color-divider);
}
```

### Responsive Design

Компоненты адаптивны по умолчанию:

- Mobile-first подход
- Relative units (rem, %, vh, vw)
- Flex/Grid layouts

## Storybook Integration

Каждый компонент имеет `.stories.tsx` файл со следующими stories:

1. **Default** - базовое использование
2. **Variants** - различные варианты (если применимо)
3. **States** - различные состояния (loading, disabled и т.д.)
4. **Interactive** - интерактивный пример с управлением
5. **Complex** - комплексные примеры использования

```tsx
export const Default: Story = {
  args: {
    // Default props
  },
}

export const Interactive: Story = {
  render: () => {
    const [state, setState] = useState(initial)
    return <Component {...state} onChange={setState} />
  },
}
```

## Тестирование

### Unit Tests (Будущее)

```tsx
import { render, screen } from "@testing-library/react"
import { CellMini } from "./CellMini"

describe("CellMini", () => {
  it("renders text", () => {
    render(<CellMini icon={<Icon />} text="Test" />)
    expect(screen.getByText("Test")).toBeInTheDocument()
  })

  it("calls onClick when clicked", () => {
    const onClick = jest.fn()
    render(<CellMini icon={<Icon />} text="Test" onClick={onClick} />)
    screen.getByRole("button").click()
    expect(onClick).toHaveBeenCalled()
  })
})
```

### Visual Testing

Storybook stories служат как визуальные тесты:

- Chromatic для screenshot testing
- Manual QA через Storybook

## Зависимости

### Peer Dependencies

```json
{
  "react": "^18.2.0"
}
```

Почему peer: React должен быть общим для всего приложения

### Dependencies

```json
{
  "@telegram-apps/telegram-ui": "^2.1.8"
}
```

Telegram UI компоненты для нативного опыта в Mini Apps

### Dev Dependencies

Storybook зависимости находятся на уровне root проекта

## Migration Path

### Из старого osu-frontend

1. **Найти компонент** в `src/features/components/uikit/`
2. **Определить категорию** (layout, typography, data-display, navigation)
3. **Удалить бизнес-логику**:
   - Store зависимости
   - API вызовы
   - Специфичную логику домена
4. **Обновить CSS переменные** (см. CSS_VARIABLES.md)
5. **Типизировать props**
6. **Создать stories**
7. **Документировать использование**

### Breaking Changes

- `Cell` → `ScheduleCell` (переименован для ясности)
- Удалены внутренние состояния (near, progress и т.д.)
- Удалены зависимости от роутинга
- Удалены прямые вызовы haptic/popup

## Future Improvements

1. **Дополнительные компоненты**:
   - Button, Input, Select
   - Modal, Drawer, Toast
   - Avatar, Badge, Chip

2. **Accessibility**:
   - ARIA live regions
   - Screen reader optimization
   - Keyboard shortcuts

3. **Performance**:
   - React.memo для дорогих компонентов
   - Virtual scrolling для списков
   - Code splitting

4. **Testing**:
   - Unit tests с Jest + RTL
   - E2E tests с Playwright
   - Visual regression tests с Chromatic

5. **Documentation**:
   - Interactive playground
   - A11y guidelines
   - Performance tips

## Contributing

При добавлении новых компонентов:

1. Следуйте существующей структуре папок
2. Используйте CSS Modules
3. Применяйте семантические токены
4. Создайте comprehensive stories
5. Документируйте в USAGE_EXAMPLES.md
6. Экспортируйте из главного index.ts
7. Используйте TypeScript строгую типизацию

## Contacts & Support

При вопросах по архитектуре или добавлению новых компонентов обращайтесь к:

- ARCHITECTURE.md (этот файл)
- USAGE_EXAMPLES.md (примеры использования)
- CSS_VARIABLES.md (система токенов)
- Storybook stories (визуальные примеры)
