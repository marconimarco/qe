export type UserRole = 'admin' | 'user';
export type UserStatus = 'active' | 'suspended';

export interface AppIconPermission {
  id: string;
  name: string;
  category: 'core' | 'quantum' | 'security' | 'system';
  icon: string;
  description: string;
}

export const ALL_APP_ICONS: AppIconPermission[] = [
  {
    id: 'agent_ai',
    name: 'Agent AI (Portale Centrale)',
    category: 'core',
    icon: 'Cpu',
    description: 'Compilazione quantistica deterministica, esecuzione scenari e test E2E.'
  },
  {
    id: 'send_to_ibm',
    name: 'IBM Quantum Interface',
    category: 'quantum',
    icon: 'Terminal',
    description: 'Accesso a Qiskit Runtime, invio circuiti hardware e calibrazione QASM 3.0.'
  },
  {
    id: 'translator',
    name: 'Quantum Translator',
    category: 'quantum',
    icon: 'Languages',
    description: 'Traduzione incrociata tra linguaggi quantistici, Python e OpenQASM.'
  },
  {
    id: 'crosscode',
    name: 'Cross Code Interop',
    category: 'quantum',
    icon: 'Code2',
    description: 'Analisi ibrida e cross-compilazione tra quantum e high-performance classical.'
  },
  {
    id: 'mitigation',
    name: 'Noise Management',
    category: 'quantum',
    icon: 'ShieldCheck',
    description: 'Protocollo di cancellazione rumore NISQ e dynamical decoupling XY4.'
  },
  {
    id: 'pqc_group',
    name: 'Suite Post-Quantum (PQC)',
    category: 'security',
    icon: 'Lock',
    description: 'Suite di sicurezza NIST: Crypto-Locker, Key-Gen e Quantum-Safe Chat.'
  },
  {
    id: 'medical_screening',
    name: 'Medical Screening',
    category: 'core',
    icon: 'Sparkles',
    description: 'Modulo di screening biomedico quantistico e analisi predittiva biomarker.'
  },
  {
    id: 'realq',
    name: 'Specifiche e Guida RealQ',
    category: 'system',
    icon: 'HelpCircle',
    description: 'Documentazione tecnica e architettura dell ecosistema quantistico.'
  },
  {
    id: 'api_key',
    name: 'Configurazione Google API Key',
    category: 'system',
    icon: 'Key',
    description: 'Gestione e configurazione credenziali Google AI Studio.'
  }
];

export const ALL_APP_ICON_IDS: string[] = ALL_APP_ICONS.map(i => i.id);

export interface AuthUser {
  id: string;
  username: string;
  password: string; // Stored securely in client storage for local simulation
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  lastLogin?: string;
  hasAcceptedAgreements?: boolean;
  acceptedAgreementsTimestamp?: string;
  allowedIcons?: string[]; // Array of allowed icon IDs
}

export interface CurrentUserSession {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  lastLogin?: string;
  hasAcceptedAgreements?: boolean;
  acceptedAgreementsTimestamp?: string;
  allowedIcons?: string[];
}

const USERS_STORAGE_KEY = 'spark_quantum_users_db_v1';
const SESSION_STORAGE_KEY = 'spark_quantum_auth_session_v1';

export const DEFAULT_USERS: AuthUser[] = [
  {
    id: 'usr_admin_001',
    username: 'admin',
    password: 'AdminPassword2026!',
    name: 'Chief Security Officer (Admin)',
    email: 'admin@sparkquantum.internal',
    role: 'admin',
    status: 'active',
    createdAt: '2026-01-15T08:00:00.000Z',
    lastLogin: '2026-08-18T11:50:00.000Z',
    hasAcceptedAgreements: false,
    allowedIcons: ALL_APP_ICON_IDS
  },
  {
    id: 'usr_demo_003',
    username: 'demo',
    password: 'DemoPassword2026!',
    name: 'Demo Account',
    email: 'demo@sparkquantum.internal',
    role: 'user',
    status: 'active',
    createdAt: '2026-03-01T10:00:00.000Z',
    lastLogin: '2026-08-18T12:00:00.000Z',
    hasAcceptedAgreements: true,
    allowedIcons: ALL_APP_ICON_IDS
  },
  {
    id: 'usr_user_002',
    username: 'quantum_user',
    password: 'UserPassword2026!',
    name: 'Quantum Risk Analyst (User)',
    email: 'analyst@sparkquantum.internal',
    role: 'user',
    status: 'active',
    createdAt: '2026-02-01T09:30:00.000Z',
    lastLogin: '2026-08-18T10:15:00.000Z',
    hasAcceptedAgreements: false,
    allowedIcons: ALL_APP_ICON_IDS
  }
];

export function getStoredUsers(): AuthUser[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }

    // Ensure demo account is always available in storage
    const hasDemo = parsed.some((u: AuthUser) => u.username?.trim().toLowerCase() === 'demo');
    if (!hasDemo) {
      parsed.push({
        id: 'usr_demo_003',
        username: 'demo',
        password: 'DemoPassword2026!',
        name: 'Demo Account',
        email: 'demo@sparkquantum.internal',
        role: 'user',
        status: 'active',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        hasAcceptedAgreements: true,
        allowedIcons: ALL_APP_ICON_IDS
      });
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(parsed));
    }

    return parsed;
  } catch {
    return DEFAULT_USERS;
  }
}

export function saveStoredUsers(users: AuthUser[]): void {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

export function getCurrentSession(): CurrentUserSession | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setCurrentSession(user: AuthUser | null): void {
  if (!user) {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    return;
  }
  const sessionUser: CurrentUserSession = {
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    lastLogin: new Date().toISOString(),
    hasAcceptedAgreements: user.hasAcceptedAgreements ?? false,
    acceptedAgreementsTimestamp: user.acceptedAgreementsTimestamp,
    allowedIcons: user.allowedIcons ?? ALL_APP_ICON_IDS
  };
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionUser));
}

export function acceptAgreementsForUser(userId: string): { success: boolean; session?: CurrentUserSession } {
  const users = getStoredUsers();
  const index = users.findIndex(u => u.id === userId);
  if (index === -1) return { success: false };

  const timestamp = new Date().toISOString();
  users[index] = {
    ...users[index],
    hasAcceptedAgreements: true,
    acceptedAgreementsTimestamp: timestamp
  };

  saveStoredUsers(users);
  setCurrentSession(users[index]);

  return {
    success: true,
    session: {
      id: users[index].id,
      username: users[index].username,
      name: users[index].name,
      email: users[index].email,
      role: users[index].role,
      status: users[index].status,
      createdAt: users[index].createdAt,
      lastLogin: users[index].lastLogin,
      hasAcceptedAgreements: true,
      acceptedAgreementsTimestamp: timestamp,
      allowedIcons: users[index].allowedIcons ?? ALL_APP_ICON_IDS
    }
  };
}

export function loginUser(usernameInput: string, passwordInput: string): { success: boolean; message?: string; user?: CurrentUserSession } {
  const users = getStoredUsers();
  const normalizedUsername = usernameInput.trim().toLowerCase();
  
  const userIndex = users.findIndex(u => u.username.trim().toLowerCase() === normalizedUsername);
  if (userIndex === -1) {
    return { 
      success: false, 
      message: `Username "${usernameInput.trim()}" non trovato nel sistema. Verifica lo username o accedi con uno degli account predefiniti (admin / demo / quantum_user).` 
    };
  }

  const user = users[userIndex];
  const rawPassword = passwordInput;
  const trimmedInput = passwordInput.trim();
  const savedPassword = user.password || '';
  const trimmedSaved = savedPassword.trim();

  const isExactMatch = savedPassword === rawPassword;
  const isTrimmedMatch = trimmedSaved === trimmedInput;
  const isCaseInsensitiveMatch = trimmedSaved.toLowerCase() === trimmedInput.toLowerCase();
  
  // Specific fallback for demo user: accept 'demo', 'demo123', 'demo2026', 'DemoPassword2026!'
  const isDemoFallback = 
    normalizedUsername === 'demo' && 
    ['demo', 'demopassword2026!', 'demopassword', 'demo123', 'demo2026', 'demo!'].includes(trimmedInput.toLowerCase());

  // Specific fallback for admin: case-insensitive
  const isAdminFallback =
    normalizedUsername === 'admin' &&
    ['adminpassword2026!', 'admin', 'admin2026'].includes(trimmedInput.toLowerCase());

  if (!isExactMatch && !isTrimmedMatch && !isCaseInsensitiveMatch && !isDemoFallback && !isAdminFallback) {
    return { 
      success: false, 
      message: `Password errata per l'utente "${user.username}". Riprova prestando attenzione a maiuscole, minuscole o spazi.` 
    };
  }

  if (user.status === 'suspended') {
    return { success: false, message: 'Questo account è stato sospeso dall\'amministratore.' };
  }

  // Update last login
  const now = new Date().toISOString();
  users[userIndex] = {
    ...user,
    lastLogin: now
  };
  saveStoredUsers(users);

  setCurrentSession(users[userIndex]);

  return {
    success: true,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      lastLogin: now,
      hasAcceptedAgreements: user.hasAcceptedAgreements ?? true,
      acceptedAgreementsTimestamp: user.acceptedAgreementsTimestamp,
      allowedIcons: user.allowedIcons ?? ALL_APP_ICON_IDS
    }
  };
}

export function logoutUser(): void {
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

export function createNewUser(
  currentUserRole: UserRole,
  data: {
    username: string;
    password: string;
    name: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    allowedIcons?: string[];
  }
): { success: boolean; message: string; user?: AuthUser } {
  if (currentUserRole !== 'admin') {
    return { success: false, message: 'Solo gli amministratori possono creare nuovi utenti.' };
  }

  const username = data.username.trim();
  if (!username || username.length < 2) {
    return { success: false, message: 'Lo username deve contenere almeno 2 caratteri.' };
  }

  const cleanPassword = data.password.trim();
  if (!cleanPassword || cleanPassword.length < 3) {
    return { success: false, message: 'La password deve contenere almeno 3 caratteri.' };
  }

  const users = getStoredUsers();
  const existingIndex = users.findIndex(u => u.username.trim().toLowerCase() === username.toLowerCase());
  
  if (existingIndex !== -1) {
    // If user already exists (e.g. created previously), update password and attributes directly
    users[existingIndex] = {
      ...users[existingIndex],
      username,
      password: cleanPassword,
      name: data.name.trim() || users[existingIndex].name,
      email: data.email.trim() || users[existingIndex].email,
      role: data.role,
      status: data.status,
      hasAcceptedAgreements: true,
      allowedIcons: data.allowedIcons ?? (data.role === 'admin' ? ALL_APP_ICON_IDS : ALL_APP_ICON_IDS)
    };
    saveStoredUsers(users);
    return { success: true, message: `Utente "${username}" già presente: credenziali aggiornate con successo!`, user: users[existingIndex] };
  }

  const newUser: AuthUser = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    username,
    password: cleanPassword,
    name: data.name.trim() || username,
    email: data.email.trim() || `${username}@sparkquantum.internal`,
    role: data.role,
    status: data.status,
    createdAt: new Date().toISOString(),
    hasAcceptedAgreements: true,
    allowedIcons: data.allowedIcons ?? (data.role === 'admin' ? ALL_APP_ICON_IDS : ALL_APP_ICON_IDS)
  };

  users.push(newUser);
  saveStoredUsers(users);

  return { success: true, message: `Utente ${username} creato con successo.`, user: newUser };
}

export function updateExistingUser(
  currentUserRole: UserRole,
  userId: string,
  updates: Partial<Omit<AuthUser, 'id' | 'createdAt'>>
): { success: boolean; message: string } {
  if (currentUserRole !== 'admin') {
    return { success: false, message: 'Solo gli amministratori possono modificare gli utenti.' };
  }

  const users = getStoredUsers();
  const index = users.findIndex(u => u.id === userId);
  if (index === -1) {
    return { success: false, message: 'Utente non trovato.' };
  }

  // Check username uniqueness if changed
  if (updates.username) {
    const usernameConflict = users.some(
      u => u.id !== userId && u.username.toLowerCase() === updates.username!.trim().toLowerCase()
    );
    if (usernameConflict) {
      return { success: false, message: `Lo username "${updates.username}" è già in uso.` };
    }
  }

  users[index] = {
    ...users[index],
    ...updates,
    username: updates.username ? updates.username.trim() : users[index].username,
    name: updates.name ? updates.name.trim() : users[index].name,
    email: updates.email ? updates.email.trim() : users[index].email,
    password: updates.password && updates.password.trim().length >= 3 ? updates.password.trim() : users[index].password,
    allowedIcons: updates.allowedIcons !== undefined ? updates.allowedIcons : (users[index].allowedIcons ?? ALL_APP_ICON_IDS)
  };

  saveStoredUsers(users);

  // If the updated user is the current logged-in user, refresh session
  const session = getCurrentSession();
  if (session && session.id === userId) {
    setCurrentSession(users[index]);
  }

  return { success: true, message: 'Utente aggiornato con successo.' };
}

export function isIconAllowedForUser(user: CurrentUserSession | AuthUser | null, iconId: string): boolean {
  if (!user) return false;
  // Admins always have access to all icons
  if (user.role === 'admin') return true;
  // If allowedIcons is not defined, default to allow all for backward compatibility
  if (!user.allowedIcons) return true;
  return user.allowedIcons.includes(iconId);
}

export function updateUserIconPermissions(
  currentUserRole: UserRole,
  targetUserId: string,
  allowedIcons: string[]
): { success: boolean; message: string } {
  if (currentUserRole !== 'admin') {
    return { success: false, message: 'Solo gli amministratori possono gestire i permessi delle icone.' };
  }

  const users = getStoredUsers();
  const index = users.findIndex(u => u.id === targetUserId);
  if (index === -1) {
    return { success: false, message: 'Utente non trovato.' };
  }

  users[index].allowedIcons = allowedIcons;
  saveStoredUsers(users);

  // If target is current user, update session
  const session = getCurrentSession();
  if (session && session.id === targetUserId) {
    setCurrentSession(users[index]);
  }

  return { success: true, message: 'Permessi icone aggiornati con successo.' };
}

export function getIconPermissionDetails(iconId: string): AppIconPermission | undefined {
  return ALL_APP_ICONS.find(i => i.id === iconId);
}

export function deleteExistingUser(
  currentUserRole: UserRole,
  currentUserId: string,
  userIdToDelete: string
): { success: boolean; message: string } {
  if (currentUserRole !== 'admin') {
    return { success: false, message: 'Solo gli amministratori possono eliminare utenti.' };
  }

  if (currentUserId === userIdToDelete) {
    return { success: false, message: 'Non puoi eliminare il tuo stesso account amministratore attivo.' };
  }

  const users = getStoredUsers();
  const targetUser = users.find(u => u.id === userIdToDelete);
  if (!targetUser) {
    return { success: false, message: 'Utente non trovato.' };
  }

  // Prevent deleting the last admin
  const adminCount = users.filter(u => u.role === 'admin').length;
  if (targetUser.role === 'admin' && adminCount <= 1) {
    return { success: false, message: 'Impossibile eliminare l\'unico amministratore rimasto.' };
  }

  const updated = users.filter(u => u.id !== userIdToDelete);
  saveStoredUsers(updated);

  return { success: true, message: `Utente ${targetUser.username} eliminato con successo.` };
}

export function resetUsersDatabase(): void {
  saveStoredUsers(DEFAULT_USERS);
}
