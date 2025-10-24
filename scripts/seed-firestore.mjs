
import { db } from '../src/lib/firebase.ts';
import { collection, doc, writeBatch, Timestamp } from 'firebase/firestore';
import { roles, users, clients, products, orders, orderDetails, productionBatches, claims } from '../src/lib/data.ts';
import bcrypt from 'bcryptjs';

const passwordForRole = (role) => {
  switch (role) {
    case 'Admin': return 'admin';
    case 'Sales': return 'ventas';
    case 'Production': return 'produccion';
    default: return 'invitado';
  }
};

// Helper to commit batches in chunks to avoid exceeding Firestore's 500 operations limit
const commitBatchInChunks = async (collectionName, data) => {
  console.log(`Seeding ${collectionName}...`);
  let batch = writeBatch(db);
  let count = 0;

  for (const item of data) {
    const { id, ...itemData } = item;
    const docRef = doc(db, collectionName, id.toString());

    // Convert date properties to Firestore Timestamps
    for (const key in itemData) {
      if (itemData[key] instanceof Date) {
        itemData[key] = Timestamp.fromDate(itemData[key]);
      }
    }
    
    // Special handling for productionBatches items array
    if (collectionName === 'productionBatches' && Array.isArray(itemData.items)) {
        itemData.items = itemData.items.map(orderDetail => orderDetail.id); // Store only IDs
    }

    batch.set(docRef, itemData);
    count++;

    if (count % 499 === 0) {
      await batch.commit();
      console.log(`Committed ${count} documents to ${collectionName}...`);
      batch = writeBatch(db);
    }
  }

  if (count % 499 !== 0) {
    await batch.commit();
  }
  console.log(`Seeded a total of ${count} documents into ${collectionName}.`);
};

async function main() {
  try {
    console.log('Start seeding Firebase...');

    // 1. Seed Roles
    const rolesBatch = writeBatch(db);
    roles.forEach((role) => {
      const roleRef = doc(db, 'roles', role.id.toString());
      rolesBatch.set(roleRef, { name: role.name, permissions: role.permissions });
    });
    await rolesBatch.commit();
    console.log('Roles seeded.');

    // 2. Seed Users
    const usersBatch = writeBatch(db);
    for (const user of users) {
      const password = passwordForRole(user.role);
      const passwordHash = await bcrypt.hash(password, 10);
      const userRef = doc(db, 'users', user.id.toString());
      usersBatch.set(userRef, {
        name: user.name,
        email: user.email,
        role: user.role,
        lastLogin: Timestamp.fromDate(user.lastLogin),
        passwordHash: passwordHash,
      });
    }
    await usersBatch.commit();
    console.log('Users seeded.');

    // 3. Seed other collections using the helper
    await commitBatchInChunks('clients', clients);
    await commitBatchInChunks('products', products);
    await commitBatchInChunks('orders', orders);
    await commitBatchInChunks('orderDetails', orderDetails);
    await commitBatchInChunks('productionBatches', productionBatches);
    await commitBatchInChunks('claims', claims);

    console.log('Firebase seeding finished successfully!');
  } catch (error) {
    console.error('Seeding failed:', error);
  }
}

main();
