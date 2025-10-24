# Base de datos (Prisma + PostgreSQL)

Guía para correr migraciones y seeders, tanto en local como en nube.

## **IMPORTANTE: Solución al error de OpenSSL**
Si al ejecutar comandos de Prisma (como `migrate` o `db seed`) ves un error relacionado con `OpenSSL` o `libssl`, la solución casi siempre es la misma:

**Asegúrate de que tu `DATABASE_URL` en el archivo `.env` termine con `&sslmode=require`.**

Las bases de datos en la nube como Supabase, Neon o Render requieren este parámetro para conexiones seguras. Su ausencia es la causa más común de este error.

**Ejemplo de URL correcta:**
`postgresql://postgres:tu-contraseña@db.host.supabase.co:5432/postgres?schema=public&sslmode=require`

---

## Prerrequisitos
- Node y npm instalados.
- Dependencias del proyecto instaladas: `npm i`.
- Variable `DATABASE_URL` definida en `.env`.
- Si tu contraseña tiene caracteres especiales (`@ # ? < >`), usa percent-encoding.

## Migraciones (desarrollo/local)
1) Verificar/editar el esquema en `prisma/schema.prisma`.
2) Generar el cliente (opcional si ya se generó):
   - `npx prisma generate`
3) Aplicar la migración en la base configurada en `.env`:
   - `npx prisma migrate dev --name init`

## Migraciones (producción/nube)
- Para desplegar cambios de schema sin crear nuevas migraciones:
  - `npx prisma migrate deploy`
- Asegúrate de tener `DATABASE_URL` apuntando a la base en la nube y que **incluya `&sslmode=require`**.

## Seeders (carga de datos iniciales)
- Este proyecto define el seed en `prisma/seed.ts`.
- Ejecuta el seed:
  - `npx prisma db seed`
- ¿Qué hace el seed?
  - Carga datos iniciales para `Role`, `User`, `Client`, `Product`, `Order`, `ProductionBatch`, `OrderDetail`, `Claim` desde `src/lib/data.ts`.

## Verificación
- Ejecuta el servidor de desarrollo:
  - `npm run dev` (puerto `9002`)
- Comprueba la salud de la conexión:
  - `http://localhost:9002/api/db` → debería responder `{ ok: true, now: ... }`.
- Inspecciona los datos con Prisma Studio:
  - `npx prisma studio`

## Problemas comunes
- **Error de OpenSSL/SSL**: ¡Revisa que `&sslmode=require` esté al final de tu `DATABASE_URL`!
- `P2003 Foreign key constraint violated`: faltan registros padre. Revisa el orden de inserción en el seed.
- Contraseña con caracteres especiales: debe estar codificada (percent-encoding) en la `DATABASE_URL`.

## Comandos rápidos
- `npx prisma generate`
- `npx prisma migrate dev --name init`
- `npx prisma migrate deploy`
- `npx prisma db seed`
- `npx prisma studio`
