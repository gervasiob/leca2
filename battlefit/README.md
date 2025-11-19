# BattleFit

BattleFit es una aplicación móvil que fusiona el fitness con un juego de rol (RPG). Los usuarios convierten su actividad física del mundo real en experiencia y mejoras para su avatar en el juego, compitiendo con amigos y completando desafíos.

## 🚀 Cómo Empezar

1.  **Clonar el repositorio:**
    ```bash
    git clone <URL_DEL_REPOSITORIO>
    cd battlefit
    ```

2.  **Instalar dependencias de Flutter:**
    ```bash
    flutter pub get
    ```

3.  **Configurar Supabase:**
    *   Crea un proyecto en [Supabase](https://supabase.com/).
    *   Ve a la sección `SQL Editor` y ejecuta el script completo de `supabase_schema.sql` que se encuentra en la raíz de este proyecto.
    *   Obtén tu URL y tu `anon key` desde la sección `API` en la configuración de tu proyecto de Supabase.
    *   Reemplaza los valores de marcador de posición en `lib/main.dart` con tus credenciales reales:

    ```dart
    await Supabase.initialize(
      url: 'TU_SUPABASE_URL',
      anonKey: 'TU_SUPABASE_ANON_KEY',
    );
    ```

4.  **Ejecutar la aplicación:**
    ```bash
    flutter run
    ```

## 📐 Arquitectura

El proyecto sigue los principios de **Arquitectura Limpia** para asegurar que el código sea desacoplado, escalable y fácil de mantener. La estructura se divide principalmente en tres capas:

-   **Presentation:** Contiene la UI (widgets, pantallas) y la lógica de presentación (Providers de Riverpod). Es la capa más externa y se encarga de mostrar los datos al usuario y capturar sus interacciones.
-   **Domain:** Es el núcleo de la aplicación. Contiene la lógica de negocio pura (entidades, casos de uso, servicios como el `RPGEngine`) y no depende de ninguna otra capa.
-   **Data:** Se encarga de la obtención y persistencia de los datos. Contiene las implementaciones de los repositorios, las fuentes de datos (locales o remotas como Supabase) y los modelos de datos.

## 📁 Estructura de Módulos

La aplicación está organizada en módulos por funcionalidad, ubicados en `lib/src/features/`. Cada módulo sigue la estructura de Arquitectura Limpia internamente.

-   `auth`: Autenticación (login, registro, social).
-   `onboarding`: Flujo de bienvenida para nuevos usuarios.
-   `health_sync`: Sincronización con Google Fit / Apple Health.
-   `rpg_engine`: Lógica del juego (EXP, niveles, atributos).
-   `challenges`: Gestión de misiones y recompensas.
-   `ranking`: Tablas de clasificación.
-   `profile`: Perfil de usuario y estadísticas.
-   `store`: Tienda de elementos cosméticos.
-   `core`: Componentes compartidos (tema, router, widgets).

## 🧭 Navegación (Rutas)

La navegación se gestiona con el paquete `go_router`. Las rutas principales están definidas en `lib/src/core/config/router/app_router.dart`.

-   `/splash`: Pantalla de carga inicial.
-   `/login`: Inicio de sesión.
-   `/register`: Registro de nuevos usuarios.
-   `/home`: Pantalla principal con navegación por pestañas (Actividad, Misiones, Perfil, Tienda).

## 🗄️ Modelos de Datos

Los modelos de datos se dividen en:

-   **Entidades (Domain):** Representaciones puras de los objetos de negocio (ej. `PlayerStats`).
-   **Modelos (Data):** Representaciones de los datos tal como provienen de la fuente (ej. un modelo para una tabla de Supabase).

Las tablas principales en Supabase son:
-   `users_profile`
-   `daily_activity`
-   `challenges`
-   `user_challenges`
-   `ranking`

## 🔄 Flujo de Datos

El flujo de datos sigue un patrón unidireccional para mayor claridad y predictibilidad, gestionado por **Riverpod**.

1.  **UI (Widget):** Un widget solicita datos o dispara una acción a través de un `Provider`.
2.  **Provider (Presentation):** El `Provider` invoca un caso de uso (usecase) del dominio.
3.  **Usecase (Domain):** El caso de uso contiene la lógica de negocio y utiliza un `Repository` para acceder a los datos.
4.  **Repository (Domain/Data):** El `Repository` es una interfaz en el dominio, implementada en la capa de datos. Su implementación decide si obtener los datos de una fuente remota (Supabase) o local.
5.  **Data Source (Data):** La fuente de datos interactúa directamente con el servicio externo (ej. `SupabaseClient`).
6.  **Retorno:** Los datos fluyen de vuelta a través de las capas, actualizando el estado en el `Provider` y, finalmente, reconstruyendo la UI.
