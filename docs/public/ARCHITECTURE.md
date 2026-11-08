# Архитектура

Приложения portal и module-host используют одну реализацию runtime, SDK и UI. Оболочка находится в packages/shell, публичная композиция — packages/composition. Реестр runtime объединяет маршруты и виджеты. Стандартная композиция содержит расписание; внешний проект может переопределить её alias без копии хоста.

Модули зависят от SDK и shared-библиотек. Платформенные адаптеры принадлежат порталу. Live и demo удовлетворяют одному контракту; demo использует локальные фикстуры без API-сети, live включается явно и сохраняет исходную авторизацию. React, React Router, TanStack Query и SDK dedupe-ятся внутри одного приложения.

Стек: React, TypeScript, Vite, pnpm workspace, TanStack Query, React Router, Zustand. Пакеты разрешаются из исходников; Vite aliases и TypeScript paths согласованы.
