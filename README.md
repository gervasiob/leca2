# Base de datos (Prisma + PostgreSQL)

Guía para correr migraciones y seeders, tanto en local como en nube.

## Prerrequisitos
- Node y npm instalados.
- Dependencias del proyecto instaladas: `npm i`.
- Variable `DATABASE_URL` definida en `.env` (ejemplo):
  - `postgresql://postgres:<PASSWORD>@<HOST>:5432/<DB>?schema=public`
- Si tu contraseña tiene caracteres especiales (`@ # ? < >`), usa percent-encoding. Ejemplo ya aplicado:
  - `postgresql://postgres:mJ6Bj%3FVv%23%3CUH%297M%40@34.29.26.213:5432/lecatexdb?schema=public`
- **IMPORTANTE:** En bases remotas administradas (Neon/Render/Cloud SQL/Supabase), agrega `&sslmode=require` al final de la URL. Supabase lo requiere obligatoriamente para conexiones externas.

## Migraciones (desarrollo/local)
1) Verificar/editar el esquema en `prisma/schema.prisma`.
2) Generar el cliente (opcional si ya se generó):
   - `npx prisma generate`
3) Aplicar la migración en la base configurada en `.env`:
   - `npx prisma migrate dev --name init`

## Migraciones (producción/nube)
- Para desplegar cambios de schema sin crear nuevas migraciones:
  - `npx prisma migrate deploy`
- Asegúrate de tener `DATABASE_URL` apuntando a la base en la nube y que incluya `&sslmode=require`.

## Seeders (carga de datos iniciales)
- Este proyecto define el seed en `prisma/seed.ts`.
- Ejecuta el seed:
  - `npx prisma db seed`
- ¿Qué hace el seed?
  - Carga `Role`, `User`, `Client`, `Product`, `Order`, `ProductionBatch`, `OrderDetail`, `Claim` desde `src/lib/data.ts`.
  - Si existen `OrderDetail` con `orderId` sin orden padre, crea órdenes faltantes automáticamente.
  - Usa `Decimal(10,2)` para importes (evita problemas de redondeo).

## Verificación
- Ejecuta el servidor de desarrollo:
  - `npm run dev` (puerto `9002`)
- Comprueba la salud de la conexión:
  - `http://localhost:9002/api/db` → debería responder `{ ok: true, now: ... }`.
- Inspecciona los datos con Prisma Studio:
  - `npx prisma studio`

## Cuando lo tengas en la nube
- Asegura accesibilidad: IP pública habilitada o usa un proxy/connector (Cloud SQL Proxy, etc.).
- Actualiza `DATABASE_URL` con host, base y credenciales reales, y **añade `&sslmode=require`**.
- Aplica migraciones en el entorno remoto:
  - `npx prisma migrate deploy`
- Ejecuta el seed (si querés datos iniciales en producción):
  - `npx prisma db seed` (idealmente como job/tarea única post-deploy).

## Problemas comunes
- **Error de OpenSSL/SSL**: Asegúrate de que `&sslmode=require` esté al final de tu `DATABASE_URL` en `.env`.
- `P2003 Foreign key constraint violated`: faltan registros padre (el seed ya crea órdenes faltantes; si ocurre en otra tabla, revisa el orden de inserción).
- Contraseña con caracteres especiales: percent-encode en la `DATABASE_URL`.

## Comandos rápidos
- `npx prisma generate`
- `npx prisma migrate dev --name init`
- `npx prisma migrate deploy`
- `npx prisma db seed`
- `npx prisma studio`
