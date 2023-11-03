# Setup a PostgreSQL container

## CLI

1. Define the image to use

```Dockerfile
FROM image:to-use
```

2. Levantar el contenedor

```bash
# -e => setea una variable de entorno
docker run -e POSTGRES_PASSWORD=some-password postgres

# le pasamos el usuario, la contraseña y el nombre de la base de datos que queremos crear
docker run -e POSTGRES_USER=leninner -e POSTGRES_PASSWORD=leninner -e POSTGRES_DB=myleninnerdb -d postgres -p 5432:5432 --name postgres-local
# -d => corre el contenedor en modo detached, es decir, en segundo plano
```

3. Conectarse al contenedor

```bash
# exec -it => ejecuta el contenedor en modo interactivo
docker exec -it <container_id | container_name> bash

# bash => indica que vamos a entrar al contenedor con el bash del contenedor
```

4. Conectarse a la base de datos

```bash
psql -U postgres
```

5. Crear una base de datos

```bash
CREATE DATABASE <database_name>;
```
