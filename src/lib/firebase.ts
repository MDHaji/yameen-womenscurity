import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, User } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  setDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Contact, SafeZone } from '../types';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// CRITICAL: Must use firebaseConfig.firestoreDatabaseId as required by AI Studio guidelines
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection on boot
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or connecting.');
    }
    return false;
  }
}

// User Sign In via Google
export async function signInWithGoogle(): Promise<User | null> {
  try {
    const cred = await signInWithPopup(auth, googleProvider);
    return cred.user;
  } catch (err) {
    console.error('Google Sign In Error:', err);
    return null;
  }
}

export async function logOut(): Promise<void> {
  await signOut(auth);
}

// Device ID fallback for anonymous/offline devices
export function getOrCreateDeviceId(): string {
  let id = localStorage.getItem('sg_device_id');
  if (!id) {
    id = 'dev_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
    localStorage.setItem('sg_device_id', id);
  }
  return id;
}

// Sync SOS Alert to Firebase Cloud
export async function syncEmergencyAlertToFirebase(params: {
  lat: number;
  lng: number;
  accuracy: number;
  message: string;
}): Promise<string | null> {
  const alertId = 'alert_' + Date.now();
  const userId = auth.currentUser?.uid || getOrCreateDeviceId();
  const path = `emergency_alerts/${alertId}`;

  try {
    await setDoc(doc(db, 'emergency_alerts', alertId), {
      userId,
      status: 'active',
      lat: params.lat,
      lng: params.lng,
      accuracy: params.accuracy,
      message: params.message.substring(0, 500),
      createdAt: new Date().toISOString(),
    });
    return alertId;
  } catch (error) {
    console.warn('Could not sync alert to Firebase (offline or permission):', error);
    return null;
  }
}

// Resolve SOS Alert
export async function resolveEmergencyAlertInFirebase(alertId: string): Promise<void> {
  const path = `emergency_alerts/${alertId}`;
  try {
    await setDoc(
      doc(db, 'emergency_alerts', alertId),
      {
        status: 'resolved',
        resolvedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    console.warn('Could not resolve alert in Firebase:', error);
  }
}

// Backup Contacts to Firebase
export async function backupContactsToFirebase(contacts: Contact[]): Promise<boolean> {
  const userId = auth.currentUser?.uid || getOrCreateDeviceId();
  try {
    for (const contact of contacts) {
      await setDoc(doc(db, 'contacts', contact.id), {
        userId,
        name: contact.name,
        phone: contact.phone,
        relation: contact.relation,
        isPrimary: Boolean(contact.isPrimary),
        updatedAt: new Date().toISOString(),
      });
    }
    return true;
  } catch (error) {
    console.warn('Could not backup contacts to Firebase:', error);
    return false;
  }
}

// Restore Contacts from Firebase
export async function fetchContactsFromFirebase(): Promise<Contact[]> {
  const userId = auth.currentUser?.uid || getOrCreateDeviceId();
  try {
    const q = query(collection(db, 'contacts'), where('userId', '==', userId));
    const snap = await getDocs(q);
    const result: Contact[] = [];
    snap.forEach((d) => {
      const data = d.data();
      result.push({
        id: d.id,
        name: data.name,
        phone: data.phone,
        relation: data.relation || 'Contact',
        isPrimary: Boolean(data.isPrimary),
      });
    });
    return result;
  } catch (error) {
    console.warn('Could not fetch contacts from Firebase:', error);
    return [];
  }
}
