import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Users, UserPlus, UserCheck, UserX, Shield, Edit3, Trash2, Key, 
  Search, Check, AlertCircle, RefreshCw, Lock, Mail, User, ShieldAlert,
  RotateCcw, Download, Sparkles, Sliders, CheckSquare, Square,
  Cpu, Terminal, Languages, Code2, HelpCircle, Eye, EyeOff, Copy,
  History, Clock, FileText, Activity, LogIn, LogOut, Globe, Monitor, Laptop,
  Filter, ChevronRight, Info, AlertTriangle, Layers, Calendar, ExternalLink, CheckCircle
} from 'lucide-react';
import { 
  AuthUser, 
  CurrentUserSession, 
  UserRole, 
  UserStatus, 
  getStoredUsers, 
  createNewUser, 
  updateExistingUser, 
  deleteExistingUser,
  resetUsersDatabase,
  ALL_APP_ICONS,
  ALL_APP_ICON_IDS,
  updateUserIconPermissions,
  AppIconPermission,
  ALL_AGENT_AI_CATEGORIES,
  ALL_AGENT_AI_CATEGORY_IDS,
  updateUserAgentAiCategoryPermissions,
  AgentAiCategoryPermission,
  UserAccessLog,
  AccessLogType,
  getStoredUserAccessLogs,
  getUserAccessLogs,
  clearUserAccessLogs,
  resetDefaultAccessLogs,
  exportUserAccessLogsAsJson,
  exportUserAccessLogsAsCsv,
  logUserAccess
} from '../services/authService';

const PERMISSION_ICON_MAP: Record<string, React.ElementType> = {
  Cpu,
  Terminal,
  Languages,
  Code2,
  ShieldCheck: Shield,
  Lock,
  Sparkles,
  HelpCircle,
  Key
};

interface AdminUserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: CurrentUserSession;
  onSessionUpdated?: (user: CurrentUserSession) => void;
}

export default function AdminUserManagementModal({
  isOpen,
  onClose,
  currentUser,
  onSessionUpdated
}: AdminUserManagementModalProps) {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');

  // Modal forms
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AuthUser | null>(null);

  // Permissions management state (Icons & Agents AI Categories)
  const [managingIconsUser, setManagingIconsUser] = useState<AuthUser | null>(null);
  const [permissionsActiveTab, setPermissionsActiveTab] = useState<'icons' | 'agent_ai'>('icons');
  const [userSelectedIcons, setUserSelectedIcons] = useState<string[]>([]);
  const [userSelectedCategories, setUserSelectedCategories] = useState<string[]>(ALL_AGENT_AI_CATEGORY_IDS);
  const [newAllowedIcons, setNewAllowedIcons] = useState<string[]>(ALL_APP_ICON_IDS);
  const [newAllowedCategories, setNewAllowedCategories] = useState<string[]>(ALL_AGENT_AI_CATEGORY_IDS);
  const [editAllowedIcons, setEditAllowedIcons] = useState<string[]>(ALL_APP_ICON_IDS);
  const [editAllowedCategories, setEditAllowedCategories] = useState<string[]>(ALL_AGENT_AI_CATEGORY_IDS);

  // Form states (Add user)
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('user');
  const [newStatus, setNewStatus] = useState<UserStatus>('active');

  // Form states (Edit user)
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('user');
  const [editStatus, setEditStatus] = useState<UserStatus>('active');

  // Password visibility & clipboard states
  const [showAddPassword, setShowAddPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedPasswordUserId, setCopiedPasswordUserId] = useState<string | null>(null);

  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswords(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  const handleCopyPassword = (user: AuthUser) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(user.password);
      setCopiedPasswordUserId(user.id);
      showToast('success', `Password dell'utente "${user.username}" copiata negli appunti.`);
      setTimeout(() => {
        setCopiedPasswordUserId(null);
      }, 2000);
    }
  };

  // Toasts / Feedback
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Main Tab Navigation: 'users' vs 'logs'
  const [mainActiveTab, setMainActiveTab] = useState<'users' | 'logs'>('users');

  // Access Logs State (Gruppo 1: Utenti, Gruppo 2: Cose Viste & Log)
  const [accessLogs, setAccessLogs] = useState<UserAccessLog[]>([]);
  const [selectedLogUserId, setSelectedLogUserId] = useState<string>('all');
  const [logTypeFilter, setLogTypeFilter] = useState<'all' | 'login_logout' | AccessLogType>('all');
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [logUsersSearchQuery, setLogUsersSearchQuery] = useState('');
  const [logViewMode, setLogViewMode] = useState<'timeline' | 'sections'>('timeline');
  const [mobileGroupTab, setMobileGroupTab] = useState<'users' | 'logs'>('users');
  const [inspectingLog, setInspectingLog] = useState<UserAccessLog | null>(null);
  const [copiedLogJsonId, setCopiedLogJsonId] = useState<string | null>(null);

  const loadUsers = () => {
    setUsers(getStoredUsers());
  };

  const loadLogs = () => {
    setAccessLogs(getStoredUserAccessLogs());
  };

  useEffect(() => {
    if (isOpen) {
      loadUsers();
      loadLogs();
    }
  }, [isOpen]);

  const userLogCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const log of accessLogs) {
      counts[log.userId] = (counts[log.userId] || 0) + 1;
    }
    return counts;
  }, [accessLogs]);

  const formatLogTimestamp = (isoString: string): { formatted: string; relative: string } => {
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return { formatted: isoString, relative: '' };
      
      const formatted = `${date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })} ${date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
      
      const diffMs = Math.max(0, Date.now() - date.getTime());
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHours = Math.floor(diffMin / 60);
      const diffDays = Math.floor(diffHours / 24);

      let relative = '';
      if (diffSec < 30) relative = 'Pochi secondi fa';
      else if (diffSec < 60) relative = `${diffSec}s fa`;
      else if (diffMin < 60) relative = `${diffMin}m fa`;
      else if (diffHours < 24) relative = `${diffHours}h fa (Oggi)`;
      else if (diffDays === 1) relative = 'Ieri';
      else if (diffDays < 7) relative = `${diffDays} giorni fa`;
      else if (diffDays >= 7 && diffDays < 14) relative = '1 settimana fa';
      else if (diffDays >= 14 && diffDays < 21) relative = '2 settimane fa';
      else if (diffDays >= 21 && diffDays < 28) relative = '3 settimane fa';
      else if (diffDays >= 28 && diffDays < 45) relative = '1 mese fa';
      else {
        const diffMonths = Math.floor(diffDays / 30);
        relative = `${diffMonths} mesi fa`;
      }

      return { formatted, relative };
    } catch {
      return { formatted: isoString, relative: '' };
    }
  };

  // Calcolo coerente e sincronizzato delle date di accesso e attività dell'utente
  // Garantisce che il Gruppo 1 e il Gruppo 2 mostrino date armonizzate e reali
  const getUserAccessMeta = (targetUser: AuthUser) => {
    // Filtra e ordina i log dell'utente rigorosamente in ordine decrescente (dal più recente in testa)
    const uLogs = accessLogs
      .filter(l => l.userId === targetUser.id)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const latestLogin = uLogs.find(l => l.type === 'login');
    const latestActivity = uLogs[0]; // L'evento più recente in assoluto (view_page, action, login o denied)

    // L'accesso reale (login):
    // 1) Se c'è un evento di login registrato nei log dell'utente, quello è il timestamp ufficiale di accesso
    // 2) Altrimenti se l'utente ha targetUser.lastLogin (e non è un vecchio mock residuo), usa quello
    // 3) Se non c'è login esplicito, l'accesso coincide con la sessione dell'attività
    let effectiveLoginIso = targetUser.lastLogin;
    if (latestLogin) {
      effectiveLoginIso = latestLogin.timestamp;
    } else if (!effectiveLoginIso || effectiveLoginIso.includes('2026-08-18')) {
      effectiveLoginIso = latestActivity?.timestamp;
    }

    // L'ultima attività registrata (cosa ha visto o fatto per ultimo)
    const effectiveActivityIso = latestActivity?.timestamp || effectiveLoginIso;

    return {
      loginFormatted: effectiveLoginIso ? formatLogTimestamp(effectiveLoginIso) : null,
      activityFormatted: effectiveActivityIso ? formatLogTimestamp(effectiveActivityIso) : null,
      latestLog: latestActivity,
      latestLoginLog: latestLogin,
      userLogsCount: uLogs.length,
      effectiveLoginIso,
      effectiveActivityIso
    };
  };

  const filteredLogs = useMemo(() => {
    return accessLogs.filter(log => {
      // User filter
      if (selectedLogUserId !== 'all' && log.userId !== selectedLogUserId) {
        return false;
      }

      // Event type filter
      if (logTypeFilter === 'login_logout') {
        if (log.type !== 'login' && log.type !== 'logout') return false;
      } else if (logTypeFilter !== 'all') {
        if (log.type !== logTypeFilter) return false;
      }

      // Search query
      if (logSearchQuery.trim()) {
        const q = logSearchQuery.toLowerCase();
        const matchAction = (log.actionName || '').toLowerCase().includes(q);
        const matchDetail = (log.viewDetail || '').toLowerCase().includes(q);
        const matchUser = (log.username || '').toLowerCase().includes(q);
        const matchTarget = (log.targetId || '').toLowerCase().includes(q);
        const matchIp = (log.ipAddress || '').toLowerCase().includes(q);
        if (!matchAction && !matchDetail && !matchUser && !matchTarget && !matchIp) {
          return false;
        }
      }

      return true;
    });
  }, [accessLogs, selectedLogUserId, logTypeFilter, logSearchQuery]);

  // Gruppo 1: Utenti filtrati per ricerca rapida nella colonna sinistra
  const filteredLogUsers = useMemo(() => {
    if (!logUsersSearchQuery.trim()) return users;
    const q = logUsersSearchQuery.toLowerCase();
    return users.filter(u => 
      u.name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  }, [users, logUsersSearchQuery]);

  // Gruppo 2: Cose viste raggruppate per modulo/sezione
  const groupedSectionsSeen = useMemo(() => {
    const map: Record<string, {
      actionName: string;
      targetId?: string;
      count: number;
      lastSeen: string;
      sampleDetail: string;
      types: string[];
      usernames: string[];
    }> = {};

    for (const log of filteredLogs) {
      const key = log.actionName || log.targetId || 'Sezione Applicativa';
      if (!map[key]) {
        map[key] = {
          actionName: key,
          targetId: log.targetId,
          count: 0,
          lastSeen: log.timestamp,
          sampleDetail: log.viewDetail,
          types: [],
          usernames: []
        };
      }
      map[key].count += 1;
      if (!map[key].types.includes(log.type)) {
        map[key].types.push(log.type);
      }
      if (!map[key].usernames.includes(log.username)) {
        map[key].usernames.push(log.username);
      }
      if (new Date(log.timestamp) > new Date(map[key].lastSeen)) {
        map[key].lastSeen = log.timestamp;
        map[key].sampleDetail = log.viewDetail;
      }
    }

    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [filteredLogs]);

  const handleExportLogsCsv = () => {
    const csvData = exportUserAccessLogsAsCsv(selectedLogUserId === 'all' ? undefined : selectedLogUserId);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const userLabel = selectedLogUserId === 'all' ? 'TUTTI' : (users.find(u => u.id === selectedLogUserId)?.username || selectedLogUserId);
    a.download = `SPARK_ACCESS_LOGS_${userLabel}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('success', 'File CSV dei log esportato con successo.');
  };

  const handleExportLogsJson = () => {
    const jsonData = exportUserAccessLogsAsJson(selectedLogUserId === 'all' ? undefined : selectedLogUserId);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const userLabel = selectedLogUserId === 'all' ? 'TUTTI' : (users.find(u => u.id === selectedLogUserId)?.username || selectedLogUserId);
    a.download = `SPARK_ACCESS_LOGS_${userLabel}_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('success', 'File JSON dei log esportato con successo.');
  };

  const handleClearLogs = () => {
    const userLabel = selectedLogUserId === 'all' ? 'tutti gli utenti' : `l'utente @${users.find(u => u.id === selectedLogUserId)?.username || selectedLogUserId}`;
    if (window.confirm(`Sei sicuro di voler cancellare i log degli accessi per ${userLabel}? Questa azione è irreversibile.`)) {
      clearUserAccessLogs(selectedLogUserId === 'all' ? undefined : selectedLogUserId);
      loadLogs();
      loadUsers();
      showToast('success', `Registro log per ${userLabel} azzerato.`);
    }
  };

  const handleResetLogsToDefault = () => {
    if (window.confirm('Vuoi ripristinare il registro dei log di accesso con gli eventi di test predefiniti?')) {
      resetDefaultAccessLogs();
      loadLogs();
      loadUsers();
      showToast('success', 'Log di accesso ripristinati con successo e date sincronizzate.');
    }
  };

  const handleCopyLogJson = (log: UserAccessLog) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(JSON.stringify(log, null, 2));
      setCopiedLogJsonId(log.id);
      showToast('success', 'Dati JSON del log copiati negli appunti.');
      setTimeout(() => setCopiedLogJsonId(null), 2000);
    }
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback(null);
    }, 3500);
  };

  if (!isOpen) return null;

  // Handle Add User
  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.trim().length < 3) {
      showToast('error', 'La password deve contenere almeno 3 caratteri.');
      return;
    }

    const res = createNewUser(currentUser.role, {
      username: newUsername.trim(),
      password: newPassword.trim(),
      name: newName.trim(),
      email: newEmail.trim(),
      role: newRole,
      status: newStatus,
      allowedIcons: newRole === 'admin' ? ALL_APP_ICON_IDS : newAllowedIcons,
      allowedAgentAiCategories: newRole === 'admin' ? ALL_AGENT_AI_CATEGORY_IDS : newAllowedCategories
    });

    if (res.success) {
      showToast('success', res.message);
      setIsAddModalOpen(false);
      // Reset form
      setNewUsername('');
      setNewPassword('');
      setNewName('');
      setNewEmail('');
      setNewRole('user');
      setNewStatus('active');
      setNewAllowedIcons(ALL_APP_ICON_IDS);
      setNewAllowedCategories(ALL_AGENT_AI_CATEGORY_IDS);
      loadUsers();
    } else {
      showToast('error', res.message);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (user: AuthUser) => {
    setEditingUser(user);
    setEditUsername(user.username);
    setEditPassword(''); // empty unless changing
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditStatus(user.status);
    setEditAllowedIcons(user.allowedIcons ?? (user.role === 'admin' ? ALL_APP_ICON_IDS : []));
    setEditAllowedCategories(user.allowedAgentAiCategories ?? (user.role === 'admin' ? ALL_AGENT_AI_CATEGORY_IDS : ALL_AGENT_AI_CATEGORY_IDS));
  };

  // Open Permissions Dedicated Modal (Icons or Agent AI Categories)
  const handleOpenPermissions = (user: AuthUser, initialTab: 'icons' | 'agent_ai' = 'icons') => {
    setManagingIconsUser(user);
    setPermissionsActiveTab(initialTab);
    setUserSelectedIcons(user.allowedIcons ?? (user.role === 'admin' ? ALL_APP_ICON_IDS : []));
    setUserSelectedCategories(user.allowedAgentAiCategories ?? (user.role === 'admin' ? ALL_AGENT_AI_CATEGORY_IDS : ALL_AGENT_AI_CATEGORY_IDS));
  };

  // Backward compatibility alias
  const handleOpenIconPermissions = (user: AuthUser) => {
    handleOpenPermissions(user, 'icons');
  };

  // Toggle icon in dedicated modal
  const handleToggleUserIcon = (iconId: string) => {
    setUserSelectedIcons(prev =>
      prev.includes(iconId) ? prev.filter(id => id !== iconId) : [...prev, iconId]
    );
  };

  // Toggle Agent AI category in dedicated modal
  const handleToggleUserCategory = (categoryId: string) => {
    setUserSelectedCategories(prev =>
      prev.includes(categoryId) ? prev.filter(c => c !== categoryId) : [...prev, categoryId]
    );
  };

  // Save Permissions (Both Icons and Categories)
  const handleSaveAllPermissions = () => {
    if (!managingIconsUser) return;
    const resIcons = updateUserIconPermissions(currentUser.role, managingIconsUser.id, userSelectedIcons);
    const resCategories = updateUserAgentAiCategoryPermissions(currentUser.role, managingIconsUser.id, userSelectedCategories);
    
    if (resIcons.success && resCategories.success) {
      showToast('success', `Permessi icone e categorie salvati con successo per @${managingIconsUser.username}.`);
      setManagingIconsUser(null);
      loadUsers();
      if (onSessionUpdated && managingIconsUser.id === currentUser.id) {
        const refreshed = getStoredUsers().find(u => u.id === currentUser.id);
        if (refreshed) {
          onSessionUpdated({
            id: refreshed.id,
            username: refreshed.username,
            name: refreshed.name,
            email: refreshed.email,
            role: refreshed.role,
            status: refreshed.status,
            createdAt: refreshed.createdAt,
            lastLogin: refreshed.lastLogin,
            allowedIcons: refreshed.allowedIcons,
            allowedAgentAiCategories: refreshed.allowedAgentAiCategories
          });
        }
      }
    } else {
      showToast('error', resIcons.message || resCategories.message);
    }
  };

  // Backward compatibility alias for icon saving
  const handleSaveIconPermissions = handleSaveAllPermissions;

  // Handle Save Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const updates: Partial<AuthUser> = {
      username: editUsername,
      name: editName,
      email: editEmail,
      role: editRole,
      status: editStatus,
      allowedIcons: editRole === 'admin' ? ALL_APP_ICON_IDS : editAllowedIcons,
      allowedAgentAiCategories: editRole === 'admin' ? ALL_AGENT_AI_CATEGORY_IDS : editAllowedCategories
    };

    if (editPassword.trim()) {
      if (editPassword.trim().length < 3) {
        showToast('error', 'La nuova password deve contenere almeno 3 caratteri.');
        return;
      }
      updates.password = editPassword.trim();
    }

    const res = updateExistingUser(currentUser.role, editingUser.id, updates);
    if (res.success) {
      showToast('success', res.message);
      setEditingUser(null);
      loadUsers();
      if (onSessionUpdated && editingUser.id === currentUser.id) {
        const refreshed = getStoredUsers().find(u => u.id === currentUser.id);
        if (refreshed) {
          onSessionUpdated({
            id: refreshed.id,
            username: refreshed.username,
            name: refreshed.name,
            email: refreshed.email,
            role: refreshed.role,
            status: refreshed.status,
            createdAt: refreshed.createdAt,
            lastLogin: refreshed.lastLogin,
            allowedIcons: refreshed.allowedIcons
          });
        }
      }
    } else {
      showToast('error', res.message);
    }
  };

  // Handle Toggle Status (Quick activate/suspend)
  const handleToggleStatus = (targetUser: AuthUser) => {
    if (targetUser.id === currentUser.id) {
      showToast('error', 'Non puoi sospendere il tuo account attivo.');
      return;
    }
    const newStat: UserStatus = targetUser.status === 'active' ? 'suspended' : 'active';
    const res = updateExistingUser(currentUser.role, targetUser.id, { status: newStat });
    if (res.success) {
      showToast('success', `Stato utente aggiornato a: ${newStat.toUpperCase()}`);
      loadUsers();
    } else {
      showToast('error', res.message);
    }
  };

  // Handle Delete User
  const handleDeleteUser = (targetUser: AuthUser) => {
    if (targetUser.id === currentUser.id) {
      showToast('error', 'Non puoi eliminare il tuo account amministratore attualmente in uso.');
      return;
    }

    if (window.confirm(`Sei sicuro di voler eliminare definitivamente l'utente "${targetUser.username}" (${targetUser.name})?`)) {
      const res = deleteExistingUser(currentUser.role, currentUser.id, targetUser.id);
      if (res.success) {
        showToast('success', res.message);
        loadUsers();
      } else {
        showToast('error', res.message);
      }
    }
  };

  // Handle Reset to Default
  const handleResetFactory = () => {
    if (window.confirm('Vuoi ripristinare il database degli utenti agli account predefiniti (Admin e User)?')) {
      resetUsersDatabase();
      loadUsers();
      showToast('success', 'Database utenti ripristinato con successo.');
    }
  };

  // Handle Export
  const handleExportUsers = () => {
    const safeUsers = users.map(({ password, ...rest }) => rest);
    const blob = new Blob([JSON.stringify(safeUsers, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SPARK_QUANTUM_USERS_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Filtered users
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const totalUsers = users.length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const standardUsersCount = users.filter(u => u.role === 'user').length;
  const activeCount = users.filter(u => u.status === 'active').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn select-none text-white">
      <div 
        className="relative w-full max-w-7xl max-h-[92vh] bg-gradient-to-b from-[#0f172a] to-[#070b13] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-quantum-primary/10 border border-quantum-primary/30 rounded-2xl text-quantum-primary">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-display font-bold uppercase tracking-wider text-white">
                  Console Amministrazione Utenti
                </h2>
                <span className="px-2 py-0.5 text-[9px] font-mono uppercase bg-red-500/10 text-red-400 border border-red-500/30 rounded-full font-bold">
                  Admin Exclusive
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-gray-400 font-mono">
                Gestione accessi, ruoli RBAC e credenziali Spark Quantum Engine
              </p>
            </div>
          </div>

          <button
            id="close-admin-users-modal"
            onClick={onClose}
            className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-colors cursor-pointer"
            title="Chiudi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Tab Navigation */}
        <div className="flex items-center gap-2 px-4 sm:px-6 pt-2.5 pb-0 border-b border-white/10 bg-black/30 shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setMainActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono font-bold rounded-t-xl transition-all border-b-2 cursor-pointer shrink-0 ${
              mainActiveTab === 'users'
                ? 'border-quantum-primary text-quantum-primary bg-quantum-primary/10 shadow-[0_-2px_10px_rgba(0,242,255,0.15)]'
                : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>👥 Gestione Utenti & Permessi</span>
            <span className="px-2 py-0.5 text-[10px] rounded-full bg-white/10 text-gray-300 font-bold">
              {users.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMainActiveTab('logs')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono font-bold rounded-t-xl transition-all border-b-2 cursor-pointer shrink-0 ${
              mainActiveTab === 'logs'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10 shadow-[0_-2px_10px_rgba(6,182,212,0.15)]'
                : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <History className="w-4 h-4 text-cyan-400" />
            <span>📋 Log degli Accessi & Visibilità ("Cosa Vede")</span>
            <span className="px-2 py-0.5 text-[10px] rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
              {accessLogs.length} Eventi
            </span>
            {selectedLogUserId !== 'all' && (
              <span className="px-2 py-0.5 text-[9px] rounded-full bg-quantum-primary/20 text-quantum-primary border border-quantum-primary/40 font-bold">
                Filtro: @{users.find(u => u.id === selectedLogUserId)?.username || selectedLogUserId}
              </span>
            )}
          </button>
        </div>

        {/* Feedback Alert Toast */}
        {feedback && (
          <div className={`mx-4 sm:mx-6 mt-3 p-3 rounded-2xl border flex items-center gap-2.5 text-xs font-mono animate-fadeIn ${
            feedback.type === 'success'
              ? 'bg-green-500/10 border-green-500/30 text-green-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}>
            {feedback.type === 'success' ? <Check className="w-4 h-4 text-green-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 1: GESTIONE UTENTI & PERMESSI                              */}
        {/* ============================================================== */}
        {mainActiveTab === 'users' && (
          <>
            {/* Stats Row */}
            <div className="px-4 sm:px-6 py-3 bg-white/[0.02] border-b border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-2.5 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between">
                <span className="text-gray-400">Totale Utenti:</span>
                <span className="text-white font-bold text-sm">{totalUsers}</span>
              </div>
              <div className="p-2.5 bg-quantum-primary/5 border border-quantum-primary/20 rounded-xl flex items-center justify-between">
                <span className="text-quantum-primary">Amministratori:</span>
                <span className="text-quantum-primary font-bold text-sm">{adminCount}</span>
              </div>
              <div className="p-2.5 bg-cyan-500/5 border border-cyan-500/20 rounded-xl flex items-center justify-between">
                <span className="text-cyan-300">Analisti / User:</span>
                <span className="text-cyan-300 font-bold text-sm">{standardUsersCount}</span>
              </div>
              <div className="p-2.5 bg-green-500/5 border border-green-500/20 rounded-xl flex items-center justify-between">
                <span className="text-green-400">Account Attivi:</span>
                <span className="text-green-400 font-bold text-sm">{activeCount}</span>
              </div>
            </div>

            {/* Action Toolbar */}
            <div className="p-4 sm:p-6 pb-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cerca per username, nome o email..."
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs font-mono text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-quantum-primary"
                  />
                </div>

                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as any)}
                  className="bg-[#0b0f19] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-gray-300 focus:outline-none focus:ring-1 focus:ring-quantum-primary cursor-pointer"
                >
                  <option value="all">Tutti i Ruoli</option>
                  <option value="admin">Solo Admin</option>
                  <option value="user">Solo Utenti</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="admin-create-new-user-btn"
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-quantum-primary to-cyan-400 hover:from-cyan-300 hover:to-quantum-primary text-black font-display font-bold uppercase text-xs rounded-xl shadow-[0_0_15px_rgba(0,242,255,0.2)] transition-all cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Nuovo Utente</span>
                </button>

                <button
                  onClick={handleExportUsers}
                  className="p-2 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 rounded-xl transition-all cursor-pointer"
                  title="Esporta lista utenti JSON"
                >
                  <Download className="w-4 h-4" />
                </button>

                <button
                  onClick={handleResetFactory}
                  className="p-2 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-300 border border-white/10 hover:border-red-500/30 rounded-xl transition-all cursor-pointer"
                  title="Ripristina utenti iniziali di default"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Users List Table */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 pt-2 space-y-3">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl">
                  <Users className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-400 font-mono">Nessun utente trovato con i filtri selezionati.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredUsers.map((user) => {
                    const isSelf = user.id === currentUser.id;
                    const { loginFormatted, activityFormatted, userLogsCount: uLogCount } = getUserAccessMeta(user);
                    return (
                      <div 
                        key={user.id}
                        className="p-3.5 sm:p-4 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-2xl transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-xl border ${
                            user.role === 'admin' 
                              ? 'bg-quantum-primary/10 border-quantum-primary/30 text-quantum-primary' 
                              : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                          }`}>
                            {user.role === 'admin' ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-sm">{user.name}</span>
                              <span className="text-gray-400">(@{user.username})</span>
                              {isSelf && (
                                <span className="px-2 py-0.5 text-[9px] bg-quantum-primary/20 text-quantum-primary border border-quantum-primary/40 rounded-md uppercase font-bold">
                                  Tu (Attivo)
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-gray-400 mt-1">
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3 text-gray-500" />
                                {user.email}
                              </span>
                              <span>•</span>
                              <span>
                                Ruolo: <strong className={user.role === 'admin' ? 'text-quantum-primary uppercase' : 'text-cyan-300 uppercase'}>{user.role}</strong>
                              </span>
                              <span>•</span>
                              <span className="inline-flex items-center gap-1.5 bg-black/40 px-2 py-0.5 rounded border border-white/10 text-gray-300 font-mono">
                                <Key className="w-3 h-3 text-amber-400 shrink-0" />
                                <span className="text-[10px] text-gray-400 font-sans">Password:</span>
                                <span className="text-white font-bold">
                                  {visiblePasswords[user.id] ? user.password : '••••••••'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => togglePasswordVisibility(user.id)}
                                  className="text-gray-400 hover:text-white p-0.5 ml-0.5 transition-colors cursor-pointer"
                                  title={visiblePasswords[user.id] ? 'Nascondi password' : 'Mostra password in chiaro'}
                                >
                                  {visiblePasswords[user.id] ? <EyeOff className="w-3 h-3 text-cyan-300" /> : <Eye className="w-3 h-3" />}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleCopyPassword(user)}
                                  className="text-gray-400 hover:text-quantum-primary p-0.5 transition-colors cursor-pointer"
                                  title="Copia password negli appunti"
                                >
                                  {copiedPasswordUserId === user.id ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                                </button>
                              </span>
                              <span>•</span>
                              <span className={user.hasAcceptedAgreements ? 'text-green-400' : 'text-amber-400'}>
                                Consenso: {user.hasAcceptedAgreements ? 'Accettato' : 'In attesa primo login'}
                              </span>
                              {loginFormatted ? (
                                <>
                                  <span>•</span>
                                  <span 
                                    className="text-cyan-300 flex items-center gap-1" 
                                    title={`Ultimo Login: ${loginFormatted.formatted}${activityFormatted ? ` • Ultima Azione: ${activityFormatted.formatted}` : ''}`}
                                  >
                                    <Clock className="w-3 h-3 text-cyan-400" />
                                    <span>Accesso: <strong>{loginFormatted.relative}</strong></span>
                                    {activityFormatted && activityFormatted.formatted !== loginFormatted.formatted && (
                                      <span className="text-gray-400 text-[10px] ml-0.5">
                                        (azione: {activityFormatted.relative})
                                      </span>
                                    )}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <span>•</span>
                                  <span className="text-gray-500 flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-gray-600" />
                                    <span>Nessun accesso registrato</span>
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
                          {/* Pulsante Esclusivo Log Accessi dell'Utente */}
                          <button
                            onClick={() => {
                              setSelectedLogUserId(user.id);
                              setMainActiveTab('logs');
                            }}
                            className="px-2.5 py-1 bg-cyan-500/10 hover:bg-cyan-500/25 text-cyan-300 hover:text-cyan-100 border border-cyan-500/40 hover:border-cyan-400 rounded-lg text-[10px] font-bold font-mono transition-all cursor-pointer flex items-center gap-1.5 shadow-[0_0_8px_rgba(6,182,212,0.15)]"
                            title={`Visualizza tutti gli accessi di @${user.username} e cosa vede nell'applicazione`}
                          >
                            <History className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            <span>Log Accessi ({uLogCount})</span>
                          </button>

                          {/* Allowed Icons Badge & Quick Manage */}
                          <button
                            onClick={() => handleOpenPermissions(user, 'icons')}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                              user.role === 'admin'
                                ? 'bg-quantum-primary/10 border-quantum-primary/30 text-quantum-primary'
                                : (user.allowedIcons?.length ?? ALL_APP_ICON_IDS.length) === ALL_APP_ICON_IDS.length
                                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20'
                                : (user.allowedIcons?.length ?? 0) === 0
                                ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                                : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                            }`}
                            title="Gestisci permessi singole icone utente"
                          >
                            <Sliders className="w-3 h-3 shrink-0" />
                            <span>
                              {user.role === 'admin' 
                                ? 'Tutte (Admin)' 
                                : `${user.allowedIcons?.length ?? ALL_APP_ICON_IDS.length}/${ALL_APP_ICONS.length} Icone`}
                            </span>
                          </button>

                          {/* Allowed Agent AI Categories Badge & Quick Manage */}
                          <button
                            onClick={() => handleOpenPermissions(user, 'agent_ai')}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                              user.role === 'admin'
                                ? 'bg-purple-500/10 border-purple-500/30 text-purple-300'
                                : (user.allowedAgentAiCategories?.length ?? ALL_AGENT_AI_CATEGORY_IDS.length) === ALL_AGENT_AI_CATEGORY_IDS.length
                                ? 'bg-purple-500/10 border-purple-500/30 text-purple-300 hover:bg-purple-500/20'
                                : (user.allowedAgentAiCategories?.length ?? 0) === 0
                                ? 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                                : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                            }`}
                            title="Gestisci singole categorie Agents AI per questo utente"
                          >
                            <Cpu className="w-3 h-3 shrink-0" />
                            <span>
                              {user.role === 'admin' 
                                ? 'Tutte (Admin)' 
                                : `${user.allowedAgentAiCategories?.length ?? ALL_AGENT_AI_CATEGORY_IDS.length}/${ALL_AGENT_AI_CATEGORIES.length} Categorie AI`}
                            </span>
                          </button>

                          {/* Status Badge & Toggle */}
                          <button
                            onClick={() => handleToggleStatus(user)}
                            disabled={isSelf}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border transition-all cursor-pointer flex items-center gap-1.5 ${
                              user.status === 'active'
                                ? 'bg-green-500/10 border-green-500/30 text-green-300 hover:bg-green-500/20'
                                : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                            } ${isSelf ? 'opacity-60 cursor-not-allowed' : ''}`}
                            title={isSelf ? 'Non puoi sospendere te stesso' : 'Clicca per cambiare stato'}
                          >
                            {user.status === 'active' ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                            <span>{user.status === 'active' ? 'Attivo' : 'Sospeso'}</span>
                          </button>

                          {/* Icon Permissions Quick Button */}
                          <button
                            onClick={() => handleOpenPermissions(user, 'icons')}
                            className="p-1.5 bg-white/5 hover:bg-cyan-400/20 text-gray-300 hover:text-cyan-300 border border-white/10 hover:border-cyan-400/40 rounded-xl transition-all cursor-pointer"
                            title="Configura Accesso Icone Portale"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                          </button>

                          {/* Agent AI Categories Quick Button */}
                          <button
                            onClick={() => handleOpenPermissions(user, 'agent_ai')}
                            className="p-1.5 bg-white/5 hover:bg-purple-400/20 text-gray-300 hover:text-purple-300 border border-white/10 hover:border-purple-400/40 rounded-xl transition-all cursor-pointer"
                            title="Configura Categorie Agents AI"
                          >
                            <Cpu className="w-3.5 h-3.5" />
                          </button>

                          {/* Jump to Log and Viewed Items */}
                          <button
                            onClick={() => {
                              setSelectedLogUserId(user.id);
                              setMainActiveTab('logs');
                              setMobileGroupTab('logs');
                            }}
                            className="p-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 hover:text-white border border-cyan-500/30 hover:border-cyan-400 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                            title={`Visualizza nei Log cosa ha visto @${user.username} (${userLogCounts[user.id] || 0} attività viste)`}
                          >
                            <History className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-mono hidden xl:inline">{userLogCounts[user.id] || 0}</span>
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => handleOpenEdit(user)}
                            className="p-1.5 bg-white/5 hover:bg-quantum-primary/20 text-gray-300 hover:text-quantum-primary border border-white/10 hover:border-quantum-primary/40 rounded-xl transition-all cursor-pointer"
                            title="Modifica Dati & Password"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDeleteUser(user)}
                            disabled={isSelf}
                            className={`p-1.5 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-white/10 hover:border-red-500/40 rounded-xl transition-all cursor-pointer ${
                              isSelf ? 'opacity-30 cursor-not-allowed' : ''
                            }`}
                            title={isSelf ? 'Non puoi eliminare il tuo stesso account' : 'Elimina Utente'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* ============================================================== */}
        {/* TAB 2: LOG ACCESSI & VISIBILITÀ - DUE GRUPPI (UTENTI ↔ COSE VISTE) */}
        {/* ============================================================== */}
        {mainActiveTab === 'logs' && (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Sotto-Header Globale per i Due Gruppi con Barra Strumenti */}
            <div className="p-3.5 sm:p-4 border-b border-white/10 bg-black/35 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-300">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold uppercase text-xs sm:text-sm text-white tracking-wide">
                      Log degli Accessi & Visibilità • Architettura a Due Gruppi
                    </h3>
                    <span className="hidden sm:inline px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 uppercase">
                      Gruppo 1 (Utenti) ↔ Gruppo 2 (Cose Viste)
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 font-mono">
                    Seleziona un utente nel <strong>Gruppo 1</strong> a sinistra per visualizzare all'istante nel <strong>Gruppo 2</strong> l'elenco di tutte le cose che ha visto.
                  </p>
                </div>
              </div>

              {/* Pulsanti Rapidi Esportazione & Manutenzione */}
              <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0 font-mono text-xs">
                <button
                  type="button"
                  onClick={loadLogs}
                  className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 rounded-xl text-xs flex items-center gap-1 transition-colors cursor-pointer"
                  title="Ricarica i log in tempo reale dal database"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Aggiorna</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportLogsCsv}
                  className="px-2.5 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs flex items-center gap-1 transition-colors cursor-pointer"
                  title="Esporta in formato CSV leggibile con Excel"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>CSV</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportLogsJson}
                  className="px-2.5 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-xl text-xs flex items-center gap-1 transition-colors cursor-pointer"
                  title="Esporta in formato JSON nativo"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>JSON</span>
                </button>

                <button
                  type="button"
                  onClick={handleClearLogs}
                  className="p-1.5 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-300 border border-white/10 hover:border-red-500/30 rounded-xl transition-colors cursor-pointer"
                  title={selectedLogUserId === 'all' ? 'Svuota tutti i log di sistema' : 'Svuota i log dell\'utente selezionato'}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={handleResetLogsToDefault}
                  className="p-1.5 bg-white/5 hover:bg-amber-500/20 text-gray-400 hover:text-amber-300 border border-white/10 hover:border-amber-500/30 rounded-xl transition-colors cursor-pointer"
                  title="Ripristina i log demo iniziali di sistema"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Switcher Tab per Dispositivi Mobili (visibile solo su schermi piccoli) */}
            <div className="flex md:hidden border-b border-white/10 bg-black/50 p-1.5 gap-1.5 text-xs font-mono shrink-0">
              <button
                type="button"
                onClick={() => setMobileGroupTab('users')}
                className={`flex-1 py-1.5 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  mobileGroupTab === 'users'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-gray-400 hover:text-white bg-transparent'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Gruppo 1: Utenti ({filteredLogUsers.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileGroupTab('logs')}
                className={`flex-1 py-1.5 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  mobileGroupTab === 'logs'
                    ? 'bg-quantum-primary/20 text-quantum-primary border border-quantum-primary/40 shadow-sm'
                    : 'text-gray-400 hover:text-white bg-transparent'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Gruppo 2: Cose Viste ({filteredLogs.length})</span>
              </button>
            </div>

            {/* ============================================================== */}
            {/* CORPO PRINCIPALE A DUE GRUPPI: PANNELLO SINISTRA & DESTRA     */}
            {/* ============================================================== */}
            <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden divide-y md:divide-y-0 md:divide-x divide-white/10">

              {/* ------------------------------------------------------------ */}
              {/* GRUPPO 1: UTENTI (Colonna Sinistra)                          */}
              {/* ------------------------------------------------------------ */}
              <div className={`w-full md:w-80 lg:w-96 flex flex-col shrink-0 bg-[#070d18] min-h-0 ${
                mobileGroupTab === 'logs' ? 'hidden md:flex' : 'flex'
              }`}>
                {/* Intestazione Gruppo 1 */}
                <div className="p-3 border-b border-white/10 bg-black/40 flex flex-col gap-2 shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></div>
                      <span className="font-display font-bold text-xs uppercase tracking-wider text-cyan-300">
                        Gruppo 1 • Utenti Registrati
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono text-gray-300 font-bold">
                      {users.length} Account
                    </span>
                  </div>

                  {/* Campo Ricerca Utenti nel Gruppo 1 */}
                  <div className="relative">
                    <Search className="w-3 h-3 text-gray-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={logUsersSearchQuery}
                      onChange={(e) => setLogUsersSearchQuery(e.target.value)}
                      placeholder="Cerca utente per nome, @ o ruolo..."
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-7 pr-3 py-1 text-[11px] font-mono text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                    />
                  </div>
                </div>

                {/* Lista Utenti Scrollabile */}
                <div className="flex-1 overflow-y-auto p-2.5 space-y-2 font-mono text-xs">
                  {/* Opzione 1: Tutti gli Utenti (Panoramica Globale) */}
                  <div
                    onClick={() => {
                      setSelectedLogUserId('all');
                      setMobileGroupTab('logs');
                    }}
                    className={`p-3 rounded-2xl transition-all cursor-pointer border ${
                      selectedLogUserId === 'all'
                        ? 'border-cyan-400 bg-gradient-to-r from-cyan-950/70 to-blue-950/40 shadow-[0_0_15px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400/50'
                        : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-xl border ${
                          selectedLogUserId === 'all' 
                            ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300' 
                            : 'bg-white/5 border-white/10 text-gray-400'
                        }`}>
                          <Globe className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs flex items-center gap-1.5 font-sans">
                            <span>Tutti gli Utenti</span>
                            <span className="text-[10px] text-cyan-400 font-mono font-normal">(Globale)</span>
                          </div>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            Panoramica di tutte le cose viste nel portale
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          {accessLogs.length} eventi
                        </span>
                        {selectedLogUserId === 'all' && (
                          <span className="text-[9px] text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle className="w-2.5 h-2.5" />
                            <span>ATTIVO</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Separatore visivo */}
                  <div className="flex items-center gap-2 px-1 pt-1 text-[10px] text-gray-500 uppercase font-mono tracking-wider">
                    <span>Singoli Utenti Registrati ({filteredLogUsers.length})</span>
                    <div className="flex-1 border-t border-white/5"></div>
                  </div>

                  {/* Elenco Utenti Singoli */}
                  {filteredLogUsers.map(user => {
                    const isSelected = selectedLogUserId === user.id;
                    const { loginFormatted, activityFormatted, userLogsCount: logCount } = getUserAccessMeta(user);
                    const isAdmin = user.role === 'admin';

                    return (
                      <div
                        key={user.id}
                        onClick={() => {
                          setSelectedLogUserId(user.id);
                          setMobileGroupTab('logs');
                        }}
                        className={`p-3 rounded-2xl transition-all cursor-pointer border ${
                          isSelected
                            ? 'border-cyan-400 bg-gradient-to-r from-cyan-950/70 to-blue-950/40 shadow-[0_0_15px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400/50'
                            : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2.5">
                            {/* Avatar Ruolo */}
                            <div className={`p-2 rounded-xl border mt-0.5 shrink-0 ${
                              isAdmin
                                ? 'bg-quantum-primary/20 border-quantum-primary/40 text-quantum-primary'
                                : 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                            }`}>
                              {isAdmin ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
                            </div>

                            <div className="min-w-0">
                              <div className="font-bold text-white text-xs truncate font-sans">
                                {user.name}
                              </div>
                              <div className="text-[11px] text-cyan-300 font-mono flex items-center gap-1.5 flex-wrap">
                                <span>@{user.username}</span>
                                <span className={`px-1.5 py-0.2 rounded text-[8px] uppercase font-bold border ${
                                  isAdmin
                                    ? 'bg-quantum-primary/20 border-quantum-primary/40 text-quantum-primary'
                                    : 'bg-white/10 border-white/20 text-gray-300'
                                }`}>
                                  {user.role}
                                </span>
                                <span className={`px-1.5 py-0.2 rounded text-[8px] uppercase font-bold border ${
                                  user.status === 'active'
                                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                                    : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                                }`}>
                                  {user.status === 'active' ? 'Attivo' : 'Sospeso'}
                                </span>
                              </div>

                              {/* Ultimo Accesso & Ultima Attività Sincronizzati */}
                              <div className="text-[10px] mt-1.5 flex flex-col gap-0.5">
                                <div className="flex items-center gap-1 text-gray-300" title={loginFormatted ? `Ultimo Login: ${loginFormatted.formatted}` : 'Nessun login'}>
                                  <Clock className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
                                  <span>Accesso: <strong className="text-white">{loginFormatted ? loginFormatted.relative : 'Mai'}</strong></span>
                                </div>
                                {activityFormatted && (
                                  <div className="flex items-center gap-1 text-[9px] text-gray-400" title={`Ultima attività registrata: ${activityFormatted.formatted}`}>
                                    <Activity className="w-2.5 h-2.5 text-purple-400 shrink-0" />
                                    <span>Ultima cosa vista: <span className="text-gray-300">{activityFormatted.relative}</span></span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Contatore Cose Viste & Badge Selezione */}
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              isSelected
                                ? 'bg-cyan-400 text-black border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.4)]'
                                : logCount > 0
                                ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                                : 'bg-white/5 text-gray-500 border-white/10'
                            }`}>
                              {logCount} {logCount === 1 ? 'cosa vista' : 'cose viste'}
                            </span>

                            {isSelected ? (
                              <span className="text-[9px] text-cyan-300 font-bold flex items-center gap-1">
                                <span>SELEZIONATO</span>
                                <ChevronRight className="w-3 h-3 text-cyan-400" />
                              </span>
                            ) : (
                              <span className="text-[9px] text-gray-500 hover:text-gray-300 flex items-center gap-0.5">
                                <span>Vedi</span>
                                <ChevronRight className="w-2.5 h-2.5" />
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {filteredLogUsers.length === 0 && (
                    <div className="text-center py-6 text-gray-500 text-xs">
                      Nessun utente corrisponde a "{logUsersSearchQuery}"
                    </div>
                  )}
                </div>
              </div>

              {/* ------------------------------------------------------------ */}
              {/* GRUPPO 2: COSE CHE VENGONO VISTE (IL LOG) (Colonna Destra)    */}
              {/* ------------------------------------------------------------ */}
              <div className={`flex-1 flex flex-col min-h-0 bg-[#050912]/90 ${
                mobileGroupTab === 'users' ? 'hidden md:flex' : 'flex'
              }`}>
                {/* Intestazione Gruppo 2 */}
                <div className="p-3.5 sm:p-4 border-b border-white/10 bg-black/40 flex flex-col gap-2.5 shrink-0">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-quantum-primary animate-pulse"></div>
                      <span className="font-display font-bold text-xs uppercase tracking-wider text-quantum-primary">
                        Gruppo 2 • Cose Che Vengono Viste (Il Log)
                      </span>
                    </div>

                    {/* Badge Indicativo del Soggetto Selezionato */}
                    {(() => {
                      const inspected = users.find(u => u.id === selectedLogUserId);
                      if (inspected) {
                        return (
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-200 text-xs font-mono font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(6,182,212,0.15)]">
                              <User className="w-3.5 h-3.5 text-cyan-400" />
                              <span>Attività di: <strong className="text-white">@{inspected.username}</strong> ({inspected.name})</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => setSelectedLogUserId('all')}
                              className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-[11px] font-mono transition-colors cursor-pointer flex items-center gap-1"
                              title="Mostra tutti gli utenti"
                            >
                              <X className="w-3 h-3" />
                              <span className="hidden sm:inline">Rimuovi filtro</span>
                            </button>
                          </div>
                        );
                      }
                      return (
                        <span className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-xs font-mono flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Tutte le Cose Viste (Panoramica Globale)</span>
                        </span>
                      );
                    })()}

                    {/* Tasto Ritorno a Gruppo 1 per Mobile */}
                    <button
                      type="button"
                      onClick={() => setMobileGroupTab('users')}
                      className="md:hidden text-xs font-mono text-cyan-400 flex items-center gap-1 py-1 px-2 rounded-lg bg-cyan-500/10"
                    >
                      <span>← Torna al Gruppo Utenti</span>
                    </button>
                  </div>

                  {/* Barra Filtri delle Cose Viste & Switch Modalità */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/5">
                    <div className="flex flex-wrap items-center gap-2 flex-1">
                      {/* Switch Modalità: Timeline Cronologica vs Raggruppato per Schermata */}
                      <div className="flex items-center bg-black/60 border border-white/10 rounded-xl p-0.5 text-xs font-mono">
                        <button
                          type="button"
                          onClick={() => setLogViewMode('timeline')}
                          className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                            logViewMode === 'timeline'
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold'
                              : 'text-gray-400 hover:text-white'
                          }`}
                          title="Visualizza ogni singolo evento in ordine temporale"
                        >
                          <History className="w-3 h-3" />
                          <span>Timeline ({filteredLogs.length})</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setLogViewMode('sections')}
                          className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                            logViewMode === 'sections'
                              ? 'bg-quantum-primary/20 text-quantum-primary border border-quantum-primary/30 font-bold'
                              : 'text-gray-400 hover:text-white'
                          }`}
                          title="Raggruppa per schermata/modulo per sapere quali sezioni ha visto"
                        >
                          <Layers className="w-3 h-3" />
                          <span>Per Sezione ({groupedSectionsSeen.length})</span>
                        </button>
                      </div>

                      {/* Filtro per Tipo di Evento */}
                      <div className="flex items-center gap-1 bg-black/60 border border-white/10 rounded-xl px-2.5 py-1 text-xs font-mono">
                        <Filter className="w-3 h-3 text-quantum-primary shrink-0" />
                        <select
                          value={logTypeFilter}
                          onChange={(e) => setLogTypeFilter(e.target.value as any)}
                          className="bg-transparent text-white focus:outline-none cursor-pointer text-xs pr-1"
                        >
                          <option value="all" className="bg-[#0b0f19] text-white">Tutti i Tipi di Evento</option>
                          <option value="view_page" className="bg-[#0b0f19] text-white">👁️ Solo Schermate Viste ("Cosa Vede")</option>
                          <option value="login_logout" className="bg-[#0b0f19] text-white">🔑 Solo Login & Logout (Quando accede)</option>
                          <option value="action" className="bg-[#0b0f19] text-white">⚡ Azioni Operative & Calcoli</option>
                          <option value="access_denied" className="bg-[#0b0f19] text-white">🚫 Tentativi Bloccati</option>
                        </select>
                      </div>

                      {/* Ricerca Testuale nelle Cose Viste */}
                      <div className="relative flex-1 min-w-[180px]">
                        <Search className="w-3 h-3 text-gray-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={logSearchQuery}
                          onChange={(e) => setLogSearchQuery(e.target.value)}
                          placeholder="Cerca schermata, modulo, cosa vede, dettagli, IP..."
                          className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-7 pr-3 py-1 text-xs font-mono text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Area Scorrevole con Scheda Utente & Cose Viste */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 font-mono">
                  {/* SCHEDA RIEPILOGATIVA DELL'UTENTE ISPEZIONATO ("COSA VEDE NELL'APP") */}
                  {(() => {
                    const inspectedUser = users.find(u => u.id === selectedLogUserId);

                    if (inspectedUser) {
                      const { loginFormatted: lastLoginFormatted, activityFormatted: lastActivityFormatted } = getUserAccessMeta(inspectedUser);
                      const userLogs = accessLogs
                        .filter(l => l.userId === inspectedUser.id)
                        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                      const lastLog = userLogs[0];
                      const allowedIconList = inspectedUser.role === 'admin' 
                        ? ALL_APP_ICONS 
                        : ALL_APP_ICONS.filter(i => (inspectedUser.allowedIcons ?? []).includes(i.id));
                      const restrictedIcons = ALL_APP_ICONS.filter(i => !(inspectedUser.allowedIcons ?? []).includes(i.id));
                      const allowedCategoryList = inspectedUser.role === 'admin'
                        ? ALL_AGENT_AI_CATEGORIES
                        : ALL_AGENT_AI_CATEGORIES.filter(c => (inspectedUser.allowedAgentAiCategories ?? []).includes(c.id));

                      // Modulo più visitato da questo utente
                      const visitsPerModule: Record<string, number> = {};
                      userLogs.forEach(l => {
                        if (l.type === 'view_page' || l.type === 'action') {
                          const key = l.actionName || l.targetId || 'Altro';
                          visitsPerModule[key] = (visitsPerModule[key] || 0) + 1;
                        }
                      });
                      const topVisited = Object.entries(visitsPerModule).sort((a, b) => b[1] - a[1])[0];

                      return (
                        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#0d1c2e] via-[#091626] to-[#0a121e] border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.12)]">
                          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-white/10 pb-3 mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`p-2.5 rounded-xl border ${
                                inspectedUser.role === 'admin' 
                                   ? 'bg-quantum-primary/20 border-quantum-primary/40 text-quantum-primary' 
                                   : 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                              }`}>
                                {inspectedUser.role === 'admin' ? <Shield className="w-5 h-5" /> : <User className="w-5 h-5" />}
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-base font-bold text-white font-sans">{inspectedUser.name}</span>
                                  <span className="text-cyan-300 font-bold">(@{inspectedUser.username})</span>
                                  <span className={`px-2 py-0.5 text-[9px] rounded-md font-bold uppercase border ${
                                    inspectedUser.role === 'admin'
                                      ? 'bg-quantum-primary/20 border-quantum-primary/40 text-quantum-primary'
                                      : 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                                  }`}>
                                    {inspectedUser.role}
                                  </span>
                                  <span className={`px-2 py-0.5 text-[9px] rounded-md font-bold uppercase border ${
                                    inspectedUser.status === 'active'
                                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                                      : 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                                  }`}>
                                    {inspectedUser.status}
                                  </span>
                                </div>
                                <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-2 flex-wrap">
                                  <span>Email: {inspectedUser.email}</span>
                                  <span>•</span>
                                  <span>Consenso: {inspectedUser.hasAcceptedAgreements ? 'Accettato' : 'In attesa'}</span>
                                </p>
                              </div>
                            </div>

                            <button
                              onClick={() => setSelectedLogUserId('all')}
                              className="text-[11px] text-cyan-400 hover:text-cyan-200 hover:underline flex items-center gap-1 cursor-pointer self-end md:self-center"
                            >
                              <span>Mostra tutte le cose viste (Tutti)</span>
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Griglia Dati: Quando Accede e Cosa Vede */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                            {/* Colonna 1: Quando Accede */}
                            <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-2">
                              <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-[11px] uppercase tracking-wider">
                                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                                <span>Quando Accede & Sessioni</span>
                              </div>
                              <div className="space-y-1.5 text-[11px] text-gray-300">
                                <div>
                                  <span className="text-gray-500">Ultimo Accesso:</span>{' '}
                                  <strong className="text-white">
                                    {lastLoginFormatted ? `${lastLoginFormatted.formatted} (${lastLoginFormatted.relative})` : 'Nessun accesso rilevato'}
                                  </strong>
                                </div>
                                {lastActivityFormatted && (
                                  <div>
                                    <span className="text-gray-500">Ultima Cosa Vista:</span>{' '}
                                    <strong className="text-cyan-300">
                                      {lastActivityFormatted.formatted} ({lastActivityFormatted.relative})
                                    </strong>
                                  </div>
                                )}
                                <div>
                                  <span className="text-gray-500">Totale Cose Viste:</span>{' '}
                                  <strong className="text-cyan-300">{userLogs.length} attività registrate</strong>
                                </div>
                                <div>
                                  <span className="text-gray-500">Ultimo Indirizzo IP:</span>{' '}
                                  <strong className="text-gray-300">{lastLog?.ipAddress || 'Client Locale'}</strong>
                                </div>
                                <div>
                                  <span className="text-gray-500">Dispositivo:</span>{' '}
                                  <strong className="text-gray-300">{lastLog?.deviceInfo || 'Browser Web'}</strong>
                                </div>
                              </div>
                            </div>

                            {/* Colonna 2: Cosa Vede dell'Applicazione */}
                            <div className="p-3 rounded-xl bg-black/40 border border-cyan-500/20 space-y-2 lg:col-span-2">
                              <div className="flex items-center justify-between flex-wrap gap-1">
                                <div className="flex items-center gap-1.5 text-quantum-primary font-bold text-[11px] uppercase tracking-wider">
                                  <Eye className="w-3.5 h-3.5 text-quantum-primary" />
                                  <span>Cosa Vede dell'Applicazione (Permessi Attivi)</span>
                                </div>
                                <span className="text-[10px] text-gray-400">
                                  {inspectedUser.role === 'admin' 
                                    ? 'Tutti i 9 Moduli abilitati' 
                                    : `${allowedIconList.length} di ${ALL_APP_ICONS.length} Moduli abilitati`}
                                </span>
                              </div>

                              {inspectedUser.role === 'admin' ? (
                                <div className="p-2.5 rounded-lg bg-quantum-primary/10 border border-quantum-primary/30 text-quantum-primary text-xs font-sans">
                                  ✨ <strong>Amministratore Totale:</strong> Questo utente ha visibilità completa su tutti i moduli dell'ecosistema, inclusi Medical Screening (Pagina Salute), Portale Agent AI (108 scenari), IBM Quantum Interface, Noise Management, PQC Suite, Gestione Utenti e Configurazione Chiavi API.
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  {/* Moduli e Icone abilitati */}
                                  <div>
                                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block mb-1">
                                      Moduli e Icone Visibili ({allowedIconList.length}):
                                    </span>
                                    <div className="flex flex-wrap gap-1.5">
                                      {allowedIconList.map(icon => (
                                        <span 
                                          key={icon.id}
                                          className="px-2 py-0.5 rounded-md bg-cyan-950/40 border border-cyan-500/30 text-cyan-200 text-[10px] flex items-center gap-1"
                                          title={icon.description}
                                        >
                                          <CheckCircle className="w-2.5 h-2.5 text-emerald-400" />
                                          {icon.name}
                                        </span>
                                      ))}
                                      {restrictedIcons.length > 0 && restrictedIcons.map(icon => (
                                        <span 
                                          key={icon.id}
                                          className="px-2 py-0.5 rounded-md bg-red-950/20 border border-red-500/20 text-red-400 text-[10px] flex items-center gap-1 opacity-70 line-through"
                                          title={`Bloccato per questo utente: ${icon.description}`}
                                        >
                                          <Lock className="w-2.5 h-2.5 text-red-400" />
                                          {icon.name}
                                        </span>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Categorie Agent AI abilitate */}
                                  <div>
                                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block mb-1">
                                      Settori Agent AI Accessibili ({allowedCategoryList.length}/{ALL_AGENT_AI_CATEGORIES.length}):
                                    </span>
                                    <div className="flex flex-wrap gap-1.5">
                                      {allowedCategoryList.map(cat => (
                                        <span 
                                          key={cat.id}
                                          className="px-2 py-0.5 rounded-md bg-purple-950/40 border border-purple-500/30 text-purple-200 text-[10px] flex items-center gap-1"
                                          title={cat.description}
                                        >
                                          <span>{cat.icon}</span>
                                          {cat.name}
                                        </span>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Modulo più visualizzato */}
                                  {topVisited && (
                                    <div className="pt-1 text-[11px] text-gray-300">
                                      <span className="text-gray-500">Sezione più visualizzata da @{inspectedUser.username}:</span>{' '}
                                      <strong className="text-white">{topVisited[0]}</strong> ({topVisited[1]} volte)
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    } else {
                      // Panoramica Globale Sistema (quando selectedLogUserId === 'all')
                      const loginEventsCount = accessLogs.filter(l => l.type === 'login').length;
                      const viewEventsCount = accessLogs.filter(l => l.type === 'view_page').length;
                      const actionEventsCount = accessLogs.filter(l => l.type === 'action').length;
                      const blockedEventsCount = accessLogs.filter(l => l.type === 'access_denied').length;
                      const mostRecentLog = accessLogs[0];

                      return (
                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <div className="p-2.5 bg-black/40 rounded-xl border border-white/5">
                            <span className="text-gray-400 block text-[10px] uppercase">Totale Login Eseguiti:</span>
                            <strong className="text-emerald-400 text-sm">{loginEventsCount} accessi</strong>
                          </div>
                          <div className="p-2.5 bg-black/40 rounded-xl border border-white/5">
                            <span className="text-gray-400 block text-[10px] uppercase">Pagine & Moduli Visti:</span>
                            <strong className="text-cyan-300 text-sm">{viewEventsCount} schermate</strong>
                          </div>
                          <div className="p-2.5 bg-black/40 rounded-xl border border-white/5">
                            <span className="text-gray-400 block text-[10px] uppercase">Azioni & Calcoli Quantistici:</span>
                            <strong className="text-purple-300 text-sm">{actionEventsCount} azioni</strong>
                          </div>
                          <div className="p-2.5 bg-black/40 rounded-xl border border-white/5">
                            <span className="text-gray-400 block text-[10px] uppercase">Tentativi Bloccati:</span>
                            <strong className={blockedEventsCount > 0 ? "text-red-400 text-sm" : "text-gray-400 text-sm"}>
                              {blockedEventsCount} violazioni
                            </strong>
                          </div>
                          {mostRecentLog && (
                            <div className="col-span-2 sm:col-span-4 p-2 bg-cyan-950/20 rounded-xl border border-cyan-500/20 text-[11px] text-gray-300 flex items-center justify-between flex-wrap gap-2">
                              <span className="flex items-center gap-1.5">
                                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                                <span>Ultimo evento registrato:</span>
                                <strong className="text-white">@{mostRecentLog.username}</strong>
                                <span className="text-gray-400">ha visto</span>
                                <strong className="text-cyan-300">{mostRecentLog.actionName}</strong>
                              </span>
                              <span className="text-gray-500 font-mono text-[10px]">
                                {formatLogTimestamp(mostRecentLog.timestamp).formatted} ({formatLogTimestamp(mostRecentLog.timestamp).relative})
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    }
                  })()}

                  {/* Intestazione Feed dei Log */}
                  <div className="flex items-center justify-between text-xs text-gray-400 px-1 pt-1 flex-wrap gap-2">
                    <span className="flex items-center gap-2">
                      <Activity className="w-3.5 h-3.5 text-cyan-400" />
                      <span>
                        Cose viste corrispondenti: <strong className="text-white">{filteredLogs.length}</strong> su {accessLogs.length} totali
                      </span>
                      {selectedLogUserId !== 'all' && (
                        <span className="text-quantum-primary font-bold">
                          (Filtro attivo su: @{users.find(u => u.id === selectedLogUserId)?.username})
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      Modalità: {logViewMode === 'timeline' ? 'Timeline cronologica discendente' : 'Raggruppamento per sezione vista'}
                    </span>
                  </div>

                  {/* VISTA 1: RAGGRUPPATO PER SEZIONE / MODULO */}
                  {logViewMode === 'sections' && (
                    <div className="space-y-3">
                      {groupedSectionsSeen.length === 0 ? (
                        <div className="text-center py-10 border border-dashed border-white/10 rounded-2xl p-6 text-gray-400 text-xs">
                          Nessuna sezione visualizzata corrispondente ai filtri.
                        </div>
                      ) : (
                        groupedSectionsSeen.map((sec, idx) => {
                          const timeMeta = formatLogTimestamp(sec.lastSeen);
                          return (
                            <div
                              key={idx}
                              className="p-4 rounded-2xl bg-[#091727]/70 border border-cyan-500/20 hover:border-cyan-500/40 transition-all shadow-[0_0_15px_rgba(6,182,212,0.06)]"
                            >
                              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-white/5 pb-2.5 mb-2.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300">
                                    <Eye className="w-4 h-4" />
                                  </span>
                                  <span className="font-bold text-sm text-white font-sans">
                                    {sec.actionName}
                                  </span>
                                  {sec.targetId && (
                                    <span className="px-2 py-0.5 text-[9px] font-mono rounded bg-white/10 text-gray-300 border border-white/10">
                                      Target ID: {sec.targetId}
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-2">
                                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                    Vista {sec.count} {sec.count === 1 ? 'volta' : 'volte'}
                                  </span>
                                  <span className="text-[10px] text-gray-400">
                                    Ultima: {timeMeta.relative}
                                  </span>
                                </div>
                              </div>

                              <p className="text-xs text-gray-200 font-sans leading-relaxed mb-2">
                                {sec.sampleDetail}
                              </p>

                              <div className="flex items-center justify-between flex-wrap gap-2 text-[10px] text-gray-400 pt-2 border-t border-white/5">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span>Visualizzata da:</span>
                                  {sec.usernames.map(u => (
                                    <span key={u} className="px-1.5 py-0.5 rounded bg-white/10 text-white font-bold">
                                      @{u}
                                    </span>
                                  ))}
                                </div>
                                <span className="text-gray-500">
                                  Ultima registrazione: {timeMeta.formatted}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}

                  {/* VISTA 2: TIMELINE CRONOLOGICA DELLE COSE VISTE */}
                  {logViewMode === 'timeline' && (
                    <>
                      {filteredLogs.length === 0 ? (
                        <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl p-6">
                          <History className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                          <p className="text-xs text-gray-400">
                            Nessuna attività o schermata vista registrata per questo utente con i filtri selezionati.
                          </p>
                          <div className="flex items-center justify-center gap-2 mt-4">
                            <button
                              onClick={() => { setSelectedLogUserId('all'); setLogTypeFilter('all'); setLogSearchQuery(''); }}
                              className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs transition-colors cursor-pointer"
                            >
                              Reimposta Filtri
                            </button>
                            <button
                              onClick={handleResetLogsToDefault}
                              className="px-3.5 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs transition-colors cursor-pointer"
                            >
                              Carica Eventi Dimostrativi
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {filteredLogs.map(log => {
                            const timeMeta = formatLogTimestamp(log.timestamp);
                            const isLogin = log.type === 'login';
                            const isLogout = log.type === 'logout';
                            const isViewPage = log.type === 'view_page';
                            const isAction = log.type === 'action';
                            const isAccessDenied = log.type === 'access_denied';

                            return (
                              <div
                                key={log.id}
                                className={`p-3.5 sm:p-4 rounded-2xl transition-all border ${
                                  isLogin
                                    ? 'border-l-4 border-l-emerald-400 bg-[#091a1e]/60 border-emerald-500/20'
                                    : isLogout
                                    ? 'border-l-4 border-l-slate-400 bg-white/[0.02] border-white/10'
                                    : isViewPage
                                    ? 'border-l-4 border-l-cyan-400 bg-[#091727]/70 border-cyan-500/20'
                                    : isAction
                                    ? 'border-l-4 border-l-purple-400 bg-[#140e26]/70 border-purple-500/20'
                                    : 'border-l-4 border-l-rose-500 bg-[#250d14]/80 border-rose-500/30'
                                }`}
                              >
                                {/* Intestazione Riga Log: Data/Ora, Utente, Badge Tipo */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-white/5 pb-2.5 mb-2.5">
                                  <div className="flex flex-wrap items-center gap-2">
                                    {/* Badge Tipo Evento */}
                                    {isLogin && (
                                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                                        <Key className="w-3 h-3 text-emerald-400" />
                                        Accesso Riuscito (Login)
                                      </span>
                                    )}
                                    {isLogout && (
                                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-500/20 text-slate-300 border border-slate-500/30 flex items-center gap-1">
                                        <LogOut className="w-3 h-3 text-slate-400" />
                                        Disconnessione (Logout)
                                      </span>
                                    )}
                                    {isViewPage && (
                                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                                        <Eye className="w-3 h-3 text-cyan-400" />
                                        Visualizzazione Schermata
                                      </span>
                                    )}
                                    {isAction && (
                                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                                        <Cpu className="w-3 h-3 text-purple-400" />
                                        Azione Operativa
                                      </span>
                                    )}
                                    {isAccessDenied && (
                                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                                        <ShieldAlert className="w-3 h-3 text-rose-400" />
                                        Accesso Bloccato (Permesso Mancante)
                                      </span>
                                    )}

                                    {/* Badge Utente */}
                                    <button
                                      onClick={() => setSelectedLogUserId(log.userId)}
                                      className="px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-white font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                                      title={`Filtra solo le cose viste da @${log.username}`}
                                    >
                                      <User className="w-3 h-3 text-gray-400" />
                                      <span>@{log.username}</span>
                                      <span className={`text-[9px] uppercase px-1 rounded ${
                                        log.userRole === 'admin' ? 'bg-quantum-primary/20 text-quantum-primary' : 'bg-cyan-500/20 text-cyan-300'
                                      }`}>
                                        {log.userRole}
                                      </span>
                                    </button>
                                  </div>

                                  {/* Data e Ora esatta di Accesso */}
                                  <div className="flex items-center gap-2 text-[11px] text-gray-400 shrink-0">
                                    <Clock className="w-3.5 h-3.5 text-gray-500" />
                                    <span className="text-gray-200 font-semibold">{timeMeta.formatted}</span>
                                    <span className="text-cyan-400 bg-cyan-950/50 px-1.5 py-0.2 rounded border border-cyan-800/40 text-[10px]">
                                      {timeMeta.relative}
                                    </span>
                                  </div>
                                </div>

                                {/* BOX IN EVIDENZA: COSA VEDE DELL'APPLICAZIONE */}
                                <div className="p-3 rounded-xl bg-black/60 border border-cyan-500/25 shadow-[0_0_15px_rgba(6,182,212,0.06)] flex flex-col gap-1.5">
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                      <Eye className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                                      <span className="text-[10px] uppercase tracking-wider text-cyan-300 font-bold">
                                        COSA VEDE / SEZIONE VISUALIZZATA:
                                      </span>
                                    </div>
                                    {log.targetId && (
                                      <span className="px-2 py-0.5 text-[9px] font-mono rounded bg-white/10 text-gray-300 border border-white/10">
                                        Target: {log.targetId}
                                      </span>
                                    )}
                                  </div>

                                  <div className="text-sm font-bold text-white flex items-center gap-2 font-sans">
                                    <span>{log.actionName}</span>
                                  </div>

                                  <p className="text-xs text-gray-200 font-sans leading-relaxed">
                                    {log.viewDetail}
                                  </p>

                                  {/* Snapshot Permessi all'accesso */}
                                  {(log.allowedIconsSnapshot || log.allowedCategoriesSnapshot) && (
                                    <div className="mt-1 pt-1.5 border-t border-white/5 flex flex-wrap items-center gap-2 text-[10px] text-gray-400 font-mono">
                                      <span className="text-gray-500">Permessi attivi al momento dell'accesso:</span>
                                      {log.allowedIconsSnapshot && (
                                        <span className="px-2 py-0.5 rounded bg-cyan-950/40 text-cyan-300 border border-cyan-800/40 font-bold">
                                          {log.allowedIconsSnapshot.length}/{ALL_APP_ICONS.length} Moduli Abilitati
                                        </span>
                                      )}
                                      {log.allowedCategoriesSnapshot && (
                                        <span className="px-2 py-0.5 rounded bg-purple-950/40 text-purple-300 border border-purple-800/40 font-bold">
                                          {log.allowedCategoriesSnapshot.length}/{ALL_AGENT_AI_CATEGORIES.length} Categorie AI Abilitate
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>

                                {/* Riga Inferiore: Indirizzo IP, Dispositivo e Azione Ispeziona */}
                                <div className="mt-2.5 pt-2 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-gray-400">
                                  <div className="flex flex-wrap items-center gap-3">
                                    <span className="flex items-center gap-1">
                                      <Globe className="w-3 h-3 text-gray-500" />
                                      <span>IP: <strong className="text-gray-300">{log.ipAddress || '127.0.0.1'}</strong></span>
                                    </span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1">
                                      <Monitor className="w-3 h-3 text-gray-500" />
                                      <span>Dispositivo: <strong className="text-gray-300">{log.deviceInfo || 'Browser'}</strong></span>
                                    </span>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => setInspectingLog(log)}
                                    className="px-2.5 py-1 bg-white/5 hover:bg-cyan-500/20 text-gray-300 hover:text-cyan-300 border border-white/10 hover:border-cyan-500/40 rounded-lg text-[10px] transition-all cursor-pointer flex items-center gap-1"
                                  >
                                    <Code2 className="w-3 h-3 text-cyan-400" />
                                    <span>Ispeziona JSON Tecnico</span>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-black/40 flex items-center justify-between">
          <span className="text-[10px] text-gray-500 font-mono">
            Access Control • Spark Quantum RBAC Layer v3.1
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white font-medium text-xs rounded-xl transition-colors cursor-pointer"
          >
            Chiudi Console
          </button>
        </div>
      </div>

      {/* SUB-MODAL: Add New User */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#0e1726] border border-quantum-primary/40 rounded-3xl p-6 shadow-2xl text-white animate-fadeIn">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-quantum-primary" />
                <h3 className="font-display font-bold uppercase text-sm">Crea Nuovo Utente</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5 font-mono text-xs">
              <div>
                <label className="block text-[10px] uppercase text-gray-400 mb-1">Username *</label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="es. mrossi"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2 text-white placeholder:text-gray-600 focus:ring-1 focus:ring-quantum-primary outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] uppercase text-gray-400">Password Iniziale * (min. 3 car.)</label>
                  <button
                    type="button"
                    onClick={() => setNewPassword('demo2026')}
                    className="text-[9px] text-quantum-primary hover:underline cursor-pointer"
                  >
                    Suggerisci: demo2026
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showAddPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 3 caratteri..."
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2 pr-10 text-white placeholder:text-gray-600 focus:ring-1 focus:ring-quantum-primary outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAddPassword(!showAddPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white cursor-pointer"
                    title={showAddPassword ? 'Nascondi' : 'Mostra password in chiaro'}
                  >
                    {showAddPassword ? <EyeOff className="w-3.5 h-3.5 text-cyan-300" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-gray-400 mb-1">Nome Completo</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="es. Mario Rossi"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2 text-white placeholder:text-gray-600 focus:ring-1 focus:ring-quantum-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-gray-400 mb-1">Email Aziendale</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="es. m.rossi@company.com"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2 text-white placeholder:text-gray-600 focus:ring-1 focus:ring-quantum-primary outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase text-gray-400 mb-1">Ruolo</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="w-full bg-[#0b0f19] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:ring-1 focus:ring-quantum-primary"
                  >
                    <option value="user">Utente Standard</option>
                    <option value="admin">Amministratore</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase text-gray-400 mb-1">Stato</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as UserStatus)}
                    className="w-full bg-[#0b0f19] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:ring-1 focus:ring-quantum-primary"
                  >
                    <option value="active">Attivo</option>
                    <option value="suspended">Sospeso</option>
                  </select>
                </div>
              </div>

              {/* Icon Permissions in Add User */}
              {newRole === 'user' && (
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] uppercase text-gray-400 font-bold flex items-center gap-1.5">
                      <Sliders className="w-3 h-3 text-quantum-primary" />
                      Accesso Icone ({newAllowedIcons.length}/{ALL_APP_ICONS.length})
                    </label>
                    <div className="flex items-center gap-1.5 text-[9px] font-mono">
                      <button
                        type="button"
                        onClick={() => setNewAllowedIcons(ALL_APP_ICON_IDS)}
                        className="text-quantum-primary hover:underline cursor-pointer"
                      >
                        Tutte
                      </button>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={() => setNewAllowedIcons([])}
                        className="text-red-400 hover:underline cursor-pointer"
                      >
                        Nessuna
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto pr-1">
                    {ALL_APP_ICONS.map((icon) => (
                      <label
                        key={icon.id}
                        className="flex items-center gap-2 p-1.5 rounded-lg bg-black/30 border border-white/5 text-[10px] cursor-pointer hover:bg-white/5"
                      >
                        <input
                          type="checkbox"
                          checked={newAllowedIcons.includes(icon.id)}
                          onChange={() => {
                            setNewAllowedIcons(prev => 
                              prev.includes(icon.id) ? prev.filter(i => i !== icon.id) : [...prev, icon.id]
                            );
                          }}
                          className="rounded border-white/20 text-quantum-primary focus:ring-0"
                        />
                        <span className="truncate">{icon.name}</span>
                      </label>
                    ))}
                  </div>

                  {/* Categorie Agents AI in Add User */}
                  <div className="pt-3 mt-3 border-t border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[10px] uppercase text-purple-300 font-bold flex items-center gap-1.5">
                        <Cpu className="w-3 h-3 text-purple-400" />
                        Categorie Agents AI ({newAllowedCategories.length}/{ALL_AGENT_AI_CATEGORIES.length})
                      </label>
                      <div className="flex items-center gap-1.5 text-[9px] font-mono">
                        <button
                          type="button"
                          onClick={() => setNewAllowedCategories(ALL_AGENT_AI_CATEGORY_IDS)}
                          className="text-purple-400 hover:underline cursor-pointer"
                        >
                          Tutte
                        </button>
                        <span>•</span>
                        <button
                          type="button"
                          onClick={() => setNewAllowedCategories([])}
                          className="text-red-400 hover:underline cursor-pointer"
                        >
                          Nessuna
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-32 overflow-y-auto pr-1">
                      {ALL_AGENT_AI_CATEGORIES.map((cat) => (
                        <label
                          key={cat.id}
                          className="flex items-center gap-2 p-1.5 rounded-lg bg-purple-950/20 border border-purple-500/20 text-[10px] cursor-pointer hover:bg-purple-950/40"
                        >
                          <input
                            type="checkbox"
                            checked={newAllowedCategories.includes(cat.id)}
                            onChange={() => {
                              setNewAllowedCategories(prev => 
                                prev.includes(cat.id) ? prev.filter(c => c !== cat.id) : [...prev, cat.id]
                              );
                            }}
                            className="rounded border-purple-500/30 text-purple-500 focus:ring-0"
                          />
                          <span className="text-xs shrink-0">{cat.icon}</span>
                          <span className="truncate text-slate-200">{cat.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-colors"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-quantum-primary text-black font-bold uppercase rounded-xl hover:bg-cyan-300 transition-colors"
                >
                  Crea Utente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUB-MODAL: Edit User */}
      {editingUser && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#0e1726] border border-cyan-500/40 rounded-3xl p-6 shadow-2xl text-white animate-fadeIn">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-cyan-300" />
                <h3 className="font-display font-bold uppercase text-sm">Modifica: @{editingUser.username}</h3>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 font-mono text-xs">
              <div>
                <label className="block text-[10px] uppercase text-gray-400 mb-1">Username *</label>
                <input
                  type="text"
                  required
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2 text-white focus:ring-1 focus:ring-quantum-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-gray-400 mb-1">Nome Completo</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2 text-white focus:ring-1 focus:ring-quantum-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-gray-400 mb-1">Email Aziendale</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2 text-white focus:ring-1 focus:ring-quantum-primary outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] uppercase text-gray-400">
                    Reset Password (lascia vuoto per mantenere)
                  </label>
                  {editingUser && (
                    <span className="text-[9px] text-gray-400 font-mono">
                      Password Attuale: <strong className="text-amber-300 font-bold">{editingUser.password}</strong>
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showEditPassword ? 'text' : 'password'}
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Nuova password (min. 3 caratteri)..."
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2 pr-10 text-white placeholder:text-gray-600 focus:ring-1 focus:ring-quantum-primary outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword(!showEditPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white cursor-pointer"
                    title={showEditPassword ? 'Nascondi' : 'Mostra password in chiaro'}
                  >
                    {showEditPassword ? <EyeOff className="w-3.5 h-3.5 text-cyan-300" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase text-gray-400 mb-1">Ruolo</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as UserRole)}
                    className="w-full bg-[#0b0f19] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:ring-1 focus:ring-quantum-primary"
                  >
                    <option value="user">Utente Standard</option>
                    <option value="admin">Amministratore</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase text-gray-400 mb-1">Stato</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as UserStatus)}
                    className="w-full bg-[#0b0f19] border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:ring-1 focus:ring-quantum-primary"
                  >
                    <option value="active">Attivo</option>
                    <option value="suspended">Sospeso</option>
                  </select>
                </div>
              </div>

              {/* Icon Permissions in Edit User */}
              {editRole === 'user' && (
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] uppercase text-gray-400 font-bold flex items-center gap-1.5">
                      <Sliders className="w-3 h-3 text-cyan-400" />
                      Accesso Icone ({editAllowedIcons.length}/{ALL_APP_ICONS.length})
                    </label>
                    <div className="flex items-center gap-1.5 text-[9px] font-mono">
                      <button
                        type="button"
                        onClick={() => setEditAllowedIcons(ALL_APP_ICON_IDS)}
                        className="text-cyan-300 hover:underline cursor-pointer"
                      >
                        Tutte
                      </button>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={() => setEditAllowedIcons([])}
                        className="text-red-400 hover:underline cursor-pointer"
                      >
                        Nessuna
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto pr-1">
                    {ALL_APP_ICONS.map((icon) => (
                      <label
                        key={icon.id}
                        className="flex items-center gap-2 p-1.5 rounded-lg bg-black/30 border border-white/5 text-[10px] cursor-pointer hover:bg-white/5"
                      >
                        <input
                          type="checkbox"
                          checked={editAllowedIcons.includes(icon.id)}
                          onChange={() => {
                            setEditAllowedIcons(prev => 
                              prev.includes(icon.id) ? prev.filter(i => i !== icon.id) : [...prev, icon.id]
                            );
                          }}
                          className="rounded border-white/20 text-cyan-400 focus:ring-0"
                        />
                        <span className="truncate">{icon.name}</span>
                      </label>
                    ))}
                  </div>

                  {/* Categorie Agents AI in Edit User */}
                  <div className="pt-3 mt-3 border-t border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[10px] uppercase text-purple-300 font-bold flex items-center gap-1.5">
                        <Cpu className="w-3 h-3 text-purple-400" />
                        Categorie Agents AI ({editAllowedCategories.length}/{ALL_AGENT_AI_CATEGORIES.length})
                      </label>
                      <div className="flex items-center gap-1.5 text-[9px] font-mono">
                        <button
                          type="button"
                          onClick={() => setEditAllowedCategories(ALL_AGENT_AI_CATEGORY_IDS)}
                          className="text-purple-400 hover:underline cursor-pointer"
                        >
                          Tutte
                        </button>
                        <span>•</span>
                        <button
                          type="button"
                          onClick={() => setEditAllowedCategories([])}
                          className="text-red-400 hover:underline cursor-pointer"
                        >
                          Nessuna
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-32 overflow-y-auto pr-1">
                      {ALL_AGENT_AI_CATEGORIES.map((cat) => (
                        <label
                          key={cat.id}
                          className="flex items-center gap-2 p-1.5 rounded-lg bg-purple-950/20 border border-purple-500/20 text-[10px] cursor-pointer hover:bg-purple-950/40"
                        >
                          <input
                            type="checkbox"
                            checked={editAllowedCategories.includes(cat.id)}
                            onChange={() => {
                              setEditAllowedCategories(prev => 
                                prev.includes(cat.id) ? prev.filter(c => c !== cat.id) : [...prev, cat.id]
                              );
                            }}
                            className="rounded border-purple-500/30 text-purple-500 focus:ring-0"
                          />
                          <span className="text-xs shrink-0">{cat.icon}</span>
                          <span className="truncate text-slate-200">{cat.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-colors"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-cyan-400 text-black font-bold uppercase rounded-xl hover:bg-cyan-300 transition-colors"
                >
                  Salva Modifiche
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUB-MODAL: Manage Permissions (Icons & Agents AI Categories) for User */}
      {managingIconsUser && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn select-none text-white">
          <div 
            className="relative w-full max-w-2xl max-h-[90vh] bg-[#0c1322] border border-cyan-500/40 rounded-3xl p-5 sm:p-7 shadow-[0_0_50px_rgba(6,182,212,0.2)] flex flex-col text-white overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-2xl border ${
                  permissionsActiveTab === 'icons' 
                    ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300' 
                    : 'bg-purple-500/10 border-purple-500/30 text-purple-300'
                }`}>
                  {permissionsActiveTab === 'icons' ? <Sliders className="w-5 h-5" /> : <Cpu className="w-5 h-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold uppercase text-sm sm:text-base tracking-wider text-white">
                      Permessi Accesso Utente
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
                      @{managingIconsUser.username}
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-gray-400 font-mono">
                    Configura visibilità e accesso alle icone di sistema e alle singole categorie di Agents AI
                  </p>
                </div>
              </div>

              <button
                onClick={() => setManagingIconsUser(null)}
                className="p-1.5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Navigation (Icone Portale vs Categorie Agents AI) */}
            <div className="flex items-center gap-2 p-1.5 bg-black/40 rounded-2xl border border-white/10 mb-3">
              <button
                type="button"
                onClick={() => setPermissionsActiveTab('icons')}
                className={`flex-1 py-2 px-3 rounded-xl font-bold font-mono text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  permissionsActiveTab === 'icons'
                    ? 'bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Icone Portale ({userSelectedIcons.length}/{ALL_APP_ICONS.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setPermissionsActiveTab('agent_ai')}
                className={`flex-1 py-2 px-3 rounded-xl font-bold font-mono text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  permissionsActiveTab === 'agent_ai'
                    ? 'bg-purple-500/20 border border-purple-400/50 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Categorie Agents AI ({userSelectedCategories.length}/{ALL_AGENT_AI_CATEGORIES.length})</span>
              </button>
            </div>

            {/* If user is admin */}
            {managingIconsUser.role === 'admin' ? (
              <div className="p-4 rounded-2xl bg-quantum-primary/10 border border-quantum-primary/30 text-quantum-primary font-mono text-xs mb-4 flex items-center gap-3">
                <Shield className="w-5 h-5 shrink-0" />
                <div>
                  <strong className="block text-white uppercase text-[11px]">Privilegi Amministratore (CSO)</strong>
                  Gli account con ruolo Amministratore hanno accesso permanente e incondizionato a tutte le icone del sistema e a tutte le categorie Agents AI.
                </div>
              </div>
            ) : (
              <>
                {/* TAB 1: ICON PERMISSIONS */}
                {permissionsActiveTab === 'icons' && (
                  <>
                    {/* Presets & Quick Action Toolbar for Icons */}
                    <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-white/[0.02] border border-white/5 rounded-2xl mb-3 font-mono text-[11px]">
                      <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Presets Rapidi Icone:</span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setUserSelectedIcons(ALL_APP_ICON_IDS)}
                          className="px-2 py-0.5 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/10 text-[10px] transition-colors cursor-pointer"
                        >
                          Abilita Tutte
                        </button>
                        <button
                          type="button"
                          onClick={() => setUserSelectedIcons([])}
                          className="px-2 py-0.5 bg-red-500/10 hover:bg-red-500/20 text-red-300 rounded-lg border border-red-500/20 text-[10px] transition-colors cursor-pointer"
                        >
                          Disabilita Tutte
                        </button>
                        <button
                          type="button"
                          onClick={() => setUserSelectedIcons(['agent_ai', 'realq'])}
                          className="px-2 py-0.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 rounded-lg border border-cyan-500/20 text-[10px] transition-colors cursor-pointer"
                        >
                          Solo Base
                        </button>
                        <button
                          type="button"
                          onClick={() => setUserSelectedIcons(['pqc_group', 'realq'])}
                          className="px-2 py-0.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 rounded-lg border border-emerald-500/20 text-[10px] transition-colors cursor-pointer"
                        >
                          Solo PQC
                        </button>
                        <button
                          type="button"
                          onClick={() => setUserSelectedIcons(['agent_ai', 'send_to_ibm', 'mitigation'])}
                          className="px-2 py-0.5 bg-quantum-primary/10 hover:bg-quantum-primary/20 text-quantum-primary rounded-lg border border-quantum-primary/20 text-[10px] transition-colors cursor-pointer"
                        >
                          Full Quantum
                        </button>
                      </div>
                    </div>

                    {/* Icons Grid with Scroll */}
                    <div className="flex-1 overflow-y-auto pr-1 space-y-2 max-h-[46vh] font-mono">
                      {ALL_APP_ICONS.map((appIcon) => {
                        const isChecked = userSelectedIcons.includes(appIcon.id);
                        const IconComp = PERMISSION_ICON_MAP[appIcon.icon] || Cpu;

                        return (
                          <div
                            key={appIcon.id}
                            onClick={() => handleToggleUserIcon(appIcon.id)}
                            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                              isChecked
                                ? 'bg-cyan-950/30 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                                : 'bg-white/[0.01] border-white/5 opacity-60 hover:opacity-85 hover:border-white/20'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-xl border mt-0.5 ${
                                isChecked
                                  ? 'bg-cyan-500/15 border-cyan-400/40 text-cyan-300'
                                  : 'bg-white/5 border-white/10 text-gray-500'
                              }`}>
                                <IconComp className="w-4 h-4" />
                              </div>

                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-white text-xs">{appIcon.name}</span>
                                  <span className={`px-1.5 py-0.2 text-[9px] uppercase font-bold rounded ${
                                    appIcon.category === 'core'
                                      ? 'bg-quantum-primary/20 text-quantum-primary'
                                      : appIcon.category === 'quantum'
                                      ? 'bg-cyan-500/20 text-cyan-300'
                                      : appIcon.category === 'security'
                                      ? 'bg-emerald-500/20 text-emerald-300'
                                      : 'bg-amber-500/20 text-amber-300'
                                  }`}>
                                    {appIcon.category}
                                  </span>
                                </div>
                                <p className="text-[11px] text-gray-400 mt-0.5 font-sans leading-relaxed">
                                  {appIcon.description}
                                </p>
                              </div>
                            </div>

                            <div className="shrink-0 mt-1">
                              {isChecked ? (
                                <CheckSquare className="w-5 h-5 text-cyan-400" />
                              ) : (
                                <Square className="w-5 h-5 text-gray-600" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* TAB 2: AGENTS AI CATEGORIES PERMISSIONS */}
                {permissionsActiveTab === 'agent_ai' && (
                  <>
                    {/* Presets & Quick Action Toolbar for Categories */}
                    <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-white/[0.02] border border-white/5 rounded-2xl mb-3 font-mono text-[11px]">
                      <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Presets Categorie:</span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setUserSelectedCategories(ALL_AGENT_AI_CATEGORY_IDS)}
                          className="px-2 py-0.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 rounded-lg border border-purple-500/30 text-[10px] transition-colors cursor-pointer"
                        >
                          Abilita Tutte (7)
                        </button>
                        <button
                          type="button"
                          onClick={() => setUserSelectedCategories([])}
                          className="px-2 py-0.5 bg-red-500/10 hover:bg-red-500/20 text-red-300 rounded-lg border border-red-500/20 text-[10px] transition-colors cursor-pointer"
                        >
                          Disabilita Tutte (0)
                        </button>
                        <button
                          type="button"
                          onClick={() => setUserSelectedCategories(['Finanza e Mercati', 'Logistica e Supply Chain'])}
                          className="px-2 py-0.5 bg-white/5 hover:bg-white/10 text-slate-200 rounded-lg border border-white/10 text-[10px] transition-colors cursor-pointer"
                        >
                          Finanza & Logistica
                        </button>
                        <button
                          type="button"
                          onClick={() => setUserSelectedCategories(['Energia e Utilities', 'Chimica, Farmaceutica e Materiali'])}
                          className="px-2 py-0.5 bg-white/5 hover:bg-white/10 text-slate-200 rounded-lg border border-white/10 text-[10px] transition-colors cursor-pointer"
                        >
                          Energia & Chimica
                        </button>
                        <button
                          type="button"
                          onClick={() => setUserSelectedCategories(['Sanità e Genomica', 'Sicurezza, Telecomunicazioni e Reti'])}
                          className="px-2 py-0.5 bg-white/5 hover:bg-white/10 text-slate-200 rounded-lg border border-white/10 text-[10px] transition-colors cursor-pointer"
                        >
                          Sanità & Sicurezza
                        </button>
                      </div>
                    </div>

                    {/* Categories List with Scroll */}
                    <div className="flex-1 overflow-y-auto pr-1 space-y-2 max-h-[46vh] font-mono">
                      {ALL_AGENT_AI_CATEGORIES.map((cat) => {
                        const isChecked = userSelectedCategories.includes(cat.id);

                        return (
                          <div
                            key={cat.id}
                            onClick={() => handleToggleUserCategory(cat.id)}
                            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                              isChecked
                                ? 'bg-purple-950/30 border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.12)]'
                                : 'bg-white/[0.01] border-white/5 opacity-60 hover:opacity-85 hover:border-white/20'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-xl shrink-0 mt-0.5 ${
                                isChecked
                                  ? 'bg-purple-500/20 border-purple-400/40 text-white shadow-inner'
                                  : 'bg-white/5 border-white/10 text-gray-400'
                              }`}>
                                {cat.icon}
                              </div>

                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-white text-xs">{cat.name}</span>
                                  <span className="px-2 py-0.5 text-[9px] font-mono font-bold rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                    {cat.scenarioCount} scenari
                                  </span>
                                </div>
                                <p className="text-[11px] text-gray-400 mt-1 font-sans leading-relaxed">
                                  {cat.description}
                                </p>
                              </div>
                            </div>

                            <div className="shrink-0 mt-1">
                              {isChecked ? (
                                <CheckSquare className="w-5 h-5 text-purple-400" />
                              ) : (
                                <Square className="w-5 h-5 text-gray-600" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </>
            )}

            {/* Footer */}
            <div className="pt-3.5 border-t border-white/10 mt-3 flex flex-col sm:flex-row items-center justify-between gap-2 font-mono text-xs">
              <div className="text-gray-400 text-[11px] flex items-center gap-2">
                {managingIconsUser.role === 'admin' ? (
                  <span>Tutte le icone e categorie consentite (Admin)</span>
                ) : (
                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="inline-flex items-center gap-1 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30 text-cyan-300">
                      <Sliders className="w-3 h-3" />
                      <strong>{userSelectedIcons.length}/{ALL_APP_ICONS.length}</strong> Icone
                    </span>
                    <span className="inline-flex items-center gap-1 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/30 text-purple-300">
                      <Cpu className="w-3 h-3" />
                      <strong>{userSelectedCategories.length}/{ALL_AGENT_AI_CATEGORIES.length}</strong> Categorie AI
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => setManagingIconsUser(null)}
                  className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-colors cursor-pointer"
                >
                  Chiudi
                </button>
                {managingIconsUser.role !== 'admin' && (
                  <button
                    type="button"
                    onClick={handleSaveAllPermissions}
                    className="px-4 py-1.5 bg-gradient-to-r from-cyan-400 to-purple-400 hover:from-cyan-300 hover:to-purple-300 text-black font-bold uppercase rounded-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                  >
                    Salva Permessi
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-MODAL: Ispezione Dettaglio Tecnico Log */}
      {inspectingLog && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-2xl bg-[#0b1322] border border-cyan-500/40 rounded-3xl p-6 shadow-2xl text-white font-mono text-xs max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="font-display font-bold uppercase text-sm text-white">
                    Dettaglio Tecnico Evento di Audit
                  </h3>
                  <span className="text-[10px] text-gray-400 font-mono">
                    ID: {inspectingLog.id}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setInspectingLog(null)}
                className="p-1.5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
              {/* Tabella Metadati */}
              <div className="grid grid-cols-2 gap-2 text-[11px] p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <div>
                  <span className="text-gray-500 block">Data e Ora (ISO):</span>
                  <span className="text-white font-bold">{inspectingLog.timestamp}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Tipo di Evento:</span>
                  <span className="text-cyan-300 font-bold uppercase">{inspectingLog.type}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Utente Autenticato:</span>
                  <span className="text-white">@{inspectingLog.username} ({inspectingLog.userRole})</span>
                </div>
                <div>
                  <span className="text-gray-500 block">ID Utente:</span>
                  <span className="text-gray-300">{inspectingLog.userId}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Indirizzo IP:</span>
                  <span className="text-white">{inspectingLog.ipAddress || '127.0.0.1'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Dispositivo / User-Agent:</span>
                  <span className="text-gray-300 truncate block">{inspectingLog.deviceInfo || 'Browser Web'}</span>
                </div>
              </div>

              {/* Cosa Vede nell'App */}
              <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 space-y-1.5">
                <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-[11px] uppercase tracking-wider">
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Cosa Vede dell'Applicazione in Questo Evento:</span>
                </div>
                <div className="font-bold text-white text-xs">
                  {inspectingLog.actionName}
                </div>
                <div className="text-xs text-gray-200 font-sans leading-relaxed">
                  {inspectingLog.viewDetail}
                </div>
                {inspectingLog.targetId && (
                  <div className="text-[10px] text-gray-400 pt-1">
                    Modulo Target ID: <strong className="text-white">{inspectingLog.targetId}</strong>
                  </div>
                )}
              </div>

              {/* Snapshot permessi */}
              {(inspectingLog.allowedIconsSnapshot || inspectingLog.allowedCategoriesSnapshot) && (
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5 text-[10px]">
                  <span className="text-gray-400 font-bold uppercase block">Snapshot Permessi al Momento dell'Evento:</span>
                  {inspectingLog.allowedIconsSnapshot && (
                    <div>
                      <span className="text-gray-500">Icone/Moduli ({inspectingLog.allowedIconsSnapshot.length}):</span>{' '}
                      <span className="text-cyan-300">{inspectingLog.allowedIconsSnapshot.join(', ')}</span>
                    </div>
                  )}
                  {inspectingLog.allowedCategoriesSnapshot && (
                    <div>
                      <span className="text-gray-500">Categorie Agent AI ({inspectingLog.allowedCategoriesSnapshot.length}):</span>{' '}
                      <span className="text-purple-300">{inspectingLog.allowedCategoriesSnapshot.join(', ')}</span>
                    </div>
                  )}
                </div>
              )}

              {/* JSON Raw Code Block */}
              <div>
                <div className="flex items-center justify-between mb-1 text-[10px] text-gray-400 uppercase">
                  <span>Record JSON Nativo:</span>
                  <button
                    onClick={() => handleCopyLogJson(inspectingLog)}
                    className="text-cyan-400 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    {copiedLogJsonId === inspectingLog.id ? (
                      <>
                        <Check className="w-3 h-3 text-green-400" />
                        <span className="text-green-400">Copiato!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copia JSON</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3 bg-black/60 border border-white/10 rounded-xl overflow-x-auto text-[10px] text-gray-300 leading-normal">
                  {JSON.stringify(inspectingLog, null, 2)}
                </pre>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 mt-3 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => handleCopyLogJson(inspectingLog)}
                className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copia negli Appunti</span>
              </button>
              <button
                type="button"
                onClick={() => setInspectingLog(null)}
                className="px-4 py-1.5 bg-quantum-primary text-black font-bold uppercase rounded-xl text-xs hover:bg-cyan-300 transition-colors cursor-pointer"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
