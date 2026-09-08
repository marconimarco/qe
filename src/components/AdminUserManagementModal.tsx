import React, { useState, useEffect } from 'react';
import { 
  X, Users, UserPlus, UserCheck, UserX, Shield, Edit3, Trash2, Key, 
  Search, Check, AlertCircle, RefreshCw, Lock, Mail, User, ShieldAlert,
  RotateCcw, Download, Sparkles
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
  resetUsersDatabase
} from '../services/authService';

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
    const res = createNewUser(currentUser.role, {
      username: newUsername,
      password: newPassword,
      name: newName,
      email: newEmail,
      role: newRole,
      status: newStatus
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
  };

  // Handle Save Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const updates: Partial<AuthUser> = {
      username: editUsername,
      name: editName,
      email: editEmail,
      role: editRole,
      status: editStatus
    };

    if (editPassword.trim()) {
      if (editPassword.length < 6) {
        showToast('error', 'La nuova password deve contenere almeno 6 caratteri.');
        return;
      }
      updates.password = editPassword;
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
            lastLogin: refreshed.lastLogin
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

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-gray-400 mt-1">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-gray-500" />
                            {user.email}
                          </span>
                          <span>•</span>
                          <span>
                            Ruolo: <strong className={user.role === 'admin' ? 'text-quantum-primary uppercase' : 'text-cyan-300 uppercase'}>{user.role}</strong>
                          </span>
                          <span>•</span>
                          <span>
                            Creato: {new Date(user.createdAt).toLocaleDateString()}
                          </span>
                          <span>•</span>
                          <span className={user.hasAcceptedAgreements ? 'text-green-400' : 'text-amber-400'}>
                            Consenso: {user.hasAcceptedAgreements ? 'Accettato' : 'In attesa primo login'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
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
                <label className="block text-[10px] uppercase text-gray-400 mb-1">Password Iniziale * (min. 6 car.)</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2 text-white placeholder:text-gray-600 focus:ring-1 focus:ring-quantum-primary outline-none"
                />
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
                <label className="block text-[10px] uppercase text-gray-400 mb-1">
                  Reset Password (lascia vuoto per non cambiare)
                </label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Nuova password..."
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2 text-white placeholder:text-gray-600 focus:ring-1 focus:ring-quantum-primary outline-none"
                />
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
    </div>
  );
}
