import React, { useState, useEffect } from 'react';
import SectorSelector from './components/SectorSelector';
import QuantumDashboard from './components/QuantumDashboard';
import LanguageSelector from './components/LanguageSelector';
import IBMQuantumInterface from './components/IBMQuantumInterface';
import ApiKeyModal from './components/ApiKeyModal';
import PrivacyPolicyModal from './components/PrivacyPolicyModal';
import DisclaimerModal from './components/DisclaimerModal';
import HelpModal from './components/HelpModal';
import LoginScreen from './components/LoginScreen';
import AdminUserManagementModal from './components/AdminUserManagementModal';
import FirstLoginAgreementModal from './components/FirstLoginAgreementModal';
import TestPage from './components/TestPage';
import { SectorId, SECTORS, LanguageCode } from './types';
import { TranslationProvider, useTranslation } from './lib/TranslationContext';
import { Cpu, Terminal, ArrowLeft, Layers, HelpCircle, Key, ShieldCheck, AlertCircle, User, LogOut, Users, Shield, Crown, AlertTriangle } from 'lucide-react';
import { getStoredApiKey } from './services/apiKeyService';
import { getCurrentSession, logoutUser, CurrentUserSession } from './services/authService';
import { motion } from 'motion/react';
import aiStudioPrompt from './promptText.txt?raw';
import { Check, Copy } from 'lucide-react';

export default function App() {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(() => {
    try {
      const saved = localStorage.getItem('quantum_language');
      if (saved && ['it', 'en', 'zh', 'ja', 'ko', 'de', 'fr', 'es', 'ru', 'uk'].includes(saved)) {
        return saved as LanguageCode;
      }
    } catch {}
    return 'it';
  });

  const handleLanguageChange = (lang: LanguageCode) => {
    setCurrentLanguage(lang);
    try {
      localStorage.setItem('quantum_language', lang);
    } catch {}
  };

  const [currentUser, setCurrentUser] = useState<CurrentUserSession | null>(() => {
    return getCurrentSession();
  });

  if (!currentUser) {
    return (
      <TranslationProvider language={currentLanguage}>
        <LoginScreen onLoginSuccess={(user) => setCurrentUser(user)} />
      </TranslationProvider>
    );
  }

  // Mandatory first-login check: if user has not accepted Disclaimer + Privacy Policy, display agreement modal
  if (!currentUser.hasAcceptedAgreements) {
    return (
      <TranslationProvider language={currentLanguage}>
        <FirstLoginAgreementModal
          currentUser={currentUser}
          onAccepted={(updated) => setCurrentUser(updated)}
          onDecline={() => {
            logoutUser();
            setCurrentUser(null);
          }}
        />
      </TranslationProvider>
    );
  }

  return (
    <TranslationProvider language={currentLanguage}>
      <AppContent 
        currentLanguage={currentLanguage} 
        setCurrentLanguage={handleLanguageChange} 
        currentUser={currentUser}
        onLogout={() => {
          logoutUser();
          setCurrentUser(null);
        }}
        onSessionUpdated={(updated) => setCurrentUser(updated)}
      />
    </TranslationProvider>
  );
}

function AppContent({ 
  currentLanguage, 
  setCurrentLanguage,
  currentUser,
  onLogout,
  onSessionUpdated
}: { 
  currentLanguage: LanguageCode; 
  setCurrentLanguage: (lang: LanguageCode) => void;
  currentUser: CurrentUserSession;
  onLogout: () => void;
  onSessionUpdated: (user: CurrentUserSession) => void;
}) {
  const { t } = useTranslation();
  
  // State management
  const [selectedSectorId, setSelectedSectorId] = useState<SectorId | null>(null);
  const [isSubMenuVisible, setIsSubMenuVisible] = useState(false);
  const [isIbmInterfaceOpen, setIsIbmInterfaceOpen] = useState(false);
  const [isTestPageOpen, setIsTestPageOpen] = useState(false);
  const [returnToSubMenu, setReturnToSubMenu] = useState<SectorId | null>(null);
  const [sharedQasm, setSharedQasm] = useState<string>('');
  
  // API Key modal state
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  // Privacy Policy modal state
  const [isPrivacyPolicyOpen, setIsPrivacyPolicyOpen] = useState(false);

  // Help modal state
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // Disclaimer modal state
  const [isDisclaimerModalOpen, setIsDisclaimerModalOpen] = useState(false);

  // Admin User Management modal state
  const [isAdminUsersModalOpen, setIsAdminUsersModalOpen] = useState(false);

  useEffect(() => {
    const key = getStoredApiKey();
    setHasApiKey(!!key);
  }, [isApiKeyModalOpen]);

  const selectedSector = SECTORS.find(s => s.id === selectedSectorId);

  const handleSelectSector = (id: SectorId) => {
    if (id === 'quantum_code' || id === 'send_to_ibm') {
      setIsIbmInterfaceOpen(true);
    } else if (id === 'realq') {
      setIsHelpModalOpen(true);
    } else {
      setSelectedSectorId(id);
    }
  };

  const handleBackFromDashboard = () => {
    setSelectedSectorId(null);
  };

  return (
    <div className="min-h-screen bg-quantum-bg selection:bg-quantum-primary selection:text-quantum-bg flex flex-col overflow-x-hidden overflow-y-auto scrollbar-hide relative text-white">
      
      {/* Dynamic flowing background gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-quantum-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-quantum-secondary/5 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
      </div>

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onKeySaved={() => setHasApiKey(!!getStoredApiKey())}
      />

      {/* Privacy Policy Modal */}
      <PrivacyPolicyModal
        isOpen={isPrivacyPolicyOpen}
        onClose={() => setIsPrivacyPolicyOpen(false)}
        canEdit={currentUser.role === 'admin'}
        canDownload={currentUser.role === 'admin'}
      />

      {/* Help Modal */}
      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        currentUser={currentUser}
        onNavigateToSection={(sectionId) => {
          handleSelectSector(sectionId as SectorId);
        }}
      />

      {/* Disclaimer Modal (Modifiable by Admin) */}
      <DisclaimerModal
        isOpen={isDisclaimerModalOpen}
        onClose={() => setIsDisclaimerModalOpen(false)}
        canEdit={currentUser.role === 'admin'}
      />

      {/* Admin User Management Modal (Only for admins) */}
      {currentUser.role === 'admin' && (
        <AdminUserManagementModal
          isOpen={isAdminUsersModalOpen}
          onClose={() => setIsAdminUsersModalOpen(false)}
          currentUser={currentUser}
          onSessionUpdated={onSessionUpdated}
        />
      )}

      {/* Top Banner if API Key is missing */}
      {!hasApiKey && (
        <div className="relative z-50 bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 text-center text-xs text-amber-200 flex items-center justify-center gap-2 font-mono">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Google AI Studio API Key not found. Please enter your API Key to enable AI features.</span>
          <button
            onClick={() => setIsApiKeyModalOpen(true)}
            className="px-2.5 py-0.5 bg-amber-400 text-black font-bold uppercase text-[10px] rounded hover:bg-amber-300 transition-colors ml-2 cursor-pointer"
          >
            Enter Key
          </button>
        </div>
      )}

      {/* Elegant glassmorphism Top Header bar */}
      <header className="relative z-50 w-full px-3 sm:px-6 py-2.5 sm:py-3.5 mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-2 border-b border-white/5 bg-black/40 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-quantum-primary animate-pulse shrink-0" />
          <span className="font-display font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[11px] sm:text-sm bg-gradient-to-r from-white via-gray-300 to-quantum-primary bg-clip-text text-transparent">
            {t('quantum_systems')}
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Admin User Management Button */}
          {currentUser.role === 'admin' && (
            <button
              id="header-admin-users-btn"
              onClick={() => setIsAdminUsersModalOpen(true)}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl border border-quantum-primary/30 bg-quantum-primary/10 hover:bg-quantum-primary/20 text-quantum-primary text-[10px] sm:text-xs font-mono transition-all cursor-pointer shadow-[0_0_10px_rgba(0,242,255,0.15)]"
              title="Apri pannello di controllo e gestione utenti"
            >
              <Users className="w-3.5 h-3.5 shrink-0" />
              <span className="font-bold hidden md:inline">{t('user_management')}</span>
              <span className="font-bold md:hidden">{t('user_management')}</span>
            </button>
          )}

          {/* Admin Disclaimer Button */}
          {currentUser.role === 'admin' && (
            <button
              id="header-admin-disclaimer-btn"
              onClick={() => setIsDisclaimerModalOpen(true)}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-[10px] sm:text-xs font-mono transition-all cursor-pointer shadow-[0_0_10px_rgba(245,158,11,0.15)]"
              title="Visualizza e modifica il General Disclaimer (88 Articoli)"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="font-bold hidden sm:inline">{t('disclaimer')}</span>
              <span className="font-bold sm:hidden">{t('disclaimer')}</span>
            </button>
          )}

          {/* API Key configuration button */}
          <button
            onClick={() => setIsApiKeyModalOpen(true)}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-[10px] sm:text-xs font-mono transition-all cursor-pointer"
            title="Configura Google API Key"
          >
            <Key className="w-3.5 h-3.5 text-quantum-primary shrink-0" />
            <span className="hidden lg:inline">{t('api_key')}</span>
            {hasApiKey ? (
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
            )}
          </button>

          {/* Logged in User Profile badge */}
          <div className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 bg-white/[0.03] border border-white/10 rounded-xl text-[10px] sm:text-xs font-mono">
            {currentUser.role === 'admin' ? (
              <Crown className="w-3.5 h-3.5 text-quantum-primary shrink-0" />
            ) : (
              <User className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
            )}
            <span className="text-white font-bold max-w-[80px] sm:max-w-[120px] truncate">
              {currentUser.username === 'admin' ? t('role_chief_officer') : currentUser.name.split(' ')[0]}
            </span>
            <span className={`px-1 py-0.2 text-[8px] sm:text-[9px] uppercase font-bold rounded ${
              currentUser.role === 'admin' 
                ? 'bg-quantum-primary/20 text-quantum-primary border border-quantum-primary/40' 
                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
            }`}>
              {currentUser.role === 'admin' ? t('role_admin') : t('role_user')}
            </span>
          </div>

          {/* Language Selector (Always visible and synced across all pages) */}
          <LanguageSelector 
            currentLanguage={currentLanguage} 
            onLanguageChange={setCurrentLanguage} 
          />

          {/* Logout button (Highlighted and clearly visible on mobile) */}
          <button
            id="logout-btn"
            onClick={onLogout}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 active:bg-red-500/35 text-red-300 border border-red-500/40 hover:border-red-500/60 text-xs font-mono font-bold transition-all cursor-pointer shadow-[0_0_12px_rgba(239,68,68,0.15)]"
            title="Sign out of session"
          >
            <LogOut className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span>{t('logout')}</span>
          </button>
        </div>
      </header>

      {/* Main container area */}
      <main className="relative z-10 flex-1 flex flex-col">
        {isTestPageOpen ? (
          <TestPage onBack={() => setIsTestPageOpen(false)} />
        ) : isIbmInterfaceOpen ? (
          <IBMQuantumInterface 
            onBack={() => {
              setIsIbmInterfaceOpen(false);
            }} 
            initialCode={sharedQasm}
          />
        ) : selectedSector ? (
          <QuantumDashboard 
            sector={selectedSector} 
            onBack={handleBackFromDashboard}
            onSectorChange={handleSelectSector}
            onOpenHelp={() => setIsHelpModalOpen(true)}
          />
        ) : (
          <SectorSelector 
            onSelect={handleSelectSector}
            initialSubMenu={returnToSubMenu}
            onSubMenuToggle={setIsSubMenuVisible}
            onOpenIbm={() => setIsIbmInterfaceOpen(true)}
            onOpenHelp={() => setIsHelpModalOpen(true)}
            onOpenTest={() => setIsTestPageOpen(true)}
          />
        )}
      </main>

      {/* Footer / Status bar bar */}
      <footer className="fixed bottom-0 left-0 right-0 p-2.5 sm:p-4 flex justify-between items-center bg-quantum-bg/90 backdrop-blur-md border-t border-white/10 z-20 select-none">
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            id="privacy-policy-footer-btn"
            onClick={() => setIsPrivacyPolicyOpen(true)}
            className="text-[9px] sm:text-[10px] text-quantum-primary hover:text-white font-mono uppercase tracking-[0.15em] sm:tracking-[0.3em] flex items-center gap-1.5 transition-all cursor-pointer group hover:bg-white/5 px-2 py-1 rounded-lg border border-quantum-primary/20 hover:border-quantum-primary/60"
            title="View and edit Privacy Policy (SPARK QUANTUM ENGINE)"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-quantum-primary group-hover:scale-110 transition-transform" />
            <span className="border-b border-quantum-primary/40 group-hover:border-white font-bold">{t('privacy_policy')}</span>
          </button>

          {/* Quick mobile logout shortcut in footer */}
          <button
            id="footer-quick-logout-btn"
            onClick={onLogout}
            className="sm:hidden text-[9px] text-red-400 hover:text-red-300 font-mono uppercase flex items-center gap-1 transition-all cursor-pointer bg-red-500/10 px-2 py-1 rounded-lg border border-red-500/30"
            title="Sign out of session"
          >
            <LogOut className="w-3 h-3 text-red-400" />
            <span className="font-bold">{t('logout')}</span>
          </button>
        </div>
        <div className="text-[7px] sm:text-[10px] text-quantum-primary font-mono uppercase tracking-[0.2em] sm:tracking-[0.3em] animate-pulse">
          {t('activeCore')}
        </div>
      </footer>
    </div>
  );
}
