# Backend (`backend`)

Node.js/TypeScript backend для `svg_maker`: REST API авторизации, endpoint пользователя, Socket.IO чат и работа с PostgreSQL через Prisma.

## Стек

- Express 5
- TypeScript
- Prisma + PostgreSQL
- JWT + cookie-based auth
- Socket.IO

## Запуск

### Требования

- Node.js LTS
- PostgreSQL

### Установка

```bash
npm install
```

### ENV

Создайте `backend/.env`:

```env
PORT=3000
CLIENT_ORIGIN=http://localhost:5173
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/svg_maker
JWT_SECRET=super_secret_key
```

### Prisma

```bash
npm run prisma:generate
npm run prisma:migrate
```

### Команды

- `npm run dev` — dev-сервер (`ts-node-dev`)
- `npm run build` — генерация Prisma Client + сборка TypeScript в `dist`
- `npm run start` — запуск production-сборки
- `npm run prisma:generate` — сгенерировать Prisma Client
- `npm run prisma:migrate` — применить миграции
- `npm run prisma:push` — протолкнуть схему в БД без миграций

## API

### Healthcheck

- `GET /health`

Ответ:

```json
{
  "ok": true,
  "service": "backend",
  "timestamp": "2026-04-14T12:00:00.000Z"
}
```

### Auth

Базовый путь: `/api/auth`

- `POST /register` — регистрация
- `POST /login` — логин
- `POST /logout` — logout
- `POST /refresh-token` — обновление access token

После успешного `register/login` сервер выставляет:

- `accessToken` (httpOnly cookie, 15 минут)
- `refreshToken` (httpOnly cookie, 7 дней)

### User

Базовый путь: `/api/user`

- `GET /auth/me` — получить текущего пользователя (через `Authorization: Bearer <accessToken>`)

## Socket.IO чат

Подключение идет к корню backend (`http://localhost:3000`), transport: websocket.

События:

- `chat:join` (client -> server): `{ room, nickname }`
- `chat:history` (server -> client): история комнаты
- `chat:message` (двусторонне): отправка и трансляция сообщений

При входе/выходе пользователя сервер пишет системные сообщения в комнату.

## Модель данных (Prisma)

### `User`

- `id`, `email`, `username`, `role`, `password`, `refresh_token`, `createdAt`

### `Messages`

- `id`, `room`, `sender_id`, `nickname`, `content`, `createdAt`

## Структура

```text
backend/
├── src/
│   ├── index.ts                 # HTTP + Socket.IO bootstrap
│   ├── controllers/             # auth и user handlers
│   ├── routes/                  # express routes
│   ├── middleware/              # auth middleware
│   ├── soket/                   # chat handlers/service
│   ├── utils/                   # jwt helpers
│   └── prismaClient.ts          # Prisma client setup
└── prisma/
    ├── schema.prisma
    └── migrations/
```

