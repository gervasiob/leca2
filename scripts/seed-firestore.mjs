
/**
 * Populates Firebase Firestore with initial data from src/lib/data.ts.
 */
import {
  roles,
  users,
  clients,
  products,
  orders,
  orderDetails,
  claims,
  productionBatches,
} from '../src/lib/data.ts';
import { db } from '../src/lib/firebase.ts';
import {
  collection,
  doc,
  setDoc,
  writeBatch,
  Timestamp,
} from 'firebase/firestore';
import bcrypt from 'bcryptjs';
import { UserRole } from '../src/lib/types.ts';

const passwordForRole = (
  role: 'Admin' | 'Sales' | 'Production' | 'Invitado'
) =>
  role === 'Admin'
    ? 'admin'
    : role === 'Sales'
    ? 'ventas'
    : role === 'Production'
    ? 'produccion'
    : 'invitado';

async function main() {
  console.log('Start seeding Firebase...');

  // 1. Seed Roles
  const rolesBatch = writeBatch(db);
  roles.forEach((role) => {
    // Firestore auto-generates IDs, but if you want to keep your numeric ones, you must set them as strings.
    const roleRef = doc(db, 'roles', role.id.toString());
    rolesBatch.set(roleRef, { name: role.name, permissions: role.permissions });
  });
  await rolesBatch.commit();
  console.log('Roles seeded.');

  // 2. Seed Users
  const usersBatch = writeBatch(db);
  for (const user of users) {
    const password = passwordForRole(user.role as any);
    const passwordHash = await bcrypt.hash(password, 10);
    // Let Firestore generate user IDs
    const userRef = doc(collection(db, 'users')); 
    usersBatch.set(userRef, {
      name: user.name,
      email: user.email,
      role: user.role, // Storing role name directly
      lastLogin: Timestamp.fromDate(user.lastLogin),
      passwordHash: passwordHash,
    });
  }
  await usersBatch.commit();
  console.log('Users seeded.');
  
  // Helper to commit batches in chunks of 500
  const commitBatchInChunks = async (collectionName, data) => {
    let batch = writeBatch(db);
    let count = 0;
    for (const item of data) {
      const { id, ...itemData } = item;
      const docRef = doc(db, collectionName, id.toString());

      // Convert date strings/objects to Timestamps
      for (const key in itemData) {
        if (Object.prototype.hasOwnProperty.call(itemData, key)) {
          // Check for date-like names or if it's a Date object
          if (itemData[key] instanceof Date || (typeof itemData[key] === 'string' && itemData[key].match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/))) {
             itemData[key] = Timestamp.fromDate(new Date(itemData[key]));
          }
        }
      }

      batch.set(docRef, itemData);
      count++;
      if (count === 499) { // Firestore batch limit is 500 writes
        await batch.commit();
        batch = writeBatch(db);
        count = 0;
      }
    }
    if (count > 0) {
      await batch.commit();
    }
    console.log(`${collectionName} seeded.`);
  }

  // 3. Seed Clients
  await commitBatchInChunks('clients', clients);

  // 4. Seed Products
  await commitBatchInChunks('products', products);

  // 5. Seed Orders
  await commitBatchInChunks('orders', orders);

  // 6. Seed OrderDetails
  await commitBatchInChunks('orderDetails', orderDetails.map(od => {
    const {isProduced, ...rest} = od; // Remove isProduced if it's not in the target schema
    return rest;
  }));

  // 7. Seed ProductionBatches
  await commitBatchInChunks('productionBatches', productionBatches.map(pb => {
      return {
          ...pb,
          items: pb.items.map(item => item.id) // store only item IDs
      }
  }));

  // 8. Seed Claims
  await commitBatchInChunks('claims', claims);

  console.log('Seeding finished.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
