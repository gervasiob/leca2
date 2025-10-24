# Gestor de Fábrica - Next.js y Firebase

Aplicación de gestión integral para una fábrica, construida con Next.js, Tailwind CSS, ShadCN UI y Firebase.

## Stack Tecnológico

- **Framework:** Next.js (App Router)
- **Lenguaje:** TypeScript
- **Base de Datos:** Firebase Firestore
- **Estilos:** Tailwind CSS
- **Componentes UI:** ShadCN UI
- **IA Generativa:** Google AI a través de Genkit
- **Autenticación:** Firebase Authentication

## Configuración del Proyecto

1.  **Instalar dependencias:**
    ```bash
    npm install
    ```

2.  **Configurar variables de entorno:**
    -   Crea un archivo `.env` en la raíz del proyecto si no existe.
    -   Añade las credenciales de tu proyecto de Firebase y de Google AI.

    ```env
    # Firebase
    NEXT_PUBLIC_FIREBASE_API_KEY="AIza..."
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="tu-proyecto.firebaseapp.com"
    NEXT_PUBLIC_FIREBASE_PROJECT_ID="tu-proyecto"
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="tu-proyecto.appspot.com"
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="..."
    NEXT_PUBLIC_FIREBASE_APP_ID="1:..."

    # Google AI (Genkit)
    GEMINI_API_KEY="..."
    ```

3.  **¿Cómo obtener las credenciales de Firebase?**
    1.  Abre la [Consola de Firebase](https://console.firebase.google.com/) y selecciona tu proyecto.
    2.  Haz clic en el ícono de engranaje (⚙️) junto a "Project Overview" y ve a **"Project settings"**.
    3.  En la pestaña "General", ve a la sección "Your apps".
    4.  Si no tienes una app web, créala haciendo clic en el ícono `</>`.
    5.  En la configuración de tu app web, busca la sección "Firebase SDK snippet" y selecciona la opción **"Config"**.
    6.  Copia los valores que aparecen y pégalos en tu archivo `.env`.

4.  **Ejecutar el servidor de desarrollo:**
    ```bash
    npm run dev
    ```
    La aplicación estará disponible en `http://localhost:9002`.

## Estructura del Proyecto

-   `src/app`: Contiene las rutas y páginas de la aplicación (App Router).
-   `src/components`: Componentes de React reutilizables.
-   `src/lib`: Utilidades, configuración de clientes (Firebase) y tipos.
-   `src/ai`: Flujos y configuración de Genkit para funcionalidades de IA.
-   `src/styles`: Archivos de estilos globales.

## Funcionalidades Principales

-   **Tablero de Control:** Resumen visual de métricas clave.
-   **Gestión de Ventas:** Creación y seguimiento de pedidos y clientes.
-   **Planificación de Producción:** Organización de la producción en lotes.
-   **Gestión de Despachos:** Generación de remitos.
-   **Roles y Permisos:** Control de acceso granular para diferentes tipos de usuario.
