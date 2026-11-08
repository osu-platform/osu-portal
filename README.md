# Портал ОГУ

Фронтенд студенческого портала: приложение, оболочка, runtime, SDK, общие библиотеки, UI-kit и расписание. Частные модули живут во внешних проектах и не нужны для запуска портала.

## Демонстрация

Нужны Node.js 22+ и pnpm 10.32.1 (Corepack).

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Открыть http://localhost:3000. По умолчанию включён offline demo: вымышленные данные, без токенов и сетевых API. Главная — `/dashboard`; расписание — `/schedule/group/1001/day`. Выбор группы — `/schedule`. Изменения не затрагивают реальные данные. Изолированный DevKit: `pnpm dev:host`, http://localhost:5174, виджеты и настройки SDK на главной.

```sh
pnpm type-check
pnpm validate-modules
pnpm test
pnpm build
pnpm build:host
pnpm preview
```

Готовый SPA — `apps/portal/dist`; веб-сервер возвращает index.html для клиентских маршрутов. `build:host` собирает DevKit. Скопируйте `.env.example` в `.env.local` и явно задайте `VITE_DATA_PROFILE=live` с адресами своих API для реальных серверов. Live использует существующую авторизацию. Секреты нельзя помещать в `VITE_*`: они попадают в браузерный bundle. При смене профиля пересоберите приложение.

## Устройство

- `apps/portal`, `apps/module-host` — два приложения.
- `packages/composition` — публичный список модулей.
- `packages/runtime`, `packages/shared/module-sdk` — единые runtime и SDK.
- `packages/shared` — UI, API, темы, платформа, ресурсы, утилиты.
- `packages/modules/schedule` — расписание с фикстурами.

Создание и внешнее подключение: [руководство](docs/MODULE_GUIDE.md). [Архитектура](docs/ARCHITECTURE.md), [разработка](docs/CONTRIBUTING.md), [лицензионное решение](docs/LICENSE_DECISION.md), [авторские уведомления](THIRD_PARTY_NOTICES.md).

Корневая лицензия остаётся действующей до окончательного выбора авторов. Apache-2.0 рекомендована в лицензионном решении; чужие MIT и другие уведомления сохраняются.

Подготовка всего публичного frontend без истории: `node scripts/public-tree.mjs --out ../portal-public-ready`. До Git init проверка: `node scripts/public-tree.mjs --check ../portal-public-ready`. После создания единственного чистого корневого commit: `node scripts/public-tree.mjs --check-repository ../portal-public-ready`; команда проверяет все refs, отсутствие родителей и содержимое архива HEAD. Публикации и push нет. Не открывайте историю прежнего репозитория вместо подготовки чистого дерева.
