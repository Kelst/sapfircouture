# Деплой Sapfir Couture


## Вимоги

- Сервер з Docker та Docker Compose
- Домен, направлений на IP сервера (A-запис)
- Відкриті порти: 80, 443

## Швидкий старт

```bash
# 1. Клонувати репозиторій
git clone <your-repo-url>
cd sapfircouture

# 2. Створити конфіг
cp .env.example .env

# 3. Відредагувати .env (обов'язково!)
nano .env

# 4. Запустити
make prod

# 5. Створити адміна та заповнити контент (РЕКОМЕНДОВАНО)
make seed-all
```

## Налаштування .env

**Обов'язкові змінні:**

```env
# Ваш домен (без https://)
DOMAIN=sapfircouture.com

# URL додатку
NEXT_PUBLIC_APP_URL=https://sapfircouture.com

# Пароль БД (згенеруйте надійний!)
DB_PASSWORD=MySecurePassword123!

# Секрет автентифікації (згенеруйте: openssl rand -base64 32)
BETTER_AUTH_SECRET=ваш-секретний-ключ-32-символи

# MinIO credentials
MINIO_USER=minioadmin
MINIO_PASSWORD=MySecureMinioPassword123!

# URL для зображень (через CDN субдомен)
S3_PUBLIC_URL=https://cdn.sapfircouture.com/wedding-uploads
```

**Опційні:**

```env
# Telegram сповіщення
TELEGRAM_BOT_TOKEN=123456:ABC-xxx
TELEGRAM_CHAT_ID=-100123456789

# Секрет для cron
CRON_SECRET=my-cron-secret
```

## DNS налаштування

Додайте A-записи для вашого домену:

| Тип | Ім'я | Значення |
|-----|------|----------|
| A | @ | IP_СЕРВЕРА |
| A | cdn | IP_СЕРВЕРА |
| A | www | IP_СЕРВЕРА |

## Команди

```bash
make prod         # Запустити production
make stop         # Зупинити всі контейнери
make restart      # Перезапустити
make logs         # Переглянути логи
make logs-app     # Логи тільки Next.js
make seed         # Створити адмін користувача
make seed-content # Заповнити контент (замовлення, доставка, оплата, About)
make seed-all     # Створити адміна + заповнити весь контент
make backup       # Бекап бази даних
make db-shell     # Підключитись до БД
make clean        # Видалити все (включаючи дані!)
```

## Створення адміністратора

Після першого запуску створіть адміна:

```bash
make seed
```

## Заповнення контенту

Автоматично заповнити весь контент сайту:

```bash
make seed-content
```

Це додасть:
- **6 кроків замовлення** (EN/UK) — "Як замовити"
- **6 пунктів доставки** (EN/UK) — умови доставки
- **5 методів оплати** (EN/UK) — способи оплати
- **Текст сторінки About** (EN/UK)
- **Brand Statement** (EN/UK) — текст на головній
- **CTA Banner** (EN/UK) — заклик до дії

Або зробіть все одразу (адмін + контент):

```bash
make seed-all
```

## Структура сервісів

```
┌─────────────────────────────────────────────────┐
│                    INTERNET                      │
└─────────────────────┬───────────────────────────┘
                      │ :80, :443
┌─────────────────────▼───────────────────────────┐
│                    Caddy                         │
│            (SSL + Reverse Proxy)                 │
│  sapfircouture.com → app:3000                   │
│  cdn.sapfircouture.com → minio:9000             │
└──────────┬─────────────────────┬────────────────┘
           │                     │
┌──────────▼──────────┐ ┌───────▼────────┐
│      Next.js        │ │     MinIO      │
│      (app)          │ │   (storage)    │
│     :3000           │ │    :9000       │
└──────────┬──────────┘ └────────────────┘
           │
┌──────────▼──────────┐
│    PostgreSQL       │
│      (db)           │
│     :5432           │
└─────────────────────┘

+ Cron (cleanup) - працює у фоні
```

## SSL сертифікати

Caddy автоматично:
1. Отримує SSL сертифікат від Let's Encrypt
2. Оновлює його перед закінченням
3. Редиректить HTTP → HTTPS

**Важливо:** Домен повинен бути направлений на сервер ДО запуску!

## Бекапи

### Автоматичний бекап БД:

```bash
make backup
# Створить файл: backups/backup_20241216_143022.sql
```

### Відновлення:

```bash
make restore FILE=backups/backup_20241216_143022.sql
```

### Бекап зображень (MinIO):

```bash
# Копіювати volume
docker run --rm -v sapfircouture_minio_data:/data -v $(pwd)/backups:/backup \
  alpine tar czf /backup/minio_backup.tar.gz /data
```

## Оновлення

```bash
# Отримати нову версію
git pull

# Перебудувати та перезапустити
make build
make restart
```

## Troubleshooting

### Caddy не отримує сертифікат

1. Перевірте DNS: `nslookup yourdomain.com`
2. Перевірте порти: `sudo netstat -tlnp | grep -E '80|443'`
3. Логи Caddy: `make logs-caddy`

### Додаток не стартує

```bash
# Перевірити логи
make logs-app

# Перевірити міграції
docker logs wedding-migrate
```

### БД не підключається

```bash
# Перевірити статус
docker ps

# Перевірити логи
docker logs wedding-db
```

## Моніторинг

### Health check:

```bash
curl https://yourdomain.com/api/health
```

### Статус контейнерів:

```bash
docker ps
```

## Безпека

- ✅ SSL/TLS через Caddy (автоматично)
- ✅ Security headers (X-Frame-Options, etc.)
- ✅ Паролі в .env (не в git)
- ✅ Non-root user в Docker
- ✅ Rate limiting на контактній формі

**Рекомендації:**
- Використовуйте сильні паролі (16+ символів)
- Регулярно оновлюйте Docker образи
- Налаштуйте firewall (ufw)
- Робіть регулярні бекапи
