/**
 * Script para poblar la base de datos de Firestore con datos iniciales.
 *
 * USO:
 * 1. Asegúrate de que tus variables de entorno de Firebase estén en un archivo .env.local
 *    en la raíz del proyecto.
 * 2. Ejecuta el script con: `npm run db:seed`
 *
 * Este script leerá los datos desde `src/lib/data.ts` y los subirá a tu
 * instancia de Firestore. Borrará las colecciones existentes antes de subirlas
 * para evitar duplicados en ejecuciones repetidas.
 */
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, writeBatch, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { config } from 'dotenv';
import {
  roles,
  users,
  clients,
  products,
  orders,
  orderDetails,
  claims,
  productionBatches
} from '../src/lib/data.ts';
import bcrypt from 'bcryptjs';

// Cargar variables de entorno desde .env.local
config({ path: './.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

if (!firebaseConfig.projectId) {
  console.error("Error: Las variables de entorno de Firebase no están configuradas.");
  console.error("Asegúrate de tener un archivo .env.local con las credenciales de tu proyecto.");
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Helper para limpiar una colección
async function clearCollection(collectionName) {
  const collectionRef = collection(db, collectionName);
  const snapshot = await getDocs(collectionRef);
  if (snapshot.empty) {
    console.log(`Colección '${collectionName}' ya está vacía.`);
    return;
  }
  const batch = writeBatch(db);
  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });
  await batch.commit();
  console.log(`Colección '${collectionName}' ha sido limpiada.`);
}

async function seed() {
  console.log('Iniciando el proceso de siembra en Firestore...');
  
  const collectionsToClear = ['roles', 'users', 'clients', 'products', 'orders', 'orderDetails', 'claims', 'productionBatches'];
  
  for (const col of collectionsToClear) {
    await clearCollection(col);
  }

  const batch = writeBatch(db);

  // 1. Roles
  roles.forEach(role => {
    const docRef = doc(db, 'roles', String(role.id));
    batch.set(docRef, role);
  });
  console.log('Roles preparados para la siembra.');

  // 2. Users (con hash de contraseña)
  for (const user of users) {
    const password = user.role === 'Admin' ? 'admin' : user.role === 'Sales' ? 'ventas' : 'produccion';
    const passwordHash = await bcrypt.hash(password, 10);
    const docRef = doc(db, 'users', String(user.id));
    const { role: roleName, ...restOfUser } = user;
    batch.set(docRef, { ...restOfUser, passwordHash, role: user.role });
  }
  console.log('Usuarios preparados para la siembra.');

  // 3. Clients
  clients.forEach(client => {
    const docRef = doc(db, 'clients', String(client.id));
    batch.set(docRef, client);
  });
  console.log('Clientes preparados para la siembra.');

  // 4. Products
  products.forEach(product => {
    const docRef = doc(db, 'products', String(product.id));
    batch.set(docRef, product);
  });
  console.log('Productos preparados para la siembra.');

  // 5. Orders
  orders.forEach(order => {
    const docRef = doc(db, 'orders', String(order.id));
    batch.set(docRef, order);
  });
  console.log('Pedidos preparados para la siembra.');

  // 6. OrderDetails
  orderDetails.forEach(detail => {
    const docRef = doc(db, 'orderDetails', String(detail.id));
    batch.set(docRef, detail);
  });
  console.log('Detalles de pedidos preparados para la siembra.');

  // 7. Claims
  claims.forEach(claim => {
    const docRef = doc(db, 'claims', String(claim.id));
    batch.set(docRef, claim);
  });
  console.log('Reclamos preparados para la siembra.');
    
  // 8. ProductionBatches
  productionBatches.forEach(pbatch => {
    // Firestore no puede serializar arrays de objetos complejos directamente como queremos.
    // Guardaremos los IDs de los items en su lugar.
    const itemIds = pbatch.items.map(item => item.id);
    const { items, ...restOfBatch } = pbatch;
    const docRef = doc(db, 'productionBatches', String(pbatch.id));
    batch.set(docRef, {...restOfBatch, items: itemIds });
  });
  console.log('Lotes de producción preparados para la siembra.');

  // Ejecutar el batch
  try {
    await batch.commit();
    console.log('✅ ¡Siembra completada! Todos los datos han sido escritos en Firestore.');
  } catch (error) {
    console.error('❌ Error al escribir el batch en Firestore:', error);
  } finally {
    // Forzamos la salida porque el proceso de Firebase puede quedarse colgado.
    process.exit(0);
  }
}

seed().catch(error => {
  console.error("Error inesperado durante el proceso de siembra:", error);
  process.exit(1);
});
