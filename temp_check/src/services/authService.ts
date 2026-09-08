export type UserRole = 'admin' | 'user';
export type UserStatus = 'active' | 'suspended';

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
    hasAcceptedAgreements: false
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
    hasAcceptedAgreements: false
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
    acceptedAgreementsTimestamp: user.acceptedAgreementsTimestamp
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
      acceptedAgreementsTimestamp: timestamp
    }
  };
}

export function loginUser(usernameInput: string, passwordInput: string): { success: boolean; message?: string; user?: CurrentUserSession } {
  const users = getStoredUsers();
  const normalizedUsername = usernameInput.trim().toLowerCase();
  
  const userIndex = users.findIndex(u => u.username.toLowerCase() === normalizedUsername);
  if (userIndex === -1) {
    return { success: false, message: 'Username non trovato nel sistema.' };
  }

  const user = users[userIndex];

  if (user.password !== passwordInput) {
    return { success: false, message: 'Password errata. Riprova.' };
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
      hasAcceptedAgreements: user.hasAcceptedAgreements ?? false,
      acceptedAgreementsTimestamp: user.acceptedAgreementsTimestamp
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
  }
): { success: boolean; message: string; user?: AuthUser } {
  if (currentUserRole !== 'admin') {
    return { success: false, message: 'Solo gli amministratori possono creare nuovi utenti.' };
  }

  const username = data.username.trim();
  if (!username || username.length < 3) {
    return { success: false, message: 'Lo username deve contenere almeno 3 caratteri.' };
  }

  if (!data.password || data.password.length < 6) {
    return { success: false, message: 'La password deve contenere almeno 6 caratteri.' };
  }

  const users = getStoredUsers();
  const exists = users.some(u => u.username.toLowerCase() === username.toLowerCase());
  if (exists) {
    return { success: false, message: `Lo username "${username}" è già utilizzato.` };
  }

  const newUser: AuthUser = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    username,
    password: data.password,
    name: data.name.trim() || username,
    email: data.email.trim() || `${username}@sparkquantum.internal`,
    role: data.role,
    status: data.status,
    createdAt: new Date().toISOString()
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
    password: updates.password ? updates.password : users[index].password
  };

  saveStoredUsers(users);

  // If the updated user is the current logged-in user, refresh session
  const session = getCurrentSession();
  if (session && session.id === userId) {
    setCurrentSession(users[index]);
  }

  return { success: true, message: 'Utente aggiornato con successo.' };
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
