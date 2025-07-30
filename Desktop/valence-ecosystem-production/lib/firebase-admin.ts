import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

let initialized = false;

export function initAdmin() {
  if (!initialized && !getApps().length) {
    try {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_ADMIN_PROJECT_ID || 'valence-ecosystem',
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL || 'firebase-adminsdk@valence-ecosystem.iam.gserviceaccount.com',
          privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n') || '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC9W8bA\n-----END PRIVATE KEY-----\n',
        }),
      });
      initialized = true;
    } catch (error) {
      console.error('Failed to initialize Firebase Admin:', error);
      // Initialize with minimal config for build
      if (!getApps().length) {
        initializeApp({
          projectId: 'valence-ecosystem',
        });
        initialized = true;
      }
    }
  }
}

export function getAdminDb() {
  initAdmin();
  return getFirestore();
}

export function getAdminAuth() {
  initAdmin();
  return getAuth();
}

export const adminDb = getAdminDb();
export const adminAuth = getAdminAuth();
export { FieldValue };