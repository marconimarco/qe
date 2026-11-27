import { signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  Timestamp,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  BOOTSTRAPPED_ADMIN_EMAIL,
  OperationType,
  handleFirestoreError,
} from '../firebase';
import type {
  AuthUser,
  CurrentUserSession,
  UserAccessLog,
  UserRole,
  UserStatus,
} from './authService';

const ALL_ICONS_FALLBACK = [
  'agent_ai',
  'send_to_ibm',
  'mitigation',
  'pqc_group',
  'realq',
  'api_key',
];

const ALL_CATEGORIES_FALLBACK = [
  'Finanza e Mercati',
  'Logistica e Supply Chain',
  'Energia e Utilities',
  'Chimica, Farmaceutica e Materiali',
  'Produzione e Manifattura',
  'Sicurezza, Telecomunicazioni e Reti',
  'Sanità e Genomica',
];

function clampString(value: string | undefined | null, maxLen: number, fallback = ''): string {
  const s = typeof value === 'string' ? value.trim() : '';
  if (!s) return fallback;
  return s.slice(0, maxLen);
}

export function sanitizeFirestoreId(raw: string, fallbackPrefix = 'id'): string {
  const cleaned = (raw || '').replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 120);
  if (cleaned.length >= 2) return cleaned;
  return `${fallbackPrefix}_${Date.now()}`;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function hashPasswordWithSalt(
  plainPassword: string,
  existingSalt?: string
): Promise<{ passwordHash: string; passwordSalt: string }> {
  const salt =
    existingSalt && existingSalt.length >= 8
      ? existingSalt.slice(0, 64)
      : bytesToHex(window.crypto.getRandomValues(new Uint8Array(16)));
  const data = new TextEncoder().encode(`${salt}:${plainPassword}`);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  return {
    passwordHash: bytesToHex(new Uint8Array(digest)),
    passwordSalt: salt,
  };
}

export async function verifyPasswordAgainstHash(
  plainPassword: string,
  passwordHash: string,
  passwordSalt: string
): Promise<boolean> {
  if (!passwordHash || !passwordSalt) return false;
  const { passwordHash: computed } = await hashPasswordWithSalt(plainPassword, passwordSalt);
  return computed === passwordHash;
}

function toIsoString(val: unknown): string {
  if (typeof val === 'string' && val.trim()) return val;
  if (val instanceof Timestamp) return val.toDate().toISOString();
  if (val && typeof (val as any).toDate === 'function') {
    return (val as any).toDate().toISOString();
  }
  return new Date().toISOString();
}

export function mapDocToAuthUser(data: Record<string, any>): AuthUser {
  return {
    id: String(data.id || ''),
    username: String(data.username || ''),
    password: '', // Never stored in plaintext in Firestore
    passwordHash: typeof data.passwordHash === 'string' ? data.passwordHash : '',
    passwordSalt: typeof data.passwordSalt === 'string' ? data.passwordSalt : '',
    hasCloudPassword: Boolean(data.hasCloudPassword),
    uid: typeof data.uid === 'string' ? data.uid : '',
    name: String(data.name || data.username || ''),
    email: String(data.email || ''),
    role: data.role === 'admin' ? 'admin' : 'user',
    status: data.status === 'suspended' ? 'suspended' : 'active',
    createdAt: toIsoString(data.createdAt),
    lastLogin: typeof data.lastLogin === 'string' && data.lastLogin ? data.lastLogin : undefined,
    hasAcceptedAgreements: data.role === 'admin' ? true : Boolean(data.hasAcceptedAgreements),
    acceptedAgreementsTimestamp:
      typeof data.acceptedAgreementsTimestamp === 'string' && data.acceptedAgreementsTimestamp
        ? data.acceptedAgreementsTimestamp
        : undefined,
    allowedIcons: Array.isArray(data.allowedIcons) ? data.allowedIcons : [],
    allowedAgentAiCategories: Array.isArray(data.allowedAgentAiCategories)
      ? data.allowedAgentAiCategories
      : [],
  };
}

export function mapDocToAccessLog(data: Record<string, any>): UserAccessLog {
  return {
    id: String(data.id || ''),
    userId: String(data.userId || ''),
    username: String(data.username || ''),
    userRole: data.userRole === 'admin' ? 'admin' : 'user',
    timestamp: String(data.timestamp || toIsoString(data.createdAt)),
    type: data.type || 'action',
    actionName: String(data.actionName || ''),
    viewDetail: String(data.viewDetail || ''),
    targetId: typeof data.targetId === 'string' ? data.targetId : undefined,
    ipAddress: typeof data.ipAddress === 'string' ? data.ipAddress : undefined,
    deviceInfo: typeof data.deviceInfo === 'string' ? data.deviceInfo : undefined,
  };
}

export function isFirebaseAdminActive(): boolean {
  const user = auth.currentUser;
  if (!user || !user.emailVerified) return false;
  return (user.email || '').toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase();
}

export async function ensureBootstrappedAdminDoc(fbUser: FirebaseUser): Promise<void> {
  if (!fbUser.emailVerified || (fbUser.email || '').toLowerCase() !== BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase()) {
    return;
  }
  const adminRef = doc(db, 'admins', fbUser.uid);
  try {
    const snap = await getDoc(adminRef);
    if (!snap.exists()) {
      await setDoc(adminRef, {
        email: (fbUser.email || BOOTSTRAPPED_ADMIN_EMAIL).toLowerCase(),
        createdBy: fbUser.uid,
        createdAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `admins/${fbUser.uid}`);
  }
}

export async function syncCreateOrUpdateAppUser(
  user: AuthUser,
  plainPassword?: string
): Promise<void> {
  const fbUser = auth.currentUser;
  if (!fbUser || !fbUser.emailVerified) return;

  const userId = sanitizeFirestoreId(user.id, 'usr');
  const path = `app_users/${userId}`;
  const ref = doc(db, 'app_users', userId);

  let passwordHash = user.passwordHash || '';
  let passwordSalt = user.passwordSalt || '';
  let hasCloudPassword = Boolean(user.hasCloudPassword || (passwordHash && passwordSalt));

  if (plainPassword && plainPassword.trim().length >= 3) {
    const hashed = await hashPasswordWithSalt(plainPassword.trim());
    passwordHash = hashed.passwordHash;
    passwordSalt = hashed.passwordSalt;
    hasCloudPassword = true;
  }

  const allowedIcons = (Array.isArray(user.allowedIcons) ? user.allowedIcons : [])
    .slice(0, 20)
    .map((s) => String(s));
  const allowedAgentAiCategories = (
    Array.isArray(user.allowedAgentAiCategories) ? user.allowedAgentAiCategories : []
  )
    .slice(0, 20)
    .map((s) => String(s));

  try {
    const existingSnap = await getDoc(ref);
    if (!existingSnap.exists()) {
      const payload = {
        id: userId,
        username: clampString(user.username, 64, 'user'),
        name: clampString(user.name || user.username, 128, 'User'),
        email: clampString((user.email || `${user.username}@sparkquantum.internal`).toLowerCase(), 128),
        role: (user.role === 'admin' ? 'admin' : 'user') as UserRole,
        status: (user.status === 'suspended' ? 'suspended' : 'active') as UserStatus,
        passwordHash: clampString(passwordHash, 128, ''),
        passwordSalt: clampString(passwordSalt, 64, ''),
        hasCloudPassword,
        hasAcceptedAgreements: user.role === 'admin' ? true : Boolean(user.hasAcceptedAgreements),
        acceptedAgreementsTimestamp: clampString(user.acceptedAgreementsTimestamp, 64, ''),
        allowedIcons,
        allowedAgentAiCategories,
        uid: clampString(user.uid, 128, ''),
        createdByUid: fbUser.uid,
        lastLogin: clampString(user.lastLogin, 64, ''),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(ref, payload);
    } else {
      const updatePayload: Record<string, unknown> = {
        username: clampString(user.username, 64, 'user'),
        name: clampString(user.name || user.username, 128, 'User'),
        email: clampString((user.email || `${user.username}@sparkquantum.internal`).toLowerCase(), 128),
        role: user.role === 'admin' ? 'admin' : 'user',
        status: user.status === 'suspended' ? 'suspended' : 'active',
        hasAcceptedAgreements: user.role === 'admin' ? true : Boolean(user.hasAcceptedAgreements),
        acceptedAgreementsTimestamp: clampString(user.acceptedAgreementsTimestamp, 64, ''),
        allowedIcons,
        allowedAgentAiCategories,
        lastLogin: clampString(user.lastLogin, 64, ''),
        updatedAt: serverTimestamp(),
      };
      if (hasCloudPassword && passwordHash && passwordSalt) {
        updatePayload.passwordHash = clampString(passwordHash, 128, '');
        updatePayload.passwordSalt = clampString(passwordSalt, 64, '');
        updatePayload.hasCloudPassword = true;
      }
      await updateDoc(ref, updatePayload);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function syncSelfAgreementsToFirestore(
  userId: string,
  acceptedAtIso: string
): Promise<void> {
  const fbUser = auth.currentUser;
  if (!fbUser || !fbUser.emailVerified) return;

  const cleanId = sanitizeFirestoreId(userId, 'usr');
  const path = `app_users/${cleanId}`;
  try {
    const snap = await getDoc(doc(db, 'app_users', cleanId));
    if (!snap.exists()) return;
    await updateDoc(doc(db, 'app_users', cleanId), {
      hasAcceptedAgreements: true,
      acceptedAgreementsTimestamp: clampString(acceptedAtIso, 64),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function syncDeleteAppUser(userId: string): Promise<void> {
  const fbUser = auth.currentUser;
  if (!fbUser || !fbUser.emailVerified) return;

  const cleanId = sanitizeFirestoreId(userId, 'usr');
  const path = `app_users/${cleanId}`;
  try {
    const snap = await getDoc(doc(db, 'app_users', cleanId));
    if (snap.exists()) {
      await deleteDoc(doc(db, 'app_users', cleanId));
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function syncCreateAccessLog(log: UserAccessLog): Promise<void> {
  const fbUser = auth.currentUser;
  if (!fbUser || !fbUser.emailVerified) return;

  const logId = sanitizeFirestoreId(log.id, 'log');
  const cleanUserId = sanitizeFirestoreId(log.userId, 'usr');
  const path = `access_logs/${logId}`;

  const payload: Record<string, unknown> = {
    id: logId,
    uid: fbUser.uid,
    userId: cleanUserId,
    username: clampString(log.username, 64, 'user'),
    userRole: log.userRole === 'admin' ? 'admin' : 'user',
    timestamp: clampString(log.timestamp, 64, new Date().toISOString()),
    type: log.type,
    actionName: clampString(log.actionName, 200, 'Azione Piattaforma'),
    viewDetail: clampString(log.viewDetail, 500, 'Operazione applicativa'),
    createdAt: serverTimestamp(),
  };

  if (log.targetId) payload.targetId = clampString(log.targetId, 128);
  if (log.ipAddress) payload.ipAddress = clampString(log.ipAddress, 128);
  if (log.deviceInfo) payload.deviceInfo = clampString(log.deviceInfo, 160);

  try {
    await setDoc(doc(db, 'access_logs', logId), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function syncDeleteAccessLogs(userId?: string): Promise<void> {
  const fbUser = auth.currentUser;
  if (!fbUser || !fbUser.emailVerified || !isFirebaseAdminActive()) return;

  const path = 'access_logs';
  try {
    const q = userId
      ? query(collection(db, path), where('userId', '==', sanitizeFirestoreId(userId, 'usr')))
      : collection(db, path);
    const snap = await getDocs(q);
    if (snap.empty) return;
    const batch = writeBatch(db);
    snap.docs.slice(0, 400).forEach((d) => batch.delete(d.ref));
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function signInWithGoogleAndResolveUser(): Promise<{
  success: boolean;
  session?: CurrentUserSession;
  matchedUser?: AuthUser;
  message?: string;
}> {
  try {
    const cred = await signInWithPopup(auth, googleProvider);
    const fbUser = cred.user;
    if (!fbUser || !fbUser.email || !fbUser.emailVerified) {
      await signOut(auth);
      return {
        success: false,
        message: 'Account Google non verificato. Usa un account Google con email verificata.',
      };
    }

    const emailLower = fbUser.email.trim().toLowerCase();
    const nowIso = new Date().toISOString();

    if (emailLower === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase()) {
      await ensureBootstrappedAdminDoc(fbUser);

      // Find or create the super-admin record in app_users
      const adminSnap = await getDocs(
        query(collection(db, 'app_users'), where('email', '==', emailLower))
      );

      let adminUser: AuthUser;
      if (!adminSnap.empty) {
        adminUser = mapDocToAuthUser(adminSnap.docs[0].data());
        await updateDoc(adminSnap.docs[0].ref, {
          uid: fbUser.uid,
          lastLogin: nowIso,
          updatedAt: serverTimestamp(),
        });
      } else {
        const adminId = `usr_admin_${sanitizeFirestoreId(fbUser.uid.slice(0, 12), 'adm')}`;
        adminUser = {
          id: adminId,
          username: (fbUser.email.split('@')[0] || 'admin').slice(0, 64),
          password: '',
          passwordHash: '',
          passwordSalt: '',
          hasCloudPassword: false,
          uid: fbUser.uid,
          name: clampString(fbUser.displayName || 'Super Admin', 128, 'Super Admin'),
          email: emailLower,
          role: 'admin',
          status: 'active',
          createdAt: nowIso,
          lastLogin: nowIso,
          hasAcceptedAgreements: true,
          allowedIcons: ALL_ICONS_FALLBACK,
          allowedAgentAiCategories: ALL_CATEGORIES_FALLBACK,
        };
        await setDoc(doc(db, 'app_users', adminId), {
          id: adminId,
          username: adminUser.username,
          name: adminUser.name,
          email: emailLower,
          role: 'admin',
          status: 'active',
          passwordHash: '',
          passwordSalt: '',
          hasCloudPassword: false,
          hasAcceptedAgreements: true,
          acceptedAgreementsTimestamp: nowIso,
          allowedIcons: ALL_ICONS_FALLBACK,
          allowedAgentAiCategories: ALL_CATEGORIES_FALLBACK,
          uid: fbUser.uid,
          createdByUid: fbUser.uid,
          lastLogin: nowIso,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      const session: CurrentUserSession = {
        id: adminUser.id,
        username: adminUser.username,
        name: adminUser.name,
        email: adminUser.email,
        role: 'admin',
        status: 'active',
        createdAt: adminUser.createdAt,
        lastLogin: nowIso,
        hasAcceptedAgreements: true,
        allowedIcons: ALL_ICONS_FALLBACK,
        allowedAgentAiCategories: ALL_CATEGORIES_FALLBACK,
      };
      return { success: true, session, matchedUser: adminUser };
    }

    // Standard / Admin-created user via Google Sign-In
    const q = query(collection(db, 'app_users'), where('email', '==', emailLower));
    const snap = await getDocs(q);

    if (snap.empty) {
      await signOut(auth);
      return {
        success: false,
        message: `L'email "${emailLower}" non è ancora autorizzata su Spark Quantum. Chiedi all'amministratore (${BOOTSTRAPPED_ADMIN_EMAIL}) di creare un utente con questa email nella Console Utenti.`,
      };
    }

    const userDoc = snap.docs[0];
    const matchedUser = mapDocToAuthUser(userDoc.data());

    if (matchedUser.status === 'suspended') {
      await signOut(auth);
      return {
        success: false,
        message: 'Questo account è stato sospeso dall\'amministratore.',
      };
    }

    // Link UID on first Google login or update lastLogin
    if (!matchedUser.uid) {
      await updateDoc(userDoc.ref, {
        uid: fbUser.uid,
        lastLogin: nowIso,
        updatedAt: serverTimestamp(),
      });
      matchedUser.uid = fbUser.uid;
    } else {
      await updateDoc(userDoc.ref, {
        lastLogin: nowIso,
        updatedAt: serverTimestamp(),
      });
    }
    matchedUser.lastLogin = nowIso;

    if (matchedUser.role === 'admin') {
      try {
        const adminRef = doc(db, 'admins', fbUser.uid);
        const adminCheck = await getDoc(adminRef);
        if (!adminCheck.exists()) {
          // Only admins can create /admins/{uid}; skip silently if self is not bootstrapped
        }
      } catch {
        // non-blocking
      }
    }

    const session: CurrentUserSession = {
      id: matchedUser.id,
      username: matchedUser.username,
      name: matchedUser.name,
      email: matchedUser.email,
      role: matchedUser.role,
      status: matchedUser.status,
      createdAt: matchedUser.createdAt,
      lastLogin: nowIso,
      hasAcceptedAgreements:
        matchedUser.role === 'admin' ? true : Boolean(matchedUser.hasAcceptedAgreements),
      acceptedAgreementsTimestamp: matchedUser.acceptedAgreementsTimestamp,
      allowedIcons: matchedUser.allowedIcons ?? [],
      allowedAgentAiCategories: matchedUser.allowedAgentAiCategories ?? [],
    };

    return { success: true, session, matchedUser };
  } catch (err: any) {
    if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
      return { success: false, message: 'Accesso Google annullato.' };
    }
    if (err?.code === 'auth/unauthorized-domain') {
      return {
        success: false,
        message:
          'Dominio non ancora autorizzato in Firebase Authentication -> Authorized domains. Aggiungi il dominio nella Firebase Console.',
      };
    }
    console.error('Google Sign-In error:', err);
    return {
      success: false,
      message: err?.message || 'Errore durante autenticazione Google / Firestore.',
    };
  }
}

export async function firebaseSignOut(): Promise<void> {
  try {
    if (auth.currentUser) {
      await signOut(auth);
    }
  } catch (err) {
    console.error('Firebase signOut error:', err);
  }
}

export function subscribeFirestoreDirectory(callbacks: {
  onAuthChange: (fbUser: FirebaseUser | null) => void;
  onCloudUsers: (users: AuthUser[], isFullDirectory: boolean) => void;
  onCloudLogs: (logs: UserAccessLog[]) => void;
}): () => void {
  let unsubUsers: (() => void) | null = null;
  let unsubLogs: (() => void) | null = null;

  const cleanupDataListeners = () => {
    if (unsubUsers) {
      unsubUsers();
      unsubUsers = null;
    }
    if (unsubLogs) {
      unsubLogs();
      unsubLogs = null;
    }
  };

  const unsubAuth = onAuthStateChanged(auth, (fbUser) => {
    cleanupDataListeners();
    callbacks.onAuthChange(fbUser);

    if (!fbUser || !fbUser.emailVerified || !fbUser.email) {
      return;
    }

    const emailLower = fbUser.email.trim().toLowerCase();
    const isSuperAdmin = emailLower === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase();

    if (isSuperAdmin) {
      void ensureBootstrappedAdminDoc(fbUser).catch(() => {});

      unsubUsers = onSnapshot(
        collection(db, 'app_users'),
        (snap) => {
          const users = snap.docs.map((d) => mapDocToAuthUser(d.data()));
          callbacks.onCloudUsers(users, true);
        },
        (err) => {
          handleFirestoreError(err, OperationType.LIST, 'app_users');
        }
      );

      unsubLogs = onSnapshot(
        collection(db, 'access_logs'),
        (snap) => {
          const logs = snap.docs
            .map((d) => mapDocToAccessLog(d.data()))
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          callbacks.onCloudLogs(logs);
        },
        (err) => {
          handleFirestoreError(err, OperationType.LIST, 'access_logs');
        }
      );
    } else {
      unsubUsers = onSnapshot(
        query(collection(db, 'app_users'), where('email', '==', emailLower)),
        (snap) => {
          const users = snap.docs.map((d) => mapDocToAuthUser(d.data()));
          callbacks.onCloudUsers(users, false);
        },
        (err) => {
          handleFirestoreError(err, OperationType.LIST, 'app_users');
        }
      );
    }
  });

  return () => {
    cleanupDataListeners();
    unsubAuth();
  };
}
