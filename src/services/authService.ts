export type UserRole = 'admin' | 'user';
export type UserStatus = 'active' | 'suspended';

export interface AppIconPermission {
  id: string;
  name: string;
  category: 'core' | 'quantum' | 'security' | 'system';
  icon: string;
  description: string;
}

export interface AgentAiCategoryPermission {
  id: string;
  name: string;
  icon: string;
  scenarioCount: number;
  description: string;
}

export const ALL_AGENT_AI_CATEGORIES: AgentAiCategoryPermission[] = [
  {
    id: "Finanza e Mercati",
    name: "Finanza e Mercati",
    icon: "💼",
    scenarioCount: 26,
    description: "Hedging, QUBO, stima rischio Basel IV, pricing derivati, AML e scoring creditizio."
  },
  {
    id: "Logistica e Supply Chain",
    name: "Logistica e Supply Chain",
    icon: "🚚",
    scenarioCount: 18,
    description: "Vehicle routing (VRPTW), bin packing 3D, cross-docking, QML scarto fresco, markdown pricing e knapsack scaffale."
  },
  {
    id: "Energia e Utilities",
    name: "Energia e Utilities",
    icon: "⚡",
    scenarioCount: 12,
    description: "Unit commitment (OPF), posizionamento turbine eoliche, smart charging V2G e microgrid."
  },
  {
    id: "Chimica, Farmaceutica e Materiali",
    name: "Chimica, Farmaceutica e Materiali",
    icon: "🧪",
    scenarioCount: 15,
    description: "VQE per molecole complesse, drug screening enzimatico, superconduttori e folding peptidico."
  },
  {
    id: "Produzione e Manifattura",
    name: "Produzione e Manifattura",
    icon: "⚙️",
    scenarioCount: 9,
    description: "Job-shop scheduling CNC, cutting stock lamiere/vetro e bilanciamento linee robotizzate."
  },
  {
    id: "Sicurezza, Telecomunicazioni e Reti",
    name: "Sicurezza, Telecomunicazioni e Reti",
    icon: "🛡️",
    scenarioCount: 11,
    description: "Protocolli QKD, routing 5G/6G core, allocazione frequenze e crittografia post-quantum."
  },
  {
    id: "Sanità e Genomica",
    name: "Sanità e Genomica",
    icon: "🧬",
    scenarioCount: 22,
    description: "Screening Grover farmaci, radioterapia oncologica (IGRT), GWAS diagnostica e triage."
  }
];

export const ALL_AGENT_AI_CATEGORY_IDS: string[] = ALL_AGENT_AI_CATEGORIES.map(c => c.id);

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
  allowedAgentAiCategories?: string[]; // Array of allowed Agent AI category IDs
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
  allowedAgentAiCategories?: string[];
}

const USERS_STORAGE_KEY = 'spark_quantum_users_db_v1';
const SESSION_STORAGE_KEY = 'spark_quantum_auth_session_v1';

// =====================================================================
// TIMESTAMP COORDINATI PER SESSIONI DI AUDIT DETERMINISTICHE E COERENTI
// =====================================================================
// Riferimenti temporali reali:
// 1) Admin: sessione attiva OGGI (login 45 minuti fa, visualizzazione gestione utenti 35 min fa)
// 2) Demo: sessione di consultazione effettuata 14 GIORNI FA (2 settimane fa)
// 3) Quantum Analyst: sessione di analisi effettuata 30 GIORNI FA (1 mese fa)
const _BASE_SEED_TIME = Date.now();

// 1. ADMIN (Sessione di Oggi)
export const SEED_ADMIN_LOGIN_TIME = new Date(_BASE_SEED_TIME - 45 * 60 * 1000).toISOString();
export const SEED_ADMIN_VIEW_TIME = new Date(_BASE_SEED_TIME - 35 * 60 * 1000).toISOString();

// 2. DEMO (Sessione di 14 Giorni Fa - 2 Settimane Fa)
const DEMO_SESSION_OFFSET_MS = 14 * 86400 * 1000;
export const SEED_DEMO_LOGIN_TIME = new Date(_BASE_SEED_TIME - DEMO_SESSION_OFFSET_MS).toISOString();
export const SEED_DEMO_VIEW1_TIME = new Date(_BASE_SEED_TIME - DEMO_SESSION_OFFSET_MS + 3 * 60 * 1000).toISOString();
export const SEED_DEMO_VIEW2_TIME = new Date(_BASE_SEED_TIME - DEMO_SESSION_OFFSET_MS + 15 * 60 * 1000).toISOString();

// 3. ANALYST (Sessione di 30 Giorni Fa - 1 Mese Fa)
const ANALYST_SESSION_OFFSET_MS = 30 * 86400 * 1000;
export const SEED_ANALYST_LOGIN_TIME = new Date(_BASE_SEED_TIME - ANALYST_SESSION_OFFSET_MS).toISOString();
export const SEED_ANALYST_VIEW1_TIME = new Date(_BASE_SEED_TIME - ANALYST_SESSION_OFFSET_MS + 3 * 60 * 1000).toISOString();
export const SEED_ANALYST_ACTION_TIME = new Date(_BASE_SEED_TIME - ANALYST_SESSION_OFFSET_MS + 10 * 60 * 1000).toISOString();
export const SEED_ANALYST_DENIED_TIME = new Date(_BASE_SEED_TIME - ANALYST_SESSION_OFFSET_MS + 15 * 60 * 1000).toISOString();

export const DEFAULT_USERS: AuthUser[] = [
  {
    id: 'usr_admin_001',
    username: 'admin',
    password: 'AdminPassword2026!',
    name: 'Chief Security Officer (Admin)',
    email: 'admin@sparkquantum.internal',
    role: 'admin',
    status: 'active',
    createdAt: new Date(_BASE_SEED_TIME - 90 * 86400 * 1000).toISOString(),
    lastLogin: SEED_ADMIN_LOGIN_TIME,
    hasAcceptedAgreements: false,
    allowedIcons: ALL_APP_ICON_IDS,
    allowedAgentAiCategories: ALL_AGENT_AI_CATEGORY_IDS
  },
  {
    id: 'usr_demo_003',
    username: 'demo',
    password: 'DemoPassword2026!',
    name: 'Demo Account',
    email: 'demo@sparkquantum.internal',
    role: 'user',
    status: 'active',
    createdAt: new Date(_BASE_SEED_TIME - 60 * 86400 * 1000).toISOString(),
    lastLogin: SEED_DEMO_LOGIN_TIME,
    hasAcceptedAgreements: true,
    allowedIcons: ALL_APP_ICON_IDS,
    allowedAgentAiCategories: ALL_AGENT_AI_CATEGORY_IDS
  },
  {
    id: 'usr_user_002',
    username: 'quantum_user',
    password: 'UserPassword2026!',
    name: 'Quantum Risk Analyst (User)',
    email: 'analyst@sparkquantum.internal',
    role: 'user',
    status: 'active',
    createdAt: new Date(_BASE_SEED_TIME - 45 * 86400 * 1000).toISOString(),
    lastLogin: SEED_ANALYST_LOGIN_TIME,
    hasAcceptedAgreements: false,
    allowedIcons: ALL_APP_ICON_IDS,
    allowedAgentAiCategories: ALL_AGENT_AI_CATEGORY_IDS
  }
];

export function getStoredUsers(): AuthUser[] {
  try {
    reconcileAndSanitizeStorage();
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

    let needsSave = false;

    // Ensure backwards compatibility: populate allowedAgentAiCategories if not set yet
    for (const u of parsed) {
      if (u.allowedAgentAiCategories === undefined) {
        u.allowedAgentAiCategories = ALL_AGENT_AI_CATEGORY_IDS;
        needsSave = true;
      }
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
        createdAt: new Date(_BASE_SEED_TIME - 60 * 86400 * 1000).toISOString(),
        lastLogin: SEED_DEMO_LOGIN_TIME,
        hasAcceptedAgreements: true,
        allowedIcons: ALL_APP_ICON_IDS,
        allowedAgentAiCategories: ALL_AGENT_AI_CATEGORY_IDS
      });
      needsSave = true;
    }

    if (needsSave) {
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
    const session: CurrentUserSession = JSON.parse(raw);
    
    // Always synchronize session with freshest user record from USERS_STORAGE_KEY
    const users = getStoredUsers();
    const freshUser = users.find(u => 
      u.id === session.id || 
      (u.username && session.username && u.username.trim().toLowerCase() === session.username.trim().toLowerCase())
    );
    
    if (freshUser) {
      const updatedSession: CurrentUserSession = {
        ...session,
        id: freshUser.id,
        username: freshUser.username,
        name: freshUser.name,
        email: freshUser.email,
        role: freshUser.role,
        status: freshUser.status,
        hasAcceptedAgreements: freshUser.hasAcceptedAgreements ?? true,
        allowedIcons: freshUser.allowedIcons !== undefined 
          ? freshUser.allowedIcons 
          : (freshUser.role === 'admin' ? ALL_APP_ICON_IDS : []),
        allowedAgentAiCategories: freshUser.allowedAgentAiCategories !== undefined
          ? freshUser.allowedAgentAiCategories
          : (freshUser.role === 'admin' ? ALL_AGENT_AI_CATEGORY_IDS : [])
      };
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updatedSession));
      return updatedSession;
    }
    return session;
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
    allowedIcons: user.allowedIcons ?? ALL_APP_ICON_IDS,
    allowedAgentAiCategories: user.allowedAgentAiCategories ?? ALL_AGENT_AI_CATEGORY_IDS
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

  // Registra automaticamente il log di accesso per l'audit dell'amministratore
  logUserAccess({
    userId: user.id,
    username: user.username,
    userRole: user.role,
    type: 'login',
    actionName: 'Accesso al Portale (Login Riuscito)',
    viewDetail: `Accesso autorizzato alla piattaforma. Permessi attivi: ${user.role === 'admin' ? 'Amministratore Totale' : `${user.allowedIcons?.length ?? ALL_APP_ICON_IDS.length} Icone e ${user.allowedAgentAiCategories?.length ?? ALL_AGENT_AI_CATEGORY_IDS.length} Categorie AI`}`,
    targetId: 'auth_login',
    allowedIconsSnapshot: user.allowedIcons ?? (user.role === 'admin' ? ALL_APP_ICON_IDS : []),
    allowedCategoriesSnapshot: user.allowedAgentAiCategories ?? ALL_AGENT_AI_CATEGORY_IDS
  });

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
  const session = getCurrentSession();
  if (session) {
    logUserAccess({
      userId: session.id,
      username: session.username,
      userRole: session.role,
      type: 'logout',
      actionName: 'Disconnessione Utente (Logout)',
      viewDetail: 'Chiusura sessione di lavoro e disconnessione dalla piattaforma',
      targetId: 'auth_logout'
    });
  }
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
    allowedAgentAiCategories?: string[];
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
      allowedIcons: data.allowedIcons !== undefined
        ? data.allowedIcons
        : (data.role === 'admin' ? ALL_APP_ICON_IDS : []),
      allowedAgentAiCategories: data.allowedAgentAiCategories !== undefined
        ? data.allowedAgentAiCategories
        : (data.role === 'admin' ? ALL_AGENT_AI_CATEGORY_IDS : ALL_AGENT_AI_CATEGORY_IDS)
    };
    saveStoredUsers(users);

    // If active session belongs to this user, update active session immediately
    const session = getCurrentSession();
    if (session && (session.id === users[existingIndex].id || session.username.trim().toLowerCase() === username.toLowerCase())) {
      setCurrentSession(users[existingIndex]);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('quantum_user_permissions_updated', { detail: { username } }));
    }

    return { success: true, message: `Utente "${username}" già presente: credenziali e permessi aggiornati con successo!`, user: users[existingIndex] };
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
    allowedIcons: data.allowedIcons !== undefined
      ? data.allowedIcons
      : (data.role === 'admin' ? ALL_APP_ICON_IDS : []),
    allowedAgentAiCategories: data.allowedAgentAiCategories !== undefined
      ? data.allowedAgentAiCategories
      : (data.role === 'admin' ? ALL_AGENT_AI_CATEGORY_IDS : ALL_AGENT_AI_CATEGORY_IDS)
  };

  users.push(newUser);
  saveStoredUsers(users);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('quantum_user_permissions_updated', { detail: { username } }));
  }

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

  const newRole = updates.role ?? users[index].role;
  users[index] = {
    ...users[index],
    ...updates,
    username: updates.username ? updates.username.trim() : users[index].username,
    name: updates.name ? updates.name.trim() : users[index].name,
    email: updates.email ? updates.email.trim() : users[index].email,
    password: updates.password && updates.password.trim().length >= 3 ? updates.password.trim() : users[index].password,
    allowedIcons: updates.allowedIcons !== undefined
      ? updates.allowedIcons
      : (users[index].allowedIcons !== undefined ? users[index].allowedIcons : (newRole === 'admin' ? ALL_APP_ICON_IDS : [])),
    allowedAgentAiCategories: updates.allowedAgentAiCategories !== undefined
      ? updates.allowedAgentAiCategories
      : (users[index].allowedAgentAiCategories !== undefined ? users[index].allowedAgentAiCategories : (newRole === 'admin' ? ALL_AGENT_AI_CATEGORY_IDS : ALL_AGENT_AI_CATEGORY_IDS))
  };

  saveStoredUsers(users);

  // If the updated user is the current logged-in user, refresh session
  const session = getCurrentSession();
  if (session && (session.id === userId || session.username.trim().toLowerCase() === users[index].username.trim().toLowerCase())) {
    setCurrentSession(users[index]);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('quantum_user_permissions_updated', { detail: { username: users[index].username } }));
  }

  return { success: true, message: 'Utente aggiornato con successo.' };
}

export function isIconAllowedForUser(user: CurrentUserSession | AuthUser | null, iconId: string): boolean {
  if (!user) return false;
  // Admins always have access to all icons
  if (user.role === 'admin') return true;

  // Always consult stored users to get the live, updated permissions
  try {
    const storedUsers = getStoredUsers();
    const freshUser = storedUsers.find(
      u => u.id === user.id || (u.username && user.username && u.username.trim().toLowerCase() === user.username.trim().toLowerCase())
    );
    if (freshUser) {
      if (freshUser.role === 'admin') return true;
      if (freshUser.allowedIcons !== undefined) {
        const allowed = freshUser.allowedIcons;
        if (allowed.includes(iconId)) return true;
        if (['pqc_locker', 'pqc_keygen', 'pqc_chat'].includes(iconId)) {
          return allowed.includes('pqc_group');
        }
        return false;
      }
    }
  } catch {
    // fallback to provided user object
  }

  // If allowedIcons is not defined on user, default to false (restrict by default)
  if (!user.allowedIcons || !Array.isArray(user.allowedIcons)) return false;
  if (user.allowedIcons.includes(iconId)) return true;
  if (['pqc_locker', 'pqc_keygen', 'pqc_chat'].includes(iconId)) {
    return user.allowedIcons.includes('pqc_group');
  }
  return false;
}

export function isAgentAiCategoryAllowedForUser(
  user: CurrentUserSession | AuthUser | null, 
  categoryId: string
): boolean {
  if (!user) return false;
  // Admins always have access to all Agent AI categories
  if (user.role === 'admin') return true;

  // Always consult stored users to get the live, updated permissions
  try {
    const storedUsers = getStoredUsers();
    const freshUser = storedUsers.find(
      u => u.id === user.id || (u.username && user.username && u.username.trim().toLowerCase() === user.username.trim().toLowerCase())
    );
    if (freshUser) {
      if (freshUser.role === 'admin') return true;
      if (freshUser.allowedAgentAiCategories !== undefined) {
        return freshUser.allowedAgentAiCategories.includes(categoryId);
      }
    }
  } catch {
    // fallback to provided user object
  }

  if (!user.allowedAgentAiCategories || !Array.isArray(user.allowedAgentAiCategories)) return false;
  return user.allowedAgentAiCategories.includes(categoryId);
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

  // If target is current user or session matches username, update session
  const session = getCurrentSession();
  if (session && (session.id === targetUserId || (session.username && users[index].username && session.username.trim().toLowerCase() === users[index].username.trim().toLowerCase()))) {
    setCurrentSession(users[index]);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('quantum_user_permissions_updated', { detail: { username: users[index].username } }));
  }

  return { success: true, message: 'Permessi icone aggiornati con successo.' };
}

export function updateUserAgentAiCategoryPermissions(
  currentUserRole: UserRole,
  targetUserId: string,
  allowedCategories: string[]
): { success: boolean; message: string } {
  if (currentUserRole !== 'admin') {
    return { success: false, message: 'Solo gli amministratori possono gestire i permessi delle categorie.' };
  }

  const users = getStoredUsers();
  const index = users.findIndex(u => u.id === targetUserId);
  if (index === -1) {
    return { success: false, message: 'Utente non trovato.' };
  }

  users[index].allowedAgentAiCategories = allowedCategories;
  saveStoredUsers(users);

  // If target is current user or session matches username, update session
  const session = getCurrentSession();
  if (session && (session.id === targetUserId || (session.username && users[index].username && session.username.trim().toLowerCase() === users[index].username.trim().toLowerCase()))) {
    setCurrentSession(users[index]);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('quantum_user_permissions_updated', { detail: { username: users[index].username } }));
  }

  return { success: true, message: 'Permessi categorie Agent AI aggiornati con successo.' };
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

// =====================================================================
// REGISTRO LOG ACCESSI ED AUDIT ATTIVITÀ ("COSA VEDE OGNI UTENTE")
// =====================================================================

export type AccessLogType = 'login' | 'logout' | 'view_page' | 'action' | 'access_denied';

export interface UserAccessLog {
  id: string;
  userId: string;
  username: string;
  userRole: UserRole;
  timestamp: string; // ISO String
  type: AccessLogType;
  actionName: string;
  viewDetail: string; // Descrizione parlante di cosa vede l'utente
  targetId?: string; // id modulo/icona/categoria
  ipAddress?: string;
  deviceInfo?: string;
  allowedIconsSnapshot?: string[];
  allowedCategoriesSnapshot?: string[];
  metadata?: Record<string, any>;
}

const ACCESS_LOGS_STORAGE_KEY = 'spark_quantum_user_access_logs_v1';

export const SEED_ACCESS_LOGS: UserAccessLog[] = [
  // Sessione Admin (oggi - 35 minuti fa)
  {
    id: 'log_seed_001',
    userId: 'usr_admin_001',
    username: 'admin',
    userRole: 'admin',
    timestamp: SEED_ADMIN_LOGIN_TIME,
    type: 'login',
    actionName: 'Accesso al Portale (Login Riuscito)',
    viewDetail: 'Autenticazione amministrativa con visibilità completa su tutti i moduli e 108 scenari',
    targetId: 'auth_login',
    ipAddress: '192.168.1.10 (Rete Sicura)',
    deviceInfo: 'Console Admin • Chrome / Desktop',
    allowedIconsSnapshot: ALL_APP_ICON_IDS,
    allowedCategoriesSnapshot: ALL_AGENT_AI_CATEGORY_IDS
  },
  {
    id: 'log_seed_002',
    userId: 'usr_admin_001',
    username: 'admin',
    userRole: 'admin',
    timestamp: SEED_ADMIN_VIEW_TIME,
    type: 'view_page',
    actionName: 'Visualizzazione Console Gestione Utenti',
    viewDetail: 'Pannello di controllo utenti, ruoli RBAC e permessi granulari',
    targetId: 'user_management',
    ipAddress: '192.168.1.10 (Rete Sicura)',
    deviceInfo: 'Console Admin • Chrome / Desktop'
  },
  // Sessione Demo (oggi - 3 ore fa)
  {
    id: 'log_seed_003',
    userId: 'usr_demo_003',
    username: 'demo',
    userRole: 'user',
    timestamp: SEED_DEMO_LOGIN_TIME,
    type: 'login',
    actionName: 'Accesso al Portale (Login Riuscito)',
    viewDetail: 'Accesso utente demo con permessi di consultazione standard',
    targetId: 'auth_login',
    ipAddress: '10.0.4.88 (VPN Ospite)',
    deviceInfo: 'Sessione Utente • Firefox / Desktop',
    allowedIconsSnapshot: ALL_APP_ICON_IDS,
    allowedCategoriesSnapshot: ALL_AGENT_AI_CATEGORY_IDS
  },
  {
    id: 'log_seed_004',
    userId: 'usr_demo_003',
    username: 'demo',
    userRole: 'user',
    timestamp: SEED_DEMO_VIEW1_TIME,
    type: 'view_page',
    actionName: 'Visualizzazione Medical Screening',
    viewDetail: 'Pagina Salute - Screening Predittivo Multi-Organo, Scanner Olografico & Effetto Domino',
    targetId: 'medical_screening',
    ipAddress: '10.0.4.88 (VPN Ospite)',
    deviceInfo: 'Sessione Utente • Firefox / Desktop'
  },
  {
    id: 'log_seed_005',
    userId: 'usr_demo_003',
    username: 'demo',
    userRole: 'user',
    timestamp: SEED_DEMO_VIEW2_TIME,
    type: 'view_page',
    actionName: 'Visualizzazione Mappa Reazioni a Catena',
    viewDetail: 'Apertura dettaglio Effetto Domino: 18 Quadranti Fisiopatologici e Sequenza a 3 Passi',
    targetId: 'domino_map',
    ipAddress: '10.0.4.88 (VPN Ospite)',
    deviceInfo: 'Sessione Utente • Firefox / Desktop'
  },
  // Sessione Analyst (ieri - 25 ore fa)
  {
    id: 'log_seed_006',
    userId: 'usr_user_002',
    username: 'quantum_user',
    userRole: 'user',
    timestamp: SEED_ANALYST_LOGIN_TIME,
    type: 'login',
    actionName: 'Accesso al Portale (Login Riuscito)',
    viewDetail: 'Accesso Quantum Risk Analyst',
    targetId: 'auth_login',
    ipAddress: '172.16.20.15 (LAN Ricerca)',
    deviceInfo: 'Workstation Analisi • Safari / Mac',
    allowedIconsSnapshot: ALL_APP_ICON_IDS,
    allowedCategoriesSnapshot: ALL_AGENT_AI_CATEGORY_IDS
  },
  {
    id: 'log_seed_007',
    userId: 'usr_user_002',
    username: 'quantum_user',
    userRole: 'user',
    timestamp: SEED_ANALYST_VIEW1_TIME,
    type: 'view_page',
    actionName: 'Visualizzazione Agent AI (Finanza e Mercati)',
    viewDetail: 'Modulo Quantistico: Calcolo Probabilità di Default su Mutui Subprime (Strategia Prudente)',
    targetId: 'agent_ai_finanza',
    ipAddress: '172.16.20.15 (LAN Ricerca)',
    deviceInfo: 'Workstation Analisi • Safari / Mac'
  },
  {
    id: 'log_seed_008',
    userId: 'usr_user_002',
    username: 'quantum_user',
    userRole: 'user',
    timestamp: SEED_ANALYST_ACTION_TIME,
    type: 'action',
    actionName: 'Compilazione Circuito Quantistico Qiskit',
    viewDetail: 'Generazione codice Qiskit 1.x con 4 Qubit, rotazioni Ry pure e Sfera di Bloch pre-entanglement',
    targetId: 'qiskit_compilation',
    ipAddress: '172.16.20.15 (LAN Ricerca)',
    deviceInfo: 'Workstation Analisi • Safari / Mac'
  },
  {
    id: 'log_seed_009',
    userId: 'usr_user_002',
    username: 'quantum_user',
    userRole: 'user',
    timestamp: SEED_ANALYST_DENIED_TIME,
    type: 'access_denied',
    actionName: 'Tentativo di Accesso Bloccato (Permesso Mancante)',
    viewDetail: 'Tentativo bloccato su: Configurazione Google API Key (Modulo riservato ad Amministratori)',
    targetId: 'api_key',
    ipAddress: '172.16.20.15 (LAN Ricerca)',
    deviceInfo: 'Workstation Analisi • Safari / Mac'
  }
];

const ACCESS_LOGS_SYNC_KEY = 'spark_quantum_logs_synced_v5';

export function reconcileAndSanitizeStorage(): void {
  try {
    const rawLogs = localStorage.getItem(ACCESS_LOGS_STORAGE_KEY);
    const rawUsers = localStorage.getItem(USERS_STORAGE_KEY);

    let logs: UserAccessLog[] = rawLogs ? JSON.parse(rawLogs) : [...SEED_ACCESS_LOGS];
    if (!Array.isArray(logs) || logs.length === 0) logs = [...SEED_ACCESS_LOGS];

    let users: AuthUser[] = rawUsers ? JSON.parse(rawUsers) : [...DEFAULT_USERS];
    if (!Array.isArray(users) || users.length === 0) users = [...DEFAULT_USERS];

    let logsChanged = false;
    let usersChanged = false;

    // Riallinea i seed log storici affinché ogni utente abbia i suoi log esattamente nella sessione di accesso
    logs = logs.map(l => {
      // Demo (14 giorni fa - 2 settimane fa)
      if (l.id === 'log_seed_003' && l.timestamp !== SEED_DEMO_LOGIN_TIME) { logsChanged = true; return { ...l, timestamp: SEED_DEMO_LOGIN_TIME }; }
      if (l.id === 'log_seed_004' && l.timestamp !== SEED_DEMO_VIEW1_TIME) { logsChanged = true; return { ...l, timestamp: SEED_DEMO_VIEW1_TIME }; }
      if (l.id === 'log_seed_005' && l.timestamp !== SEED_DEMO_VIEW2_TIME) { logsChanged = true; return { ...l, timestamp: SEED_DEMO_VIEW2_TIME }; }
      // Analyst (30 giorni fa - 1 mese fa)
      if (l.id === 'log_seed_006' && l.timestamp !== SEED_ANALYST_LOGIN_TIME) { logsChanged = true; return { ...l, timestamp: SEED_ANALYST_LOGIN_TIME }; }
      if (l.id === 'log_seed_007' && l.timestamp !== SEED_ANALYST_VIEW1_TIME) { logsChanged = true; return { ...l, timestamp: SEED_ANALYST_VIEW1_TIME }; }
      if (l.id === 'log_seed_008' && l.timestamp !== SEED_ANALYST_ACTION_TIME) { logsChanged = true; return { ...l, timestamp: SEED_ANALYST_ACTION_TIME }; }
      if (l.id === 'log_seed_009' && l.timestamp !== SEED_ANALYST_DENIED_TIME) { logsChanged = true; return { ...l, timestamp: SEED_ANALYST_DENIED_TIME }; }
      // Admin (oggi)
      if (l.id === 'log_seed_001' && l.timestamp !== SEED_ADMIN_LOGIN_TIME) { logsChanged = true; return { ...l, timestamp: SEED_ADMIN_LOGIN_TIME }; }
      if (l.id === 'log_seed_002' && l.timestamp !== SEED_ADMIN_VIEW_TIME) { logsChanged = true; return { ...l, timestamp: SEED_ADMIN_VIEW_TIME }; }
      return l;
    });

    // Controllo coerenza per ciascun utente in users
    for (const u of users) {
      if (u.id === 'usr_demo_003') {
        const manualRecentLogin = logs.find(l => l.userId === u.id && !l.id.startsWith('log_seed_') && l.type === 'login' && (Date.now() - new Date(l.timestamp).getTime()) < 86400000);
        if (manualRecentLogin) {
          if (u.lastLogin !== manualRecentLogin.timestamp) {
            u.lastLogin = manualRecentLogin.timestamp;
            usersChanged = true;
          }
        } else if (u.lastLogin !== SEED_DEMO_LOGIN_TIME) {
          u.lastLogin = SEED_DEMO_LOGIN_TIME;
          usersChanged = true;
        }
      } else if (u.id === 'usr_user_002') {
        const manualRecentLogin = logs.find(l => l.userId === u.id && !l.id.startsWith('log_seed_') && l.type === 'login' && (Date.now() - new Date(l.timestamp).getTime()) < 86400000);
        if (manualRecentLogin) {
          if (u.lastLogin !== manualRecentLogin.timestamp) {
            u.lastLogin = manualRecentLogin.timestamp;
            usersChanged = true;
          }
        } else if (u.lastLogin !== SEED_ANALYST_LOGIN_TIME) {
          u.lastLogin = SEED_ANALYST_LOGIN_TIME;
          usersChanged = true;
        }
      } else if (u.id === 'usr_admin_001') {
        if (!u.lastLogin || u.lastLogin.includes('2026-08-18')) {
          u.lastLogin = SEED_ADMIN_LOGIN_TIME;
          usersChanged = true;
        }
      } else {
        const userLogs = logs.filter(l => l.userId === u.id);
        if (userLogs.length > 0) {
          const userLogin = userLogs.find(l => l.type === 'login');
          if (userLogin && u.lastLogin !== userLogin.timestamp) {
            u.lastLogin = userLogin.timestamp;
            usersChanged = true;
          }
        }
      }
    }

    // Assicura l'ordinamento decrescente cronologico per tutti i log
    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    if (logsChanged || !rawLogs) {
      localStorage.setItem(ACCESS_LOGS_STORAGE_KEY, JSON.stringify(logs));
    }
    if (usersChanged || !rawUsers) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    }
    localStorage.setItem(ACCESS_LOGS_SYNC_KEY, 'true');
  } catch (e) {
    console.error("Errore reconcileAndSanitizeStorage:", e);
  }
}

export function getStoredUserAccessLogs(): UserAccessLog[] {
  try {
    reconcileAndSanitizeStorage();
    const raw = localStorage.getItem(ACCESS_LOGS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ACCESS_LOGS_STORAGE_KEY, JSON.stringify(SEED_ACCESS_LOGS));
      return SEED_ACCESS_LOGS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(ACCESS_LOGS_STORAGE_KEY, JSON.stringify(SEED_ACCESS_LOGS));
      return SEED_ACCESS_LOGS;
    }
    // Ordina sempre rigorosamente decrescente (più recente in cima)
    return parsed.sort((a: UserAccessLog, b: UserAccessLog) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch {
    return SEED_ACCESS_LOGS;
  }
}

export function saveStoredUserAccessLogs(logs: UserAccessLog[]): void {
  try {
    // Conserva fino a un massimo di 500 log per sicurezza e performance
    const capped = logs.slice(0, 500);
    localStorage.setItem(ACCESS_LOGS_STORAGE_KEY, JSON.stringify(capped));
  } catch (e) {
    console.error("Errore salvataggio log accessi:", e);
  }
}

export function logUserAccess(entry: Omit<UserAccessLog, 'id' | 'timestamp'>): UserAccessLog {
  const currentLogs = getStoredUserAccessLogs();
  const nowIso = new Date().toISOString();
  const newLog: UserAccessLog = {
    ...entry,
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    timestamp: nowIso,
    ipAddress: entry.ipAddress || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? '127.0.0.1 (Locale)' : 'Client Web Autenticato'),
    deviceInfo: entry.deviceInfo || (typeof navigator !== 'undefined' ? `${navigator.userAgent.slice(0, 45)}...` : 'Browser Web')
  };

  const updatedLogs = [newLog, ...currentLogs];
  saveStoredUserAccessLogs(updatedLogs);

  // Sincronizza lo stato utente per garantire che lastLogin rispecchi la sessione
  try {
    const rawUsers = localStorage.getItem(USERS_STORAGE_KEY);
    if (rawUsers) {
      const users: AuthUser[] = JSON.parse(rawUsers);
      const uIdx = users.findIndex(u => u.id === entry.userId);
      if (uIdx !== -1) {
        if (entry.type === 'login' || !users[uIdx].lastLogin) {
          users[uIdx].lastLogin = nowIso;
          localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
        }
      }
    }
  } catch (e) {
    // ignore
  }

  return newLog;
}

export function getUserAccessLogs(userId?: string): UserAccessLog[] {
  const allLogs = getStoredUserAccessLogs();
  if (!userId || userId === 'all') {
    return allLogs;
  }
  return allLogs.filter(log => log.userId === userId);
}

export function clearUserAccessLogs(userId?: string): void {
  if (!userId || userId === 'all') {
    saveStoredUserAccessLogs([]);
  } else {
    const current = getStoredUserAccessLogs();
    const filtered = current.filter(l => l.userId !== userId);
    saveStoredUserAccessLogs(filtered);
  }
}

export function resetDefaultAccessLogs(): void {
  saveStoredUserAccessLogs(SEED_ACCESS_LOGS);
  // Sincronizza anche il campo lastLogin degli utenti predefiniti
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (raw) {
      const users: AuthUser[] = JSON.parse(raw);
      for (const u of users) {
        if (u.id === 'usr_admin_001') u.lastLogin = SEED_ADMIN_LOGIN_TIME;
        if (u.id === 'usr_demo_003') u.lastLogin = SEED_DEMO_LOGIN_TIME;
        if (u.id === 'usr_user_002') u.lastLogin = SEED_ANALYST_LOGIN_TIME;
      }
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    }
  } catch (e) {
    // ignore
  }
}

export function exportUserAccessLogsAsJson(userId?: string): string {
  const logs = getUserAccessLogs(userId);
  return JSON.stringify(logs, null, 2);
}

export function exportUserAccessLogsAsCsv(userId?: string): string {
  const logs = getUserAccessLogs(userId);
  const headers = ['Data_Ora_ISO', 'Data_Ora_Formattata', 'ID_Utente', 'Username', 'Ruolo', 'Tipo_Evento', 'Azione_Effettuata', 'Cosa_Vede_Nell_App', 'Target_ID', 'IP_Dispositivo'];
  
  const rows = logs.map(l => {
    const d = new Date(l.timestamp);
    const formattedDate = `${d.toLocaleDateString('it-IT')} ${d.toLocaleTimeString('it-IT')}`;
    return [
      `"${l.timestamp}"`,
      `"${formattedDate}"`,
      `"${l.userId}"`,
      `"${l.username}"`,
      `"${l.userRole}"`,
      `"${l.type}"`,
      `"${(l.actionName || '').replace(/"/g, '""')}"`,
      `"${(l.viewDetail || '').replace(/"/g, '""')}"`,
      `"${l.targetId || ''}"`,
      `"${l.ipAddress || ''}"`
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

