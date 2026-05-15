import * as admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

const serviceAccountPath = path.join(__dirname, '../../firebase-key.json');

if (fs.existsSync(serviceAccountPath)) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccountPath),
        });
        console.log('✅ Firebase Admin Initialized Successfully');
    } catch (error) {
        console.error('❌ Firebase Admin Initialization Error:', error);
    }
} else {
    console.warn('⚠️ Firebase service account file not found. Push notifications will be disabled.');
}

export const messaging = admin.messaging ? admin.messaging() : null;
export default admin;
