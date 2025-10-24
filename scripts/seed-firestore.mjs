
/**
 * Populates the Firebase Firestore database with initial data.
 *
 * This seeder script connects to the database using the Firebase client
 * and performs the following actions:
 * 1.  Upserts roles from `src/lib/data.ts`, creating or updating them based on their IDs.
 * 2.  Upserts users, hashing their passwords for security. It links them to their corresponding roles.
 * 3.  Upserts clients, products, orders, order details, production batches, and claims.
 *
 * The script uses Batched Writes to efficiently upload data and avoid hitting API rate limits.
 * It's designed to be executed via the `npm run db:seed` command.
 */
import {
  collection,
  doc,
  writeBatch,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../src/lib/firebase.js'; // Use .js extension for ES modules
import {
  roles,
  users,
  clients,
  products,
  orders,
  orderDetails,
  productionBatches,
  claims,
} from '../src/lib/data.js'; // Use .js extension for ES modules
import bcrypt from 'bcryptjs';

const passwordForRole = (role) => {
  return role === 'Admin'
    ? 'admin'
    : role === 'Sales'
    ? 'ventas'
    : role === 'Production'
    ? 'produccion'
    : 'invitado';
};

// Helper to commit batches in chunks of 499 (Firestore limit is 500)
const commitBatchInChunks = async (collectionName, data) => {
    console.log(`Seeding ${collectionName}...`);
    let batch = writeBatch(db);
    let count = 0;
    const totalItems = data.length;

    for (let i = 0; i < totalItems; i++) {
        const item = data[i];
        const docId = item.id.toString(); // Ensure ID is a string
        const docRef = doc(db, collectionName, docId);
        
        // Create a new object to avoid modifying the original data from the import
        const itemData = { ...item };
        delete itemData.id; // Don't store the ID as a field in the document

        // Convert date strings/objects to Firestore Timestamps
        for (const key in itemData) {
            if (Object.prototype.hasOwnProperty.call(itemData, key)) {
                const value = itemData[key];
                if (value instanceof Date) {
                    itemData[key] = Timestamp.fromDate(value);
                } else if (typeof value === 'string' && !isNaN(Date.parse(value))) {
                    const parsedDate = new Date(value);
                    if (!isNaN(parsedDate.getTime())) {
                        // Check if it's a valid date string before converting
                         if (key === 'orderDate' || key === 'lastLogin' || key.includes('Date')) {
                            itemData[key] = Timestamp.fromDate(parsedDate);
                         }
                    }
                }
            }
        }
        
        batch.set(docRef, itemData);
        count++;

        if (count === 499 || i === totalItems - 1) {
            await batch.commit();
            console.log(`  ...committed ${count} documents to ${collectionName}.`);
            if (i < totalItems - 1) {
                batch = writeBatch(db); // Start a new batch
                count = 0;
            }
        }
    }
    console.log(`${collectionName} seeded successfully.`);
};


async function main() {
  console.log('Start seeding Firebase...');

  // 1. Seed Roles
  const rolesBatch = writeBatch(db);
  roles.forEach((role) => {
    const roleRef = doc(db, 'roles', role.id.toString());
    rolesBatch.set(roleRef, { name: role.name, permissions: role.permissions });
  });
  await rolesBatch.commit();
  console.log('Roles seeded.');

  // 2. Seed Users - Let Firestore auto-generate IDs for users
  const usersBatch = writeBatch(db);
  for (const user of users) {
    const password = passwordForRole(user.role);
    const passwordHash = await bcrypt.hash(password, 10);
    const userRef = doc(collection(db, 'users')); // Auto-generate ID
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
  
  // 3. Seed other collections
  await commitBatchInChunks('clients', clients);
  await commitBatchInChunks('products', products);
  await commitBatchInChunks('orders', orders);
  await commitBatchInChunks('orderDetails', orderDetails);
  await commitBatchInChunks('productionBatches', productionBatches);
  await commitBatchInChunks('claims', claims);

  console.log('Seeding finished.');
}

main().catch((e) => {
  console.error('Seeding failed:', e);
  process.exit(1);
});
