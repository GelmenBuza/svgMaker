# svg_maker

Полноценное веб-приложение для создания SVG `path`-контуров с интерактивным редактированием, авторизацией пользователей и встроенным realtime-чатом.

## Что умеет проект

- Рисование и редактирование SVG-контуров (drag, rotate, управление узлами и ручками Безье).
- Режим `DIY` для пошагового построения пути кликами по SVG-области.
- Регистрация/логин с JWT (access + refresh) и хранением токенов в cookie.
- Общий чат через Socket.IO с историей сообщений в PostgreSQL.

## Архитектура

Проект разделен на два независимых приложения:

- `frontend` — React/Vite клиент (UI, редактор SVG, форма auth, чат-виджет).
- `backend` — Express API + Socket.IO + Prisma (auth, user endpoints, chat transport и persistence).

Клиент работает с backend по двум каналам:

1. REST API (`/api/auth`, `/api/user`) для авторизации и данных пользователя.
2. WebSocket (Socket.IO) для realtime-чата.

## Технологии

- Frontend: React 19, Vite 7, Zustand, React Router, Socket.IO Client.
- Backend: Express 5, TypeScript, Prisma, PostgreSQL, JWT, bcrypt, Socket.IO.

## Требования

- Node.js LTS + npm
- PostgreSQL (локально или удаленно)

## Быстрый старт

### 1) Установить зависимости

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2) Настроить backend env

Создайте файл `backend/.env`:

```env
PORT=3000
CLIENT_ORIGIN=http://localhost:5173
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/svg_maker
JWT_SECRET=super_secret_key
```

### 3) Подготовить базу данных

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
```

### 4) Запустить backend

```bash
cd backend
npm run dev
```

### 5) Запустить frontend

```bash
cd frontend
npm run dev
```

По умолчанию:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`

## Структура репозитория

```text
svg_maker/
├── frontend/    # клиентское приложение
└── backend/     # API, WebSocket, Prisma, миграции
```

## Поток работы пользователя

1. Пользователь регистрируется или логинится.
2. Переходит на экран рисования `/draw`.
3. Создает `Path` или рисует вручную через `DIY`.
4. Редактирует контур (узлы, ручки, поворот, цвета, stroke).
5. Получает готовый SVG-код внизу страницы.
6. Может открыть чат и общаться в комнате `general`.

## Документация по частям

- Подробно по клиенту: `frontend/README.md`
- Подробно по серверу: `backend/README.md`

