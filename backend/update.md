# Разбор ошибки в `prisma.config.ts`

Проблемный участок:

```ts
datasource: {
  url: process.env["DATABASE_URL"],
},
```

## Что именно ломается

Чаще всего IDE/TypeScript показывает ошибку вида:

- `Type 'string | undefined' is not assignable to type 'string'`

Причина:

- `process.env["DATABASE_URL"]` по типам Node всегда имеет тип `string | undefined`.
- `defineConfig` для `datasource.url` ожидает строку.
- Даже если в `.env` реально есть значение, TypeScript этого не знает на этапе проверки типов.

---

## Текущее состояние проекта

Проверено командой:

```bash
cd backend
npm run prisma:generate
```

Результат:

- Prisma CLI успешно грузит `prisma.config.ts`
- `.env` читается корректно (`import "dotenv/config"` есть)
- генерация клиента проходит без runtime-ошибок

Итого: проблема не в Prisma CLI, а в статической типизации/валидации env.

---

## Почему это важно исправить

Если оставить как есть:

- IDE будет постоянно подсвечивать ошибку;
- при случайно пустом `DATABASE_URL` можно получить падение уже в runtime;
- диагностика причины будет поздней (не fail-fast).

---

## Рекомендуемый фикс (надежный)

Сделать явную проверку переменной до `defineConfig`:

```ts
import "dotenv/config";
import { defineConfig } from "prisma/config";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set. Check backend/.env");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
  },
});
```

Плюсы:

- уходит TS-ошибка;
- получаешь понятную ошибку сразу при старте Prisma-команд;
- меньше риска «тихих» проблем из-за пустого env.

---

## Альтернативы (хуже, но быстрые)

1. Type assertion:

```ts
url: process.env["DATABASE_URL"] as string
```

Минус: отключает защиту типов, но не проверяет реальное наличие переменной.

2. Non-null assertion:

```ts
url: process.env["DATABASE_URL"]!
```

Минус: аналогично, runtime-падение останется возможным.

---

## Что еще проверить рядом с этой ошибкой

1. Что команды Prisma запускаются из `backend`:
   - иначе может читаться не тот `.env`.
2. Что в `backend/.env` `DATABASE_URL` не пустой.
3. Что URL соответствует провайдеру в `schema.prisma`:
   - у тебя сейчас `provider = "postgresql"`, значит строка должна быть PostgreSQL-формата.

---

## Короткий вывод

У тебя рабочая runtime-конфигурация Prisma, но есть типовой TS-недочет в `datasource.url`.
Лучший вариант — вынести `DATABASE_URL` в переменную, проверить её и только после этого передавать в `defineConfig`.
