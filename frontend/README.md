# Frontend (`frontend`)

Клиентская часть `svg_maker`: авторизация, SVG-редактор и виджет чата.

## Основные возможности

- Формы `Login`/`Register` с вызовом backend API.
- Роутинг:
  - `/` — логин
  - `/register` — регистрация
  - `/draw` — основной экран редактора
- Редактор SVG path:
  - создание преднастроенного `Path`
  - режим `DIY` (пошаговая отрисовка контура кликами)
  - drag пути, изменение узлов/Bezier handles, поворот
  - контекстное меню узлов и сегментов
  - генерация итогового SVG-кода
- Чат на Socket.IO (комната `general`) в плавающем виджете.

## Стек

- React 19
- Vite 7
- React Router
- Zustand
- Socket.IO Client

## Требования

- Node.js LTS
- Запущенный backend (`http://localhost:3000` по умолчанию)

## Установка и запуск

```bash
npm install
npm run dev
```

Дополнительные команды:

- `npm run build` — production-сборка в `dist`
- `npm run preview` — просмотр production-сборки
- `npm run lint` — проверка ESLint

## ENV

Необязательная переменная:

```env
VITE_BACKEND_URL=http://localhost:3000
```

Если не задана, используется `http://localhost:3000`.

## Интеграция с backend

REST:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/refresh-token`

WebSocket:

- события `chat:join`, `chat:history`, `chat:message`

## Состояние (Zustand)

- `userStore` — текущий пользователь (логин-сессия на клиенте).
- `elementsStore` — массив SVG-элементов и операции редактирования:
  - `updateElements`
  - `setCustomizableElement`
  - `addPoint` / `updatePoint` / `removePoint`
  - `scaleElement` и другие вспомогательные методы

## Структура

```text
frontend/
├── src/
│   ├── App.jsx                    # Router
│   ├── pages/
│   │   ├── Login/
│   │   ├── Register/
│   │   └── DrawPage/              # SVG editor page
│   ├── components/
│   │   ├── DraggablePath.jsx
│   │   ├── DraggableSettings.jsx
│   │   ├── DraggableDots/
│   │   ├── ElementsSettings/
│   │   ├── CustomContextMenu/
│   │   ├── NavMenu/
│   │   └── Chat/
│   ├── stores/
│   │   ├── userStore.jsx
│   │   └── elementsStore.jsx
│   ├── api/
│   │   ├── authApi.js
│   │   └── chatApi.js
│   └── utils/                     # parse/serialize/geometry helpers
├── index.html
└── vite.config.js
```

## Как это работает в UI

1. Пользователь логинится или регистрируется.
2. Открывает `/draw`.
3. Добавляет `Path` или рисует через `DIY`.
4. Редактирует геометрию, визуальные параметры и угол поворота.
5. Копирует сгенерированный SVG-код.
6. При необходимости использует чат без выхода со страницы редактора.
