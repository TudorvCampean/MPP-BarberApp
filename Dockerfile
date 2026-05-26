# Imaginea de bază oficială de PHP
FROM php:8.2-cli

# Instalăm dependențele necesare pentru Laravel și PostgreSQL
RUN apt-get update -y && apt-get install -y \
    libpq-dev \
    unzip \
    && docker-php-ext-install pdo pdo_pgsql

# Copiem fișierele proiectului
COPY . /var/www
WORKDIR /var/www

# Instalăm Composer direct în container
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
RUN composer install --no-dev --optimize-autoloader

# Expunem portul dorit (Render injectează automat variabila $PORT)
ENV PORT=8000
EXPOSE 8000

# Comanda de start
CMD php artisan serve --host=0.0.0.0 --port=$PORT
