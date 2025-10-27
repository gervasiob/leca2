# Gestor de Fábrica - Next.js y Prisma

Aplicación de gestión integral para una fábrica, construida con Next.js, Tailwind CSS, ShadCN UI y Prisma con una base de datos PostgreSQL.

## Stack Tecnológico

- **Framework:** Next.js (App Router)
- **Lenguaje:** TypeScript
- **ORM:** Prisma
- **Base de Datos:** PostgreSQL
- **Estilos:** Tailwind CSS
- **Componentes UI:** ShadCN UI
- **IA Generativa:** Google AI a través de Genkit
- **Autenticación:** Basada en credenciales y JWT

## Configuración del Proyecto

1.  **Instalar dependencias:**
    ```bash
    npm install
    ```

2.  **Configurar variables de entorno:**
    -   Crea un archivo `.env` en la raíz del proyecto.
    -   Añade la cadena de conexión de tu base de datos PostgreSQL y la clave de Google AI.

    ```env
    # PostgreSQL (puedes obtenerla de tu proveedor de BBDD, ej: AWS RDS, Supabase, etc.)
    DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public&sslaccept=accept_invalid_certs"

    # Google AI (Genkit)
    GEMINI_API_KEY="..."

    # Habilitar/Deshabilitar Middleware
    MIDDLEWARE_ENABLED=true
    ```
    
    **Nota sobre `sslaccept=accept_invalid_certs`**: Este parámetro se ha añadido para solucionar problemas de conexión en entornos de desarrollo que pueden no tener las librerías OpenSSL correctas. **No uses este parámetro en producción.**

3.  **Ejecutar las migraciones de la base de datos:**
    Este comando creará las tablas en tu base de datos según el esquema de Prisma.
    ```bash
    npx prisma migrate dev
    ```

4.  **Poblar la base de datos con datos de prueba (opcional):**
    ```bash
    npx prisma db seed
    ```

5.  **Ejecutar el servidor de desarrollo:**
    ```bash
    npm run dev
    ```
    La aplicación estará disponible en `http://localhost:9002`.

## Estructura del Proyecto

-   `src/app`: Contiene las rutas y páginas de la aplicación (App Router).
-   `src/components`: Componentes de React reutilizables.
-   `src/lib`: Utilidades, cliente de Prisma y tipos.
-   `src/ai`: Flujos y configuración de Genkit para funcionalidades de IA.
-   `prisma`: Esquema de la base de datos, migraciones y script de seeder.

## Funcionalidades Principales

-   **Tablero de Control:** Resumen visual de métricas clave.
-   **Gestión de Ventas:** Creación y seguimiento de pedidos y clientes.
-   **Planificación de Producción:** Organización de la producción en lotes.
-   **Gestión de Despachos:** Generación de remitos.
-   **Roles y Permisos:** Control de acceso granular para diferentes tipos de usuario.
