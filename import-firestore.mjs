/**
 * Southern Sense Firestore JSON Import (ESM version)
 * Imports firestore-export.json into Firestore using Admin SDK
 */

import fs from "fs";
import admin from "firebase-admin";

// Path to your service account key (local secure copy)
const serviceAccountPath = "C:/projects/Firestore/serviceAccountKey.json";
const jsonDataPath = "./firestore-export.json";

// Load files
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
const data = JSON.parse(fs.readFileSync(jsonDataPath, "utf8"));

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function importData() {
  console.log("🚀 Starting Firestore import...");

  for (const [collectionName, documents] of Object.entries(data)) {
    const collectionRef = db.collection(collectionName);

    for (const [docId, docData] of Object.entries(documents)) {
      // CRITICAL FIX: Data Normalization
      // The front-end expects 'wax-melt', but the data sometimes uses 'melt'.
      // Normalize 'melt' to 'wax-melt' only for the 'products' collection.
      if (collectionName === 'products' && docData.category === 'melt') {
          docData.category = 'wax-melt';
          console.log(`   ⚙️ Normalized category for ${docId} to 'wax-melt'`);
      }
      
      await collectionRef.doc(docId).set(docData);
      console.log(`✅ Imported: ${collectionName}/${docId}`);
    }
  }

  console.log("🎉 Firestore import completed successfully!");
}

// Run import
importData().catch((err) => {
  console.error("❌ Error importing Firestore data:", err);
});