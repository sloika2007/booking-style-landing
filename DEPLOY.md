# Booking Style Landing — инструкция по деплою

## Быстрый старт (локально)

```bash
npm install
npm start
```

- Сайт: http://localhost:3000
- Админ-панель: http://localhost:3000/admin
- Пароль по умолчанию: `admin123`

## Что делает админ-панель

1. **Ссылки** — укажите URL для кнопок «Download for Mac» и «Download for Windows»
2. **Счётчик** — каждое нажатие на кнопку увеличивает счётчик (Mac / Windows / Всего)
3. **Пароль** — смените пароль после первого входа

---

## Варианты хостинга

### Вариант 1: Render.com (рекомендуется, бесплатный тариф)

1. Зарегистрируйтесь на https://render.com
2. New → Web Service → подключите GitHub или загрузите проект
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Добавьте переменную окружения:
   - `SESSION_SECRET` = случайная строка (например, 32 символа)
6. После деплоя сайт будет доступен по адресу вида `https://ваш-проект.onrender.com`

### Вариант 2: Railway.app

1. https://railway.app → New Project → Deploy from folder
2. Railway автоматически определит Node.js
3. Добавьте `SESSION_SECRET` в Variables
4. Получите URL вида `https://ваш-проект.up.railway.app`

### Вариант 3: VPS (Timeweb, Beget, DigitalOcean)

```bash
# На сервере с Node.js 18+
git clone <ваш-репозиторий>
cd booking-style-landing
npm install
SESSION_SECRET=ваш-секрет PORT=3000 npm start
```

Для постоянной работы используйте PM2:

```bash
npm install -g pm2
SESSION_SECRET=ваш-секрет pm2 start server.js --name booking-landing
pm2 save
pm2 startup
```

Настройте Nginx как reverse proxy на порт 3000 и подключите SSL (Let's Encrypt).

---

## Выбор и покупка домена

### Рекомендуемые домены для этого сайта

| Домен | Примерная цена | Комментарий |
|-------|----------------|-------------|
| `accessibility-housing-guide.com` | ~$12/год | Прямо отражает тему |
| `accessible-stays-guide.com` | ~$12/год | Короткий, понятный |
| `housing-access-guide.com` | ~$12/год | Альтернатива |
| `booking-partner-guide.com` | ~$15/год | Если нужен акцент на партнёров |

> **Важно:** Не используйте домены с «booking.com» в названии — это может нарушать торговые марки Booking Holdings.

### Где купить домен

| Регистратор | Цена .com | Плюсы |
|-------------|-----------|-------|
| **Namecheap** (namecheap.com) | ~$10–13/год | Дешёвый, бесплатный WHOIS privacy |
| **Cloudflare Registrar** (cloudflare.com) | ~$10/год | По себестоимости, без наценки |
| **Porkbun** (porkbun.com) | ~$9–11/год | Низкие цены |
| **Reg.ru** (reg.ru) | ~800–1200 ₽/год | Для .ru/.рф, русская поддержка |

### Как подключить домен к хостингу

**Render:**
1. Settings → Custom Domains → Add
2. В DNS регистратора добавьте CNAME: `www` → `ваш-проект.onrender.com`
3. Для корня (@) — A-запись по инструкции Render

**Cloudflare (если домен там):**
1. DNS → CNAME `www` → ваш хостинг
2. Включите Proxy (оранжевое облако) для SSL

---

## Безопасность после деплоя

1. Смените пароль админки: `/admin` → «Новый пароль»
2. Установите `SESSION_SECRET` в переменных окружения
3. Не публикуйте `data/config.json` с паролем в открытый репозиторий

---

## Структура проекта

```
booking-style-landing/
├── index.html      — лендинг
├── admin.html      — админ-панель
├── server.js       — сервер + API
├── data/config.json — ссылки, счётчики, пароль
├── assets/         — изображения
└── package.json
```
