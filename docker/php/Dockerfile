FROM php:8.3-fpm-alpine

# Install system dependencies
RUN apk add --no-cache \
    bash \
    curl \
    freetype-dev \
    libjpeg-turbo-dev \
    libpng-dev \
    libzip-dev \
    oniguruma-dev \
    postgresql-dev \
    zip \
    unzip \
    git \
    mysql-client

# Install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install \
    bcmath \
    exif \
    gd \
    mbstring \
    mysqli \
    pdo \
    pdo_mysql \
    pdo_pgsql \
    zip \
    opcache

# Install Redis extension
RUN apk add --no-cache pcre-dev $PHPIZE_DEPS \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del pcre-dev $PHPIZE_DEPS

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/backend

# Note: Files will be mounted as volumes in docker-compose
# We just set up the environment here

# Create required directories
RUN mkdir -p /var/www/backend/storage/framework/{sessions,views,cache} \
    && mkdir -p /var/www/backend/storage/logs \
    && mkdir -p /var/www/backend/bootstrap/cache

# Set permissions for web server
RUN chown -R www-data:www-data /var/www/backend

# Expose port 9000 for PHP-FPM
EXPOSE 9000

CMD ["php-fpm"]
