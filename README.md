# Booking Style Landing

Лендинг в стиле Booking.com с гайдами по скачиванию, счётчиком загрузок и админ-панелью.

## Возможности

- Лендинг с кнопками **Download for Mac** и **Download for Windows**
- Счётчик скачиваний (Mac / Windows / всего)
- Админ-панель для управления ссылками и просмотра статистики
- Три режима работы: Node.js, PHP (хостинг), локальный (без сервера)

## Быстрый старт

### Локально (Node.js)

```bash
npm install
cp data/config.example.json data/config.json   # Windows: copy data\config.example.json data\config.json
npm start
```

- Сайт: http://localhost:3000
- Админка: http://localhost:3000/admin
- Пароль по умолчанию: `admin123`

### Без сервера

Откройте `admin.html` в браузере — работает локальный режим (данные в браузере).

### PHP-хостинг (Beget, Timeweb и др.)

1. Загрузите все файлы на хостинг
2. Скопируйте `data/config.example.json` → `data/config.json`
3. Убедитесь, что папка `data/` доступна для записи PHP
4. Откройте сайт и `/admin`

## Структура проекта

```
├── index.html          # Лендинг
├── admin.html          # Админ-панель
├── api.php             # PHP API (для shared-хостинга)
├── server.js           # Node.js сервер
├── js/api.js           # Общий клиентский API
├── data/
│   ├── config.example.json
│   └── config.json     # Локальный конфиг (не в git)
├── assets/             # SVG-иллюстрации
├── render.yaml         # Деплой на Render.com
└── DEPLOY.md           # Подробная инструкция по деплою
```

## Публикация на GitHub

Проект уже подготовлен: есть `.gitignore`, `render.yaml`, `GITHUB.md`.

```powershell
cd "H:\проекты\booking-style-landing"
.\setup-github.ps1
```

Полная инструкция (Git и загрузка через сайт): **[GITHUB.md](GITHUB.md)**

**Не публикуйте:** `node_modules/`, `data/config.json`, `.env`

## Деплой

### Render.com

1. Создайте репозиторий на GitHub и загрузите проект
2. На [render.com](https://render.com) → New → Web Service → подключите репозиторий
3. Render использует `render.yaml` автоматически
4. Добавьте переменную `SESSION_SECRET`

### GitHub → Render (one-click)

После push в GitHub подключите репозиторий в Render — build и start команды уже настроены в `render.yaml`.

## Безопасность

- Смените пароль админки сразу после первого входа
- Файл `data/config.json` **не попадает в git** (содержит пароль и статистику)
- На продакшене задайте `SESSION_SECRET` в переменных окружения

## API

| Endpoint | Описание |
|----------|----------|
| `GET /api/config` | Публичный конфиг и счётчики |
| `POST /api/download/:platform` | Увеличить счётчик и получить URL |
| `GET /admin` | Админ-панель |

PHP-аналог: `api.php?action=config`, `api.php?action=download` и т.д.

## Лицензия

Private / All rights reserved.
