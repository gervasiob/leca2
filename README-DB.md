# Base de Datos (Firebase Firestore)

Este proyecto utiliza **Firebase Firestore** como su base de datos principal para la persistencia de datos. Firestore es una base de datos NoSQL, flexible y escalable para el desarrollo móvil, web y de servidores de Firebase y Google Cloud.

## Configuración

La configuración del cliente de Firebase se encuentra en `src/lib/firebase.ts`. Este archivo inicializa la aplicación de Firebase utilizando las variables de entorno de tu proyecto de Firebase.

Asegúrate de que tu archivo `.env.local` (o las variables de entorno de tu entorno de despliegue) contenga las siguientes claves obtenidas desde la consola de Firebase:

```
NEXT_PUBLIC_FIREBASE_API_KEY="AIza..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="tu-proyecto.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="tu-proyecto"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="tu-proyecto.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="..."
NEXT_PUBLIC_FIREBASE_APP_ID="1:..."
```

## Estructura de Datos

Al ser una base de datos NoSQL, Firestore organiza los datos en **colecciones** y **documentos**. Las principales colecciones para esta aplicación son:

- `users`
- `roles`
- `clients`
- `products`
- `orders`
- `claims`

Cada documento dentro de estas colecciones representa un registro individual.

## Interactuando con la Base de Datos

Para interactuar con Firestore, puedes importar el cliente `db` desde `src/lib/firebase.ts` y usar las funciones del SDK de Firebase v9+ (API modular) para realizar operaciones CRUD (Crear, Leer, Actualizar, Eliminar).

**Ejemplo de lectura de documentos:**
```typescript
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

async function getClients() {
  const clientsCol = collection(db, 'clients');
  const clientSnapshot = await getDocs(clientsCol);
  const clientList = clientSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  return clientList;
}
```

## Ventajas de Usar Firestore

- **Escalabilidad:** Se escala automáticamente para satisfacer la demanda.
- **Consultas en tiempo real:** Escucha los cambios de datos en tiempo real.
- **Soporte sin conexión:** Ofrece soporte sin conexión para dispositivos móviles y web.
- **Integración con Firebase:** Se integra a la perfección con otros servicios de Firebase como Authentication, Functions y Storage.
