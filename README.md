# ECHO 4.0

Готовый каркас под финальное ТЗ. Светлая тема, русский интерфейс, десктоп — основной, мобильная — вторичная, но полная. Навигация с нижним таб‑баром, хиро по ТЗ, кастомные 404/500, заготовки API.

## Быстрый старт
```bash
npm i
npm run dev
```
### Переменные окружения
Создайте `.env.local`:
```
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```
### Supabase
- Импортируйте SQL из `supabase/schema.sql` и `supabase/policies.sql` (RLS).
- Создайте приватный бакет `attachments`.

## Что включено
- Страницы и API по структуре ТЗ (заглушки для безопасного деплоя).
- Строгий TypeScript, ESLint, CI (типы, линт, сборка).
- Генерация CSS-переменных из `tokens.json` → `styles/styles.css`.

Дальше реализуем: OTP, CRUD, загрузку в приватный бакет, публичные ссылки с TTL/паролем, журнал, таймлайн, письма.
