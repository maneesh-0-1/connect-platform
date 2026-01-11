import * as admin from 'firebase-admin';

function formatPrivateKey(key: string) {
    return key.replace(/\\n/g, '\n');
}

export function initAdmin() {
    if (!admin.apps.length) {
        const privateKey = process.env.FIREBASE_PRIVATE_KEY
            ? formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY)
            : undefined;

        let serviceAccount;
        if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
            try {
                // Check if it looks like JSON (starts with '{')
                if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY.trim().startsWith('{')) {
                    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
                } else {
                    // Assume Base64
                    const buffer = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY, 'base64');
                    serviceAccount = JSON.parse(buffer.toString('utf-8'));
                }
            } catch (error) {
                console.warn('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY', error);
            }
        }

        if (serviceAccount) {
            console.log('Firebase Admin: Initializing with Service Account Key');
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
        } else if (privateKey && process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL) {
            console.log('Firebase Admin: Initializing with Individual Env Vars');
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: privateKey,
                }),
            });
        } else {
            // Fallback for build time or development without creds to prevent crash on import
            // But actual calls will fail if not init
            if (process.env.NODE_ENV === 'development') {
                console.warn("Firebase Admin: Missing credentials");
            }
        }
    }
    return admin;
}

export const getAdminAuth = () => {
    initAdmin();
    return admin.auth();
}

export const getAdminDb = () => {
    initAdmin();
    return admin.firestore();
}
