// === Firestore Export Tool ===
// Exports your entire Firestore database to a JSON file.
//
// === Setup Instructions ===
// 1️⃣ Navigate to your project directory:
//     cd C:\projects\Southern-Sense-V1-Save
// 2️⃣ Save this file as: export-firestore.mjs
// 3️⃣ Run: npm install firebase-admin
// 4️⃣ Run: node export-firestore.mjs
//
// Using the .mjs extension ensures Node treats this as an ES module.

import fs from 'fs';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// === CONFIG ===
const SERVICE_ACCOUNT_PATH = 'C:/projects/Firestore/serviceAccountKey.json';
const OUTPUT_FILE = './firestore-export.json';

// Initialize Firebase Admin
const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

// === EXPORT LOGIC ===
async function exportFirestore() {
  const data = {};

  const collections = await db.listCollections();
  for (const col of collections) {
    const colName = col.id;
    data[colName] = {};

    const snapshot = await col.get();
    for (const doc of snapshot.docs) {
      data[colName][doc.id] = doc.data();
    }
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));
  console.log(`✅ Firestore export complete → ${OUTPUT_FILE}`);
}

exportFirestore().catch((err) => {
  console.error('❌ Export failed:', err);
});
