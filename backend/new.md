# Что было сделано

## 1) Поднят минимальный рабочий backend на TypeScript

Созданы/обновлены файлы:

- `backend/package.json`
- `backend/package-lock.json` (создан автоматически через npm install)
- `backend/tsconfig.json`
- `backend/src/index.ts`

Установлены обязательные зависимости:

- `bcrypt`
- `cookie-parser`
- `cors`
- `express`
- `jsonwebtoken`
- `typescript`

Также добавлены dev-зависимости для TypeScript-окружения:

- `ts-node-dev`
- `@types/node`
- `@types/express`
- `@types/cors`
- `@types/cookie-parser`
- `@types/bcrypt`
- `@types/jsonwebtoken`

Добавлены npm scripts:

- `npm run dev` — запуск в режиме разработки
- `npm run build` — сборка в `dist`
- `npm run start` — запуск собранного backend

## 2) Реализован базовый API

В `backend/src/index.ts` добавлены:

- Middleware: `cors`, `express.json`, `cookie-parser`
- `GET /health` — проверка работы сервиса
- `POST /auth/register` — регистрация пользователя (хеширование пароля через `bcrypt`)
- `POST /auth/login` — логин и установка JWT в `httpOnly` cookie
- `GET /auth/me` — проверка текущего пользователя по cookie
- `POST /auth/logout` — очистка auth cookie

Текущая реализация хранения пользователей — in-memory массив (без БД), чтобы backend был максимально простым и сразу рабочим.

## 3) Обновлен .gitignore

В корневой `.gitignore` добавлено игнорирование env-файлов:

- `.env`
- `.env.*`
- `backend/.env`
- `backend/.env.*`

Исключение:

- `!.env.example` (чтобы можно было хранить шаблон env в репозитории)

## 4) Как запустить backend

```bash
cd backend
npm run dev
```

По умолчанию backend стартует на `http://localhost:4000`.

## 5) Добавлена Prisma (по подтверждению)

Установлены пакеты:

- `prisma`
- `@prisma/client`

Созданы и настроены файлы:

- `backend/prisma/schema.prisma`
- `backend/prisma.config.ts`
- `backend/.env`
- `backend/prisma/migrations/.../migration.sql`

Что добавлено по Prisma:

- SQLite datasource для быстрого локального старта
- модель `User` (id, email, passwordHash, createdAt)
- генерация Prisma Client в `backend/src/generated/prisma`
- подготовлена структура для дальнейшего подключения Prisma в auth-логику

Добавлены scripts:

- `npm run prisma:generate`
- `npm run prisma:migrate`

Применена первая миграция:

- `npm run prisma:migrate -- --name init`

## 6) Дополнения в .gitignore для Prisma/SQLite

Обновлены игноры:

- `backend/dev.db`
- `backend/dev.db-journal`
- `backend/.env`
- `backend/src/generated/prisma`
