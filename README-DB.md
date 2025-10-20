# Base de datos (Prisma + Supabase/PostgreSQL)

Guía para conectar Prisma a tu base de datos PostgreSQL alojada en Supabase.

## Conexión

1.  **Obtén la cadena de conexión de Supabase:**
    *   Ve a tu proyecto en [Supabase](https://app.supabase.com).
    *   Navega a `Project Settings` (el ícono de engranaje) > `Database`.
    *   En la sección `Connection string`, copia la URL que corresponde al modo `Transaction` (puerto `5432`).

2.  **Configura la variable de entorno:**
    *   Abre el archivo `.env` en la raíz de tu proyecto.
    *   Pega la cadena de conexión como el valor de `DATABASE_URL`.
    *   Reemplaza `[YOUR-PASSWORD]` con la contraseña de tu base de datos de Supabase.
    *   **MUY IMPORTANTE:** Asegúrate de que la URL incluya `&sslmode=require` al final. Supabase lo necesita para todas las conexiones externas y su ausencia causa errores de OpenSSL con Prisma.

    **Ejemplo en `.env`:**
    ```
    DATABASE_URL="postgresql://postgres:tu-contraseña-aqui@db.xxxxxxxx.supabase.co:5432/postgres?schema=public&sslmode=require"
    ```

## Migraciones con Prisma

Una vez que tu `DATABASE_URL` está configurada correctamente (incluyendo `sslmode=require`), puedes usar los comandos de Prisma para gestionar el esquema de tu base de datos en Supabase.

1.  **Modifica tu esquema:** Edita el archivo `prisma/schema.prisma` para definir tus modelos de datos.

2.  **Genera el cliente de Prisma:**
    ```bash
    npx prisma generate
    ```

3.  **Aplica las migraciones:** Para crear o actualizar las tablas en tu base de datos de Supabase, ejecuta:
    ```bash
    npx prisma migrate dev --name "nombre-descriptivo-de-la-migracion"
    ```

    Si estás desplegando en un entorno de producción, usa:
    ```bash
    npx prisma migrate deploy
    ```

## Carga de datos iniciales (Seeding)

Puedes usar el seeder de Prisma para poblar tu base de datos en Supabase.

1.  **Define tus datos:** Edita el archivo `prisma/seed.ts`.
2.  **Ejecuta el seeder:**
    ```bash
    npx prisma db seed
    ```

## Verificación

- **Prisma Studio:** Para inspeccionar tu base de datos de Supabase a través de una interfaz gráfica, usa:
  ```bash
  npx prisma studio
  ```
- **Servidor de desarrollo:** Inicia la aplicación y comprueba que las páginas que obtienen datos funcionan correctamente.
  ```bash
  npm run dev
  ```
