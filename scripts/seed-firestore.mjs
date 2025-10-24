/**
 * Populates the Firebase Firestore database with initial data.
 */
import { db } from '@/lib/firebase'; // Corrected import path
import { collection, doc, writeBatch, Timestamp } from 'firebase/firestore';
import {
  roles as seedRoles,
  users as seedUsers,
  clients as seedClients,
  products as seedProducts,
  orders as seedOrders,
  productionBatches as seedBatches,
  orderDetails as seedDetails,
  claims as seedClaims,
} from '../src/lib/data.ts';
import bcrypt from 'bcryptjs';

const passwordForRole = (role) => {
  switch (role) {
    case 'Admin': return 'admin';
    case 'Sales': return 'ventas';
    case 'Production': return 'produccion';
    default: return 'invitado';
  }
};

const commitBatchInChunks = async (collectionName, data) => {
  let batch = writeBatch(db);
  let count = 0;
  for (const item of data) {
    // Ensure ID is a string for Firestore document IDs
    const docId = String(item.id); 
    const docRef = doc(db, collectionName, docId);
    
    // Create a mutable copy and handle special data types
    const { id, ...itemData } = item;
    
    for (const key in itemData) {
      if (Object.prototype.hasOwnProperty.call(itemData, key)) {
        const value = itemData[key];
        // Convert any date strings or Date objects to Firestore Timestamps
        if (value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)))) {
           itemData[key] = Timestamp.fromDate(new Date(value));
        }
      }
    }

    // Special handling for productionBatches items array
    if (collectionName === 'productionBatches' && Array.isArray(itemData.items)) {
        itemData.items = itemData.items.map(batchItem => String(batchItem.id));
    }
    
    batch.set(docRef, itemData);
    count++;
    
    if (count % 499 === 0) {
      await batch.commit();
      console.log(`Committed ${count} documents to ${collectionName}.`);
      batch = writeBatch(db);
    }
  }

  if (count % 499 !== 0) {
    await batch.commit();
  }
  console.log(`Seeded a total of ${count} documents into ${collectionName}.`);
};

async function main() {
  console.log('Start seeding Firebase...');

  // 1. Seed Roles
  await commitBatchInChunks('roles', seedRoles);
  
  // 2. Seed Users
  const usersWithHashedPasswords = await Promise.all(
    seedUsers.map(async (user) => {
      const password = passwordForRole(user.role);
      const passwordHash = await bcrypt.hash(password, 10);
      const { lastLogin, ...rest } = user;
      return {
        ...rest,
        lastLogin: Timestamp.fromDate(new Date(lastLogin)),
        passwordHash,
      };
    })
  );
  await commitBatchInChunks('users', usersWithHashedPasswords);

  // 3. Seed other collections
  await commitBatchInChunks('clients', seedClients);
  await commitBatchInChunks('products', seedProducts);
  await commitBatchInChunks('orders', seedOrders);
  await commitBatchInChunks('productionBatches', seedBatches);
  await commitBatchInChunks('orderDetails', seedDetails);
  await commitBatchInChunks('claims', seedClaims);

  console.log('Seeding finished successfully.');
}

main().catch((e) => {
  console.error('Seeding failed:', e);
  process.exit(1);
});
