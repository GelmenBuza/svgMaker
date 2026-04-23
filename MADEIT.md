# Аудит проекта svgMaker (23.04.2026)

## Что проверено
- Структура `backend` и `frontend`, ключевые контроллеры и store/utility модули.
- Сборка backend: `cd backend && npm run build` (упала с TypeScript ошибкой).
- Линт frontend: `cd frontend && npm run lint` (много ошибок React Hooks/unused vars).
- Сборка frontend: `cd frontend && npm run build` (успешно, но это не отменяет lint/runtime риски).

## Критичные проблемы (исправлять в первую очередь)

### 1) IDOR в чтении snapshot проекта
- **Где:** `backend/src/controllers/userController.ts` (`getProjectSnapshot`).
- **Проблема:** snapshot ищется по `projectId + version` без проверки `userId` владельца.
- **Риск:** авторизованный пользователь может запросить чужой snapshot.
- **Шаги решения:**
  1. Фильтровать через relation: `where: { projectId, version, project: { userId: req.userId } }`.
  2. Добавить e2e тест: чужой `projectId` должен давать `404/403`.
  3. Добавить логирование security-событий для таких попыток.

### 2) Некорректный refresh/logout flow
- **Где:** `backend/src/controllers/authController.ts`, `backend/src/routes/authRoutes.ts`.
- **Проблема:** refresh-токен не сверяется с `user.refresh_token` в БД; logout без `await prisma.user.update`, clearCookie без явного `path`.
- **Риск:** reuse старого refresh токена, неполная инвалидация сессии.
- **Шаги решения:**
  1. В `refreshToken` сверять токен из cookie с БД (лучше хранить hash токена).
  2. На `/logout` обязательно очищать БД поле refresh токена через `await`.
  3. Привести `setCookie/clearCookie` к единому `path` (`/api/auth/refresh-token`).
  4. Защитить cookie флагом `secure: process.env.NODE_ENV === "production"`.

### 3) Отсутствует уникальность email в БД
- **Где:** `backend/prisma/schema.prisma` (`User.email`).
- **Проблема:** нет `@unique`, а в коде много `findFirst` по email.
- **Риск:** дубли email, race condition при регистрации, непредсказуемая авторизация.
- **Шаги решения:**
  1. Добавить `@unique` к `User.email`.
  2. Подготовить миграцию: дедупликация существующих данных.
  3. Перевести lookup на `findUnique`.
  4. Обрабатывать Prisma `P2002` в register/changeEmail.

### 4) Backend не собирается
- **Где:** `backend/src/soket/chatService.ts`.
- **Проблема:** `TS2304: Cannot find name 'Messages'`.
- **Риск:** backend build блокируется полностью.
- **Шаги решения:**
  1. Заменить тип `Messages` на корректный Prisma type (`Prisma.MessagesGetPayload<...>` или `import type { Messages } from "@prisma/client"`).
  2. Прогнать `npm run build` повторно.
  3. Добавить CI gate на typecheck/build.

## Высокий приоритет

### 5) Сброс Zustand store не выполняется
- **Где:** `frontend/src/utils/setAllStoresToStart.js`.
- **Проблема:** методы reset перечислены без вызова (`clearSelected` вместо `clearSelected()`).
- **Риск:** logout оставляет старое состояние пользователя/элементов.
- **Шаги решения:**
  1. Использовать `store.getState().method()` для каждого сброса.
  2. Либо сделать единый `resetAllStores()` action.
  3. Добавить smoke-тест logout/reset.

### 6) Много нарушений React Hooks правил
- **Где:** `frontend/src/components/CustomContextMenu/index.jsx`, `frontend/src/components/DraggableDots/index.jsx`, `frontend/src/components/DraggableSettings.jsx`, `frontend/src/pages/DrawPage/index.jsx`.
- **Проблема:** хуки вызываются условно или вне React-компонента.
- **Риск:** нестабильные рендеры, runtime баги, сложно дебажить.
- **Шаги решения:**
  1. Поднять все хуки в верхний уровень компонента.
  2. Разделить условные ветки UI в дочерние компоненты.
  3. Вынести side-effect логику в корректные `useEffect`.
  4. Добиться чистого `npm run lint`.

### 7) Несовместимость формата ошибок API
- **Где:** `frontend/src/api/userApi.js` + backend user контроллеры.
- **Проблема:** frontend часто ожидает `message`, backend часто отдает `error`.
- **Риск:** пользователь не видит реальные ошибки.
- **Шаги решения:**
  1. Унифицировать контракт (`{ error: string | null, data?: ... }`).
  2. Сделать общий helper `parseApiError(response)`.
  3. Привести контроллеры к одному формату ответа.

### 8) Прямая мутация данных в редакторе
- **Где:** `frontend/src/components/CustomContextMenu/index.jsx`, `frontend/src/components/DraggableDots/index.jsx`.
- **Проблема:** используются `splice` и прямое изменение объектов точек.
- **Риск:** пропуски ререндеров, гонки состояния, ломание memo.
- **Шаги решения:**
  1. Перейти на immutable обновления (`map`, `slice`, spread-копии).
  2. Изолировать преобразования точек в pure functions.
  3. Проверить производительность и поведение drag/edit после рефакторинга.

## Средний приоритет

### 9) Hardcoded API URL во frontend
- **Где:** `frontend/src/api/userApi.js` и другие API модули.
- **Проблема:** `http://localhost:3000` зашит в код.
- **Шаги решения:** перейти на `VITE_API_BASE_URL`, сделать единый API client.

### 10) Неполная валидация payload на backend
- **Где:** auth/user контроллеры.
- **Проблема:** нет схемной валидации размеров/форматов.
- **Шаги решения:** добавить Zod/Joi на входные DTO и лимиты размеров snapshot.

### 11) Soft-delete пользователя через статичные `DELETED` значения
- **Где:** `backend/src/controllers/userController.ts`.
- **Проблема:** ломает уникальность и историчность данных.
- **Шаги решения:** использовать `deleted+<id>@...`, ввести единый фильтр `deletedAt: null`.

### 12) Undefined symbol в store
- **Где:** `frontend/src/stores/elementsStore.jsx`.
- **Проблема:** `scalePoints` используется без импорта.
- **Шаги решения:** добавить импорт из `utils/scalePoints.js` и покрыть unit тестом `scaleElement`.

## Низкий приоритет / техдолг
- Удалить/заменить лишние `console.log` в production коде.
- Подтянуть TS strict-флаги в `backend/tsconfig.json`.
- Добавить rate-limit на auth endpoints.
- Завести CI pipeline: lint + build + (минимум) smoke tests.

## Рекомендуемый порядок внедрения
1. **Security & Auth hotfix:** IDOR, refresh/logout, cookie flags/path, unique email.
2. **Stability hotfix:** backend build fix (`Messages` type), store reset, React Hooks ошибки.
3. **DX & quality:** единый API error contract, env-конфиг, валидации, CI.
