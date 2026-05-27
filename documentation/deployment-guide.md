# Deployment Guide

## Production Deployment

### Prerequisites
- Linux server (Ubuntu 22.04+ recommended)
- PHP 8.2+ with extensions: curl, fileinfo, mbstring, openssl, pdo_mysql, zip
- Composer 2.x
- MySQL 8.0+
- Node.js 18+
- Nginx or Apache
- Supervisor (for queue worker)

---

## Backend Deployment

### 1. Clone and Install

```bash
cd /var/www
git clone <repository-url> task-management
cd task-management/backend
composer install --optimize-autoloader --no-dev
```

### 2. Environment Configuration

```bash
cp .env.example .env
php artisan key:generate
```

Edit `.env` for production:
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.yourdomain.com

DB_HOST=127.0.0.1
DB_DATABASE=task_management
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password

QUEUE_CONNECTION=database
FRONTEND_URL=https://yourdomain.com
```

### 3. Database Setup

```bash
mysql -u root -p -e "CREATE DATABASE task_management"
php artisan migrate --seed
```

### 4. File Permissions

```bash
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache
```

### 5. Nginx Configuration

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    root /var/www/task-management/backend/public;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location /api/events {
        proxy_buffering off;
        proxy_cache off;
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root/index.php;
        include fastcgi_params;
    }
}
```

### 6. Queue Worker (Supervisor)

Create `/etc/supervisor/conf.d/task-queue.conf`:
```ini
[program:task-queue]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/task-management/backend/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/log/task-queue.log
```

```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start task-queue:*
```

---

## Frontend Deployment

### 1. Build

```bash
cd /var/www/task-management/frontend
npm ci
```

Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

```bash
npm run build
```

### 2. Run with PM2

```bash
npm install -g pm2
pm2 start npm --name "task-frontend" -- start
pm2 save
pm2 startup
```

### 3. Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## SSL (HTTPS)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
```

---

## Docker Alternative

### docker-compose.yml

```yaml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: secret
      MYSQL_DATABASE: task_management
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    depends_on:
      - mysql
    environment:
      DB_HOST: mysql
      DB_PASSWORD: secret

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8000/api

volumes:
  mysql_data:
```

---

## Post-Deployment Checklist

- [ ] `APP_DEBUG=false` in production
- [ ] HTTPS enabled
- [ ] CORS configured for production domain
- [ ] Queue worker running via Supervisor
- [ ] File upload directory writable
- [ ] Database backups configured
- [ ] Log rotation configured
