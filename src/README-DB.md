# Base de Datos (Prisma con PostgreSQL)

Este proyecto utiliza **Prisma** como ORM (Object-Relational Mapping) para interactuar con una base de datos **PostgreSQL**. Prisma facilita la gestión, consulta y migración de la base de datos de una manera segura y tipada.

## Configuración

La configuración de la base de datos se encuentra en el archivo `prisma/schema.prisma`, y la cadena de conexión se gestiona a través de la variable de entorno `DATABASE_URL` en el archivo `.env`.

Asegúrate de que tu archivo `.env` contenga la cadena de conexión a tu base de datos PostgreSQL:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

## Estructura de Datos

La estructura de las tablas, sus campos y las relaciones entre ellas están definidas en `prisma/schema.prisma`. Las principales entidades (modelos) de la aplicación son:

- `User`
- `Role`
- `Client`
- `Product`
- `Order`
- `OrderDetail`
- `ProductionBatch`
- `Claim`

## Interactuando con la Base de Datos

Para interactuar con la base de datos, puedes importar el cliente de Prisma desde `src/lib/prisma.ts` y usar sus métodos para realizar operaciones CRUD (Crear, Leer, Actualizar, Eliminar).

**Ejemplo de lectura de documentos:**
```typescript
import { prisma } from '@/lib/prisma';

async function getClients() {
  const clients = await prisma.client.findMany();
  return clients;
}
```

## Rutas de Utilidad (Solo Desarrollo)

Para facilitar el desarrollo, se han creado algunas rutas de API que no están protegidas por el middleware. **No deben ser usadas o expuestas en producción.**

- **`POST /api/dev/db-viewer`**:
  Esta ruta es utilizada por la página `/dev/db-viewer` para obtener y mostrar el contenido de cualquier tabla de la base de datos.

- **`GET /api/db`**:
  Una ruta simple para verificar si la conexión con la base de datos a través de Prisma es exitosa.
