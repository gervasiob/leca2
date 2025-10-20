# Base de datos (Supabase + PostgreSQL)

Guía para trabajar con tu base de datos de Supabase.

## Conexión

La conexión a Supabase se configura en `src/lib/supabase.ts`, utilizando las variables de entorno `SUPABASE_URL` y `SUPABASE_KEY` definidas en tu archivo `.env`.

El cliente de Supabase está disponible para ser importado en toda la aplicación desde `@/lib/supabase`.

## Estructura de la Base de Datos

Puedes gestionar el esquema de tu base de datos, las tablas y los datos directamente desde el [Dashboard de Supabase](https://app.supabase.com).

1.  **Ve a tu proyecto** en Supabase.
2.  Usa el **Editor de Tablas** (`Table Editor`) para crear y modificar tablas.
3.  Usa el **Editor de SQL** (`SQL Editor`) para ejecutar migraciones o scripts de `seed`.

## Migraciones y Seeds

A diferencia de Prisma, Supabase no tiene un sistema de migraciones basado en archivos por defecto en el lado del cliente. Las migraciones se gestionan principalmente a través de su Dashboard o usando la [Supabase CLI](https://supabase.com/docs/guides/cli).

### Para cargar datos iniciales (seed):

1.  Navega al **SQL Editor** en tu proyecto de Supabase.
2.  Pega y ejecuta tus sentencias `INSERT` para poblar las tablas.

Puedes adaptar los datos que se encontraban en `src/lib/data.ts` para crear tus scripts de `seed`.

## Verificación

- Ejecuta el servidor de desarrollo:
  - `npm run dev` (puerto `9002`)
- Comprueba la salud de la aplicación. Las páginas que usan datos ahora deberían obtenerlos de Supabase.
