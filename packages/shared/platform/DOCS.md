# Platform Runtime Module

Модуль предоставляет единый интерфейс для работы с приложением во всех окружениях: браузер, PWA, нативные приложения через Capacitor, Telegram и Max mini-apps.

## Основная идея

Приложение может работать в разных местах при разных условиях. Модуль скрывает эти различия за адаптерами. Код приложения не нужно переписывать для каждой платформы - используешь хуки, они берут нужный адаптер и работают везде.

## Три измерения окружения

Приложение характеризуется тремя параметрами:

- **Host** - контейнер, где работает приложение (браузер, PWA, Telegram, Max, Capacitor)
- **Runtime** - какие возможности доступны (web, pwa, native, webview)
- **Platform** - операционная система (ios, android, tdesktop, web)

Пример: Telegram на iPhone имеет host='telegram', runtime='webview', platform='ios'.

## Использование

### 1. Обёрнуть приложение провайдером

В главном файле приложения:

```tsx
import { RuntimeProvider } from "@portal/shared-platform"

function App() {
  return (
    <RuntimeProvider>
      <YourApp />
    </RuntimeProvider>
  )
}
```

RuntimeProvider инициализирует модуль и делает адаптер доступным для всех компонентов через контекст React.

### 2. Использовать хуки

Хуки предоставляют доступ к функциям платформы:

```tsx
import { useRuntimeInfo, useNative, useStorage } from "@portal/shared-platform"

function MyComponent() {
  const runtimeInfo = useRuntimeInfo()
  const native = useNative()
  const storage = useStorage()

  // Получить информацию о платформе
  console.log(runtimeInfo.host, runtimeInfo.platform)

  // Использовать возможности
  await native?.vibrate("medium")
  await storage?.setItem("key", value)
}
```

### Доступные хуки

- `useRuntimeInfo()` - информация о хосте, рантайме и платформе
- `useNative()` - вибрация, haptic feedback, share
- `useRuntimeNavigation()` - навигация, back button
- `useSafeArea()` - область экрана без notch и dynamic island
- `useStorage()` - локальное хранилище
- `useUpdater()` - проверка и применение обновлений

## Как работает внутри

### Инициализация

При загрузке приложения модуль:

1. Определяет окружение (детектирует host через признаки: TelegramWebviewProxy, ancestorOrigins, Capacitor, Service Worker)
2. Загружает внешние скрипты если нужны (Telegram SDK, Max SDK)
3. Создаёт адаптер для detected host
4. Адаптер определяет платформу (iOS, Android, Web, tdesktop)
5. Предоставляет адаптер через контекст React

### Детекция

Детекция хоста проверяет признаки в порядке приоритета:

- TelegramWebviewProxy в window - Telegram
- ancestorOrigins содержит max.ru - Max
- window.Capacitor существует и isNativePlatform() true - Capacitor
- Браузер в standalone режиме или Service Worker активен - PWA
- По умолчанию - Browser

### Адаптеры

Каждый хост имеет адаптер в папке `adapters/{host}/`. Адаптер реализует интерфейс RuntimeAdapter.

RuntimeAdapter состоит из пяти компонентов:

- **navigation** - управление историей и back button
- **safeArea** - получение insets для notch и динамических элементов экрана
- **native** - доступ к нативным возможностям (вибрация, share, haptic feedback)
- **storage** - локальное хранилище данных
- **updater** - проверка и применение обновлений

Разные хосты предоставляют разные уровни функциональности. Например, браузер не может обновлять приложение через встроенный механизм, поэтому updater возвращает no-op. Capacitor использует Web APIs как fallback до тех пор пока не интегрированы реальные плагины.

### Defaults

Папка `adapters/defaults/` содержит стандартные реализации для компонентов, которые работают везде:

- navigation.ts - использует History API для навигации
- safeArea.ts - использует CSS env() переменные и ResizeObserver для отслеживания изменений
- storage.ts - синхронный localStorage обёрнут в async интерфейс
- updater.ts - no-op реализация

Большинство адаптеров переиспользуют эти defaults вместо копирования кода.

### Специфичные реализации

Некоторые компоненты переопределяются для специфичных хостов:

- telegram/native.ts - использует Telegram.WebApp.HapticFeedback API для haptics и vibration
- browser/native.ts, pwa/native.ts - используют Web Vibration API и Web Share API
- pwa/updater.ts - управляет Service Worker обновлениями
- capacitor/native.ts, capacitor/updater.ts - пока заглушки, используют fallbacks на Web APIs

## Примеры использования

### Вибрировать при клике

```tsx
const MyButton = () => {
  const native = useNative()

  const handleClick = async () => {
    await native?.vibrate("medium")
  }

  return <button onClick={handleClick}>Click me</button>
}
```

### Показать информацию о платформе

```tsx
const DebugInfo = () => {
  const info = useRuntimeInfo()

  if (!info) return <div>Loading...</div>

  return (
    <div>
      Host: {info.host}
      Runtime: {info.runtime}
      Platform: {info.platform}
      Is Native: {info.isNative ? "Yes" : "No"}
      Is Telegram: {info.isTelegram ? "Yes" : "No"}
    </div>
  )
}
```

### Сохранить и восстановить данные

```tsx
const MyComponent = () => {
  const storage = useStorage()

  const save = async () => {
    await storage?.setItem("userData", { name: "John" })
  }

  const restore = async () => {
    const data = await storage?.getItem("userData")
    console.log(data)
  }

  return (
    <>
      <button onClick={save}>Save</button>
      <button onClick={restore}>Restore</button>
    </>
  )
}
```

### Поделиться контентом

```tsx
const ShareButton = () => {
  const native = useNative()

  const share = async () => {
    await native?.share({
      title: "Check this out",
      text: "Good content",
      url: "https://example.com",
    })
  }

  return <button onClick={share}>Share</button>
}
```

## Тестирование

В приложении есть mock страница (`src/app/mock.tsx`), которая показывает:

- Текущие значения host, runtime, platform
- Флаги окружения (isWeb, isPWA, isNative, isTelegram, isMax)
- Интерактивную демонстрацию всех хуков

Откройте `/dev` в приложении чтобы видеть эту страницу.

## Расширение

Если требуется поддержка нового хоста:

1. Создайте папку `adapters/{newhost}/`
2. Реализуйте функцию `create{Newhost}Adapter()` которая возвращает RuntimeAdapter
3. Добавьте детекцию хоста в `detectEnvironment()` в runtime.ts
4. Экспортируйте функцию из `adapters/index.ts`
5. Добавьте case в switch в initRuntime()

Рекомендуется переиспользовать компоненты из defaults вместо копирования.

## API Справка

### Типы

```typescript
type HostType = "browser" | "pwa" | "capacitor" | "max" | "telegram" | "unknown"
type RuntimeType = "web" | "pwa" | "native" | "webview"
type PlatformType = "ios" | "android" | "tdesktop" | "web" | "unknown"
```

### RuntimeInfo

```typescript
interface RuntimeInfo {
  host: HostType
  runtime: RuntimeType
  platform: PlatformType
  isNative: boolean
  isWeb: boolean
  isPWA: boolean
  isTelegram: boolean
  isMax: boolean
}
```

### NavigationAdapter

```typescript
interface NavigationAdapter {
  push(path: string): void
  replace(path: string): void
  back(): void
  canGoBack(): boolean
}
```

### NativeAdapter

```typescript
interface NativeAdapter {
  vibrate(type: "light" | "medium" | "heavy"): void
  share(options: { title?: string; text?: string; url?: string }): Promise<void>
  hapticFeedback(type: "success" | "warning" | "error"): void
}
```

### SafeAreaAdapter

```typescript
interface SafeAreaAdapter {
  getInsets(): { top: number; bottom: number; left: number; right: number }
  subscribe(callback: (insets) => void): () => void
}
```

### StorageAdapter

```typescript
interface StorageAdapter {
  get<T>(key: string): Promise<T | null>
  set(key: string, value: unknown): Promise<void>
  remove(key: string): Promise<void>
  clear(): Promise<void>
}
```

### UpdaterAdapter

```typescript
interface UpdaterAdapter {
  checkUpdates(): Promise<{ updateAvailable: boolean; currentVersion: string }>
  downloadUpdate(version: string): Promise<boolean>
  applyUpdate(): Promise<void>
  getCurrentVersion(): string
}
```
