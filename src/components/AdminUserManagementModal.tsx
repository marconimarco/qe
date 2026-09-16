import React, { useState, useEffect } from 'react';
import { 
  X, Users, UserPlus, UserCheck, UserX, Shield, Edit3, Trash2, Key, 
  Search, Check, AlertCircle, RefreshCw, Lock, Mail, User, ShieldAlert,
  RotateCcw, Download, Sparkles, Sliders, CheckSquare, Square,
  Cpu, Terminal, Languages, Code2, HelpCircle, Eye, EyeOff, Copy
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
  AgentAiCategoryPermission
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

  const loadUsers = () => {
    setUsers(getStoredUsers());
  };

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

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
        className="relative w-full max-w-5xl max-h-[92vh] bg-gradient-to-b from-[#0f172a] to-[#070b13] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white"
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

        {/* Feedback Alert Toast */}
        {feedback && (
          <div className={`mx-4 sm:mx-6 mt-4 p-3 rounded-2xl border flex items-center gap-2.5 text-xs font-mono animate-fadeIn ${
            feedback.type === 'success'
              ? 'bg-green-500/10 border-green-500/30 text-green-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}>
            {feedback.type === 'success' ? <Check className="w-4 h-4 text-green-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
            <span>{feedback.message}</span>
          </div>
        )}

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
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
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
                          onClick={() => setUserSelectedIcons(['agent_ai', 'translator', 'realq'])}
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
                          onClick={() => setUserSelectedIcons(['agent_ai', 'send_to_ibm', 'translator', 'crosscode', 'mitigation'])}
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
    </div>
  );
}
