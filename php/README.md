# PHP and Docker

To start using **php** we just need the following steps to have php in a docker container.

## Build the image

```bash
docker build -t hello-php:1.0 .
```

## Run the container

- With volume

```bash
docker run -p 3000:80 -d -v $(pwd)/src:/var/www/html/ hello-php
```