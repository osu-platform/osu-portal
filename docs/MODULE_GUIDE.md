# Создание и подключение модуля

Модуль экспортирует `createModule()`, маршруты, виджеты и фикстуры. Он использует SDK и shared-библиотеки, не импортирует runtime, shell, приложения и другие модули. Личность, навигация и API приходят из SDK; права на сервере проверяет сервер.

## Внутренний модуль

```sh
pnpm create-module campus --title "Кампус"
pnpm install
```

Добавить пакет в зависимости `packages/composition/package.json`. В `packages/composition/src/index.ts` зарегистрировать фабрику в `loadModules()`, объединить фикстуры в `loadMockHandlers()`. Оба приложения используют одну композицию. `pnpm dev:host`: проверить `/campus`, виджет, гостя, темы и окружения. Затем `pnpm validate-modules`, типы, тесты и обе сборки.

## Внешний модуль

```text
private-project/
├── portal/                  # Git submodule
├── modules/campus/          # единственный исходник частного модуля
├── integration/             # modules.config.ts, vite.config.ts, tsconfig.json
├── package.json
├── pnpm-workspace.yaml
└── pnpm-lock.yaml
```

Из корня частного проекта: `node portal/scripts/create-module.mjs campus --out modules/campus --title "Кампус"`. Базовый tsconfig вычисляется относительно нового каталога.

Общий workspace включает `modules/*`, `portal/apps/*`, `portal/packages/*`, `portal/packages/shared/*`, `portal/packages/modules/*`. Частный модуль объявляется зависимостью интеграционного корня. Внешний Vite-конфиг импортирует штатный конфиг приложения, задаёт root приложения и aliases `@portal/module-composition` → внешний modules.config.ts, `@portal/modules-campus` → внешний src. `mergeConfig` и `portal/scripts/lib/workspace.mjs` переиспользуют существующие настройки. Dedupe React/ReactDOM, router, query и SDK; server.fs.allow включает корень частного проекта. Артефакты направляются вне submodule.

Внешняя композиция экспортирует `loadModules()` и `loadMockHandlers()`, регистрирует нужные модули и объединяет их фикстуры. TypeScript задаёт те же paths, `types: ["vite/client"]`, корректные include/exclude; конфиг модуля наследует интеграционный. Vitest включает внешние тесты и shared aliases, Storybook — внешние stories и штатные UI-декораторы. React, SDK, UI и runtime не копируются.

```sh
node portal/scripts/validate-modules.mjs --dir modules/campus
```

`--dir` можно повторять; без него проверяются публичные модули. После frozen install проверить TypeScript, обе сборки, маршруты, dashboardWidget и HMR внешних TSX/CSS. Для обновления сначала меняется upstream portal, затем закреплённый commit submodule; ручные правки внутри submodule не нужны.

Функции изменения данных возвращают результат, успех показывается после API. Фикстуры отделены от live и обозначены как демо. Не вшивайте приватные URL и не обращайтесь напрямую к глобальным SDK мессенджеров. Contract version согласуйте с module-sdk; зависимости объявляйте в manifest.
