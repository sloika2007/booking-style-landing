# Загрузка на GitHub

Проект готов к публикации. **Не загружайте** `node_modules/`, `data/config.json` и файл `.env`.

## Что попадёт в репозиторий

| Файл / папка | В git |
|--------------|-------|
| `index.html`, `admin.html`, `server.js`, `api.php` | ✅ |
| `js/`, `assets/` | ✅ |
| `data/config.example.json`, `data/.gitkeep`, `data/.htaccess` | ✅ |
| `package.json`, `package-lock.json` | ✅ |
| `README.md`, `DEPLOY.md`, `render.yaml` | ✅ |
| `node_modules/` | ❌ |
| `data/config.json` (пароль, ссылки, счётчики) | ❌ |
| `.env` | ❌ |

---

## Способ 1: через Git (рекомендуется)

### 1. Установите Git

https://git-scm.com/download/win

Перезапустите терминал после установки.

### 2. Запустите скрипт

```powershell
cd "H:\проекты\booking-style-landing"
.\setup-github.ps1
```

Скрипт создаст `data/config.json` (если нет), проиндексирует файлы и подскажет следующие шаги.

### 3. Создайте репозиторий на GitHub

1. https://github.com/new
2. Имя, например: `booking-style-landing`
3. **Private** или Public — на ваш выбор
4. **Не** добавляйте README, .gitignore и license (они уже в проекте)
5. Create repository

### 4. Первый push

```powershell
cd "H:\проекты\booking-style-landing"

git commit -m "Initial commit: booking style landing"
git remote add origin https://github.com/ВАШ_ЛОГИН/booking-style-landing.git
git branch -M main
git push -u origin main
```

При запросе логина используйте **Personal Access Token** (Settings → Developer settings → Tokens), не пароль от аккаунта.

---

## Способ 2: загрузка через сайт (без Git)

1. https://github.com/new → создайте пустой репозиторий
2. **Add file → Upload files**
3. Перетащите **все файлы и папки**, кроме:
   - `node_modules`
   - `data/config.json`
   - `.env`
4. Commit changes

---

## После загрузки

### Локальный запуск у того, кто клонировал репозиторий

```bash
git clone https://github.com/ВАШ_ЛОГИН/booking-style-landing.git
cd booking-style-landing
npm install
cp data/config.example.json data/config.json   # Windows: copy ...
npm start
```

### Деплой на Render

1. Render.com → New → Web Service
2. Connect GitHub → выберите репозиторий
3. Render подхватит `render.yaml`
4. После деплоя смените пароль в `/admin`

Подробнее: [DEPLOY.md](DEPLOY.md)

---

## Безопасность

- В репозитории только `config.example.json` с демо-паролем `admin123`
- Реальный `data/config.json` остаётся только на сервере / у вас локально
- На продакшене задайте `SESSION_SECRET` (см. `.env.example`)
