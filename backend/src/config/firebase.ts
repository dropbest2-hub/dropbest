import * as admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

const serviceAccountPath = path.join(__dirname, '../../firebase-key.json');

let firebaseAdmin: admin.app.App | null = null;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        firebaseAdmin = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
        console.log('✅ Firebase Admin Initialized via Environment Variable');
    } catch (error) {
        console.error('❌ Firebase Admin Env Initialization Error:', error);
    }
} else if (fs.existsSync(serviceAccountPath)) {
    try {
        firebaseAdmin = admin.initializeApp({
            credential: admin.credential.cert(serviceAccountPath),
        });
        console.log('✅ Firebase Admin Initialized via JSON File');
    } catch (error) {
        console.error('❌ Firebase Admin File Initialization Error:', error);
    }
} else {
    console.warn('⚠️ Firebase service account not found (no file and no FIREBASE_SERVICE_ACCOUNT env). Push notifications will be disabled.');
}

export const messaging = admin.apps.length > 0 ? admin.messaging() : null;
export default admin;
