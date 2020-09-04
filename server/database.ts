const Firestore = require('@google-cloud/firestore');

const serviceAccountPath = `./service-accounts/${process.env.SERVICE_ACCOUNT_FILE_NAME}`;

export const db = new Firestore({
  projectId: process.env.PROJECT_ID,
  keyFilename: serviceAccountPath
});

export async function getDocData(path) {
  const snap = await db.doc(path).get();

  return snap.data();
}
