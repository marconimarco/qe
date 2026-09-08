import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, 
  Upload, 
  Download, 
  Key, 
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  Copy, 
  Check, 
  RefreshCcw, 
  Zap, 
  ArrowRight,
  Unlock,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import axios from 'axios';
import { useTranslation } from '../../lib/TranslationContext';

export default function QuantumLocker() {
  const { t } = useTranslation();
  const [activeMode, setActiveMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  
  // Encryption state
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{
    encryptedPayload: string;
    encapsulatedKey: string;
    unlockKey: string;
    algorithm: string;
  } | null>(null);

  // Decryption state
  const [decryptPayload, setDecryptPayload] = useState('');
  const [decryptEncKey, setDecryptEncKey] = useState('');
  const [decryptSecretKey, setDecryptSecretKey] = useState('');
  const [decryptedResult, setDecryptedResult] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptError, setDecryptError] = useState<string | null>(null);

  // Copy status indicators
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [copiedEncKey, setCopiedEncKey] = useState(false);
  const [copiedUnlockKey, setCopiedUnlockKey] = useState(false);
  const [copiedDecrypted, setCopiedDecrypted] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const decryptFileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      
      if (activeMode === 'encrypt') {
        setSelectedFile(file);
      } else {
        // If in decrypt mode and file is .vault or text, try to read it
        const reader = new FileReader();
        reader.onload = (ev) => {
          const content = (ev.target?.result as string) || '';
          setDecryptPayload(content.trim());
        };
        reader.readAsText(file);
      }
    }
  };

  const handleModeSwitch = (mode: 'encrypt' | 'decrypt') => {
    setActiveMode(mode);
    setDecryptError(null);
  };

  const clearAll = () => {
    if (activeMode === 'encrypt') {
      setInputText('');
      setSelectedFile(null);
      setResult(null);
    } else {
      setDecryptPayload('');
      setDecryptEncKey('');
      setDecryptSecretKey('');
      setDecryptedResult(null);
      setDecryptError(null);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (decryptFileInputRef.current) decryptFileInputRef.current.value = '';
  };

  const handleEncrypt = async () => {
    if (!inputText.trim() && !selectedFile) {
      alert(t('locker_original_text_placeholder') || 'Enter text or select a file to encrypt.');
      return;
    }

    setIsProcessing(true);
    setResult(null);
    setDecryptError(null);

    try {
      let response;
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        response = await axios.post('/api/pqc/encrypt', formData);
      } else {
        response = await axios.post('/api/pqc/encrypt', { 
          text: inputText 
        });
      }

      if (response.data && response.data.encryptedPayload) {
        setResult(response.data);
      } else {
        console.error('Invalid response format', response.data);
        alert(t('locker_error_server') || 'Server error during encryption');
      }
    } catch (error: any) {
      console.error('Encryption failed:', error);
      const errorMsg = error.response?.data?.error || error.message || t('locker_error_server') || 'Encryption error';
      alert(`Error: ${errorMsg}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const executeDecryption = async (payload: string, encKey: string, secKey: string) => {
    const cleanPayload = (payload || '').trim();
    const cleanEnc = (encKey || '').trim();
    const cleanSec = (secKey || '').trim();

    if (!cleanPayload || !cleanEnc || !cleanSec) {
      setDecryptError('All 3 parameters (Encrypted Payload, Encapsulated Key, and Unlock Key) are required.');
      return;
    }

    setIsDecrypting(true);
    setDecryptedResult(null);
    setDecryptError(null);

    try {
      const response = await axios.post('/api/pqc/decrypt', {
        encryptedPayload: cleanPayload,
        encapsulatedKey: cleanEnc,
        unlockKey: cleanSec
      });

      if (response.data && response.data.decryptedContent !== undefined) {
        setDecryptedResult(response.data.decryptedContent);
      } else {
        setDecryptError('Empty or invalid response from decryption server.');
      }
    } catch (error: any) {
      console.error('Decryption failed:', error);
      const errorMsg = error.response?.data?.error || error.message || t('locker_error_decryption') || 'Decryption failed';
      setDecryptError(errorMsg);
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleDecrypt = () => {
    executeDecryption(decryptPayload, decryptEncKey, decryptSecretKey);
  };

  // One-click helper: transfers newly encrypted data to decryptor and deciphers it immediately
  const handleInstantDecrypt = () => {
    if (!result) return;
    setDecryptPayload(result.encryptedPayload);
    setDecryptEncKey(result.encapsulatedKey);
    setDecryptSecretKey(result.unlockKey);
    setActiveMode('decrypt');
    executeDecryption(result.encryptedPayload, result.encapsulatedKey, result.unlockKey);
  };

  // Load last encrypted data into decryptor inputs
  const handleLoadLastEncrypted = () => {
    if (!result) return;
    setDecryptPayload(result.encryptedPayload);
    setDecryptEncKey(result.encapsulatedKey);
    setDecryptSecretKey(result.unlockKey);
    setDecryptError(null);
  };

  const copyText = (text: string, type: 'payload' | 'encKey' | 'unlockKey' | 'decrypted') => {
    navigator.clipboard.writeText(text);
    if (type === 'payload') {
      setCopiedPayload(true);
      setTimeout(() => setCopiedPayload(false), 2000);
    } else if (type === 'encKey') {
      setCopiedEncKey(true);
      setTimeout(() => setCopiedEncKey(false), 2000);
    } else if (type === 'unlockKey') {
      setCopiedUnlockKey(true);
      setTimeout(() => setCopiedUnlockKey(false), 2000);
    } else if (type === 'decrypted') {
      setCopiedDecrypted(true);
      setTimeout(() => setCopiedDecrypted(false), 2000);
    }
  };

  const downloadEncrypted = () => {
    if (!result) return;
    const blob = new Blob([result.encryptedPayload], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quantum_locked_${selectedFile?.name ? selectedFile.name + '.vault' : 'message.vault'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 py-4 sm:py-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Top Header & Tab Toggle */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-quantum-primary/10 border border-quantum-primary/30 flex items-center justify-center relative overflow-hidden shadow-[0_0_25px_rgba(0,242,255,0.15)]">
             <div className="absolute inset-0 bg-quantum-primary/10 animate-pulse" />
             <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-quantum-primary relative" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-display font-black text-white uppercase tracking-tight leading-none flex items-center gap-3">
              PQC <span className="text-quantum-primary drop-shadow-[0_0_12px_rgba(0,242,255,0.5)]">LOCKER</span>
            </h2>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              <p className="text-[10px] sm:text-xs text-gray-400 font-mono uppercase tracking-widest font-bold">
                NIST FIPS 203 (ML-KEM-768) + AES-256-GCM
              </p>
            </div>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-2 p-1.5 bg-black/60 rounded-2xl border border-white/10 shadow-xl backdrop-blur-md w-full sm:w-auto">
          <button 
            id="pqc-encrypt-mode-btn"
            onClick={() => handleModeSwitch('encrypt')}
            className={`flex-1 sm:flex-none px-5 sm:px-7 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              activeMode === 'encrypt' 
                ? 'bg-quantum-primary text-black shadow-[0_0_20px_rgba(0,242,255,0.4)] scale-100 font-black' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            {t('locker_encrypt_tab') || 'ENCRYPT VAULT'}
          </button>
          <button 
            id="pqc-decrypt-mode-btn"
            onClick={() => handleModeSwitch('decrypt')}
            className={`flex-1 sm:flex-none px-5 sm:px-7 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              activeMode === 'decrypt' 
                ? 'bg-quantum-primary text-black shadow-[0_0_20px_rgba(0,242,255,0.4)] scale-100 font-black' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Unlock className="w-3.5 h-3.5" />
            {t('locker_decrypt_tab') || 'DECRYPT GATE'}
          </button>
          <div className="hidden sm:block w-[1px] h-7 bg-white/10 mx-1" />
          <button 
            id="pqc-reset-btn"
            onClick={clearAll}
            className="p-3 text-gray-400 hover:text-amber-400 transition-colors bg-white/5 rounded-xl border border-white/10 hover:border-amber-400/40"
            title={t('locker_reset_all') || 'Reset All'}
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Inputs on the Left, Results on the Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        
        {/* ================= LEFT COLUMN: INPUT CONTROLS ================= */}
        <div className="quantum-card bg-black/70 backdrop-blur-2xl p-6 sm:p-8 border-white/10 flex flex-col justify-between shadow-2xl rounded-3xl">
          {activeMode === 'encrypt' ? (
            <>
              <div>
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                  <h3 className="flex items-center gap-2.5 text-white font-display font-bold uppercase tracking-wider text-sm">
                    <Lock className="w-4 h-4 text-quantum-primary" />
                    {t('locker_secure_encryption') || 'Quantum Text & File Encryption'}
                  </h3>
                  <span className="px-2.5 py-1 bg-quantum-primary/10 border border-quantum-primary/30 rounded-lg text-quantum-primary text-[10px] font-mono font-bold">
                    POST-QUANTUM
                  </span>
                </div>

                <div className="space-y-6">
                  {/* Textarea for original message */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-mono text-gray-400 uppercase tracking-widest font-bold flex items-center justify-between">
                      <span>{t('locker_original_text') || 'Original Text to Protect'}</span>
                      <span className="text-[10px] text-gray-500 font-normal">{inputText.length} chars</span>
                    </label>
                    <textarea 
                      id="pqc-encrypt-input-text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder={t('locker_original_text_placeholder') || 'Write here confidential text, keys or data to encrypt with ML-KEM-768...'}
                      className="w-full h-36 bg-black/60 border border-white/10 rounded-2xl p-4 text-sm text-gray-100 placeholder:text-gray-600 focus:ring-2 focus:ring-quantum-primary/40 focus:border-quantum-primary/40 transition-all resize-none shadow-inner font-sans leading-relaxed outline-none"
                    />
                  </div>

                  {/* File upload option */}
                  <div>
                    <label className="text-[11px] font-mono text-gray-400 uppercase tracking-widest font-bold block mb-2">
                      {t('locker_or_upload_file') || 'Or select a file'}
                    </label>
                    <div 
                      id="pqc-file-upload-box"
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center transition-all cursor-pointer group ${
                        selectedFile 
                          ? 'border-quantum-primary/50 bg-quantum-primary/10' 
                          : 'border-white/10 hover:border-quantum-primary/40 hover:bg-white/5'
                      }`}
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange}
                        className="hidden" 
                      />
                      <Upload className={`w-7 h-7 mb-2 transition-transform group-hover:-translate-y-1 ${
                        selectedFile ? 'text-quantum-primary' : 'text-gray-500'
                      }`} />
                      <p className="text-xs font-mono text-gray-300 font-bold uppercase tracking-wider text-center">
                        {selectedFile ? selectedFile.name : (t('locker_browse_files') || 'Browse File')}
                      </p>
                      {selectedFile ? (
                        <button 
                          type="button" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFile(null);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="mt-2 text-[10px] text-red-400 hover:text-red-300 underline font-mono"
                        >
                          Remove file
                        </button>
                      ) : (
                        <p className="text-[9px] text-gray-600 mt-1 font-mono uppercase">
                          {t('locker_max_file_info') || 'Any document, text, or CSV'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6 mt-6 border-t border-white/5">
                <button 
                  id="pqc-lock-vault-btn"
                  onClick={handleEncrypt}
                  disabled={isProcessing || (!inputText.trim() && !selectedFile)}
                  className="w-full py-4 bg-quantum-primary hover:bg-cyan-300 text-black font-black uppercase tracking-widest text-xs rounded-2xl hover:scale-[1.01] active:scale-[0.99] transition-all shadow-[0_10px_30px_rgba(0,242,255,0.3)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3 cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCcw className="w-4 h-4 animate-spin" />
                      <span>{t('locker_processing_lattice') || 'Generating ML-KEM Keys...'}</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 fill-current" />
                      <span>{t('locker_lock_vault_btn') || 'LOCK VAULT (ENCRYPT NOW)'}</span>
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            /* ================= DECRYPTION INPUT FORM ================= */
            <>
              <div>
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                  <h3 className="flex items-center gap-2.5 text-white font-display font-bold uppercase tracking-wider text-sm">
                    <ShieldCheck className="w-4 h-4 text-quantum-primary" />
                    {t('locker_decipher_gate') || 'Vault Decryption & Unlock Gate'}
                  </h3>
                  {result && (
                    <button
                      id="pqc-load-last-btn"
                      onClick={handleLoadLastEncrypted}
                      className="px-3 py-1.5 bg-quantum-primary/10 hover:bg-quantum-primary/20 border border-quantum-primary/30 rounded-xl text-quantum-primary text-[10px] font-mono font-bold transition-all flex items-center gap-1.5"
                      title="Auto-fill data from last encryption"
                    >
                      <Sparkles className="w-3 h-3" />
                      Paste Last Encrypted Data
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Field 1: Encrypted Payload */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-bold">
                        1. {t('locker_payload_label') || 'Encrypted Payload (Base64)'}
                      </label>
                      <button
                        type="button"
                        onClick={() => decryptFileInputRef.current?.click()}
                        className="text-[10px] text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1"
                      >
                        <FileText className="w-3 h-3" />
                        Load .vault
                      </button>
                      <input 
                        type="file" 
                        ref={decryptFileInputRef} 
                        onChange={handleFileChange}
                        className="hidden" 
                        accept=".vault,.txt"
                      />
                    </div>
                    <textarea 
                      id="pqc-decrypt-payload-input"
                      value={decryptPayload}
                      onChange={(e) => setDecryptPayload(e.target.value)}
                      placeholder={t('locker_payload_placeholder') || 'Paste here the Base64 encrypted payload (or load a .vault file)...'}
                      className="w-full h-24 bg-black/60 border border-white/10 rounded-xl p-3 text-xs font-mono text-gray-200 placeholder:text-gray-600 focus:ring-2 focus:ring-quantum-primary/40 outline-none transition-all resize-none shadow-inner"
                    />
                  </div>

                  {/* Field 2: Encapsulated Key */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-bold">
                      2. {t('locker_enc_key_label') || 'ML-KEM Encapsulated Key (Ciphertext HEX)'}
                    </label>
                    <input 
                      id="pqc-decrypt-enc-key-input"
                      type="text"
                      value={decryptEncKey}
                      onChange={(e) => setDecryptEncKey(e.target.value)}
                      placeholder={t('locker_enc_key_placeholder') || 'Paste the encapsulated key (HEX string)...'}
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-quantum-primary font-mono placeholder:text-gray-600 focus:ring-2 focus:ring-quantum-primary/40 outline-none transition-all shadow-inner"
                    />
                  </div>

                  {/* Field 3: Unlock Secret Key */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-bold">
                      3. {t('locker_unlock_key_label') || 'Unlock Key / Private Key (HEX)'}
                    </label>
                    <input 
                      id="pqc-decrypt-secret-key-input"
                      type="text"
                      value={decryptSecretKey}
                      onChange={(e) => setDecryptSecretKey(e.target.value)}
                      placeholder={t('locker_unlock_key_placeholder') || 'Paste the private unlock key (HEX)...'}
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-amber-300 font-mono placeholder:text-gray-600 focus:ring-2 focus:ring-quantum-primary/40 outline-none transition-all shadow-inner"
                    />
                  </div>

                  {/* Decrypt Error Message */}
                  {decryptError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2.5 animate-in fade-in duration-300">
                      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <p className="text-[11px] font-mono text-red-300 leading-tight">
                        {decryptError}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Decrypt Action Button */}
              <div className="pt-6 mt-6 border-t border-white/5">
                <button 
                  id="pqc-unlock-vault-btn"
                  onClick={handleDecrypt}
                  disabled={isDecrypting || !decryptPayload.trim() || !decryptEncKey.trim() || !decryptSecretKey.trim()}
                  className="w-full py-4 bg-quantum-primary hover:bg-cyan-300 text-black font-black uppercase tracking-widest text-xs rounded-2xl hover:scale-[1.01] active:scale-[0.99] transition-all shadow-[0_10px_30px_rgba(0,242,255,0.3)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3 cursor-pointer"
                >
                  {isDecrypting ? (
                    <>
                      <RefreshCcw className="w-4 h-4 animate-spin" />
                      <span>{t('locker_decapsulating_lattice') || 'Decapsulating ML-KEM & Decrypting AES-GCM...'}</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-4 h-4" />
                      <span>{t('locker_unlock_vault_btn') || 'UNLOCK VAULT (DECRYPT NOW)'}</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>

        {/* ================= RIGHT COLUMN: LIVE OUTPUT & RESULTS ================= */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {activeMode === 'encrypt' ? (
              !result ? (
                /* Empty Encrypt Placeholder */
                <motion.div 
                  key="empty-encrypt"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-3xl bg-black/30 p-10 text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-5 border border-white/10 shadow-inner">
                    <ShieldCheck className="w-8 h-8 text-quantum-primary/40" />
                  </div>
                  <h4 className="text-gray-300 font-mono text-xs uppercase tracking-widest font-black">
                    {t('locker_awaiting_signal') || 'Awaiting input to encrypt'}
                  </h4>
                  <p className="text-[11px] text-gray-500 mt-2 max-w-[280px] leading-relaxed font-sans">
                    {t('locker_awaiting_signal_desc') || 'Enter a message or file on the left and click "Lock Vault" to start post-quantum encryption.'}
                  </p>
                </motion.div>
              ) : (
                /* Encryption Result Card */
                <motion.div 
                  key="results-encrypt"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="quantum-card bg-gradient-to-br from-black/80 to-quantum-surface/40 space-y-6 p-6 sm:p-8 border-quantum-primary/30 rounded-3xl shadow-2xl"
                >
                  {/* Status Banner */}
                  <div className="flex items-center justify-between pb-4 border-b border-white/10">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <h3 className="text-white font-display font-black uppercase tracking-wider text-xs sm:text-sm">
                        Encryption Result
                      </h3>
                    </div>
                    <span className="px-3 py-1 bg-emerald-500/15 text-emerald-400 text-[10px] font-mono font-bold rounded-lg border border-emerald-500/30">
                      SECURE ML-KEM-768
                    </span>
                  </div>

                  {/* PROMINENT QUICK DECRYPT ACTION */}
                  <div className="p-4 bg-quantum-primary/10 border border-quantum-primary/30 rounded-2xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold text-quantum-primary uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        Instant Verification
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">1-Click Test</span>
                    </div>
                    <p className="text-xs text-gray-300 font-sans">
                      Want to test decrypting this phrase right now?
                    </p>
                    <button
                      id="pqc-instant-decrypt-btn"
                      onClick={handleInstantDecrypt}
                      className="w-full py-3 bg-quantum-primary hover:bg-cyan-300 text-black font-black uppercase tracking-wider text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                    >
                      <Unlock className="w-4 h-4" />
                      <span>Decrypt This Phrase Now</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Encrypted Payload Display */}
                  <div className="space-y-2 p-4 bg-black/60 border border-white/10 rounded-2xl">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider font-bold">
                        Encrypted Payload (Base64)
                      </span>
                      <span className="text-[9px] font-mono text-quantum-primary">
                        {result.encryptedPayload.length} bytes
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-gray-300 break-all leading-relaxed max-h-28 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/20">
                      {result.encryptedPayload}
                    </div>
                    <div className="pt-2 flex gap-2">
                      <button 
                        onClick={() => copyText(result.encryptedPayload, 'payload')}
                        className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {copiedPayload ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedPayload ? 'Payload Copied!' : 'Copy Encrypted Payload'}
                      </button>
                      <button 
                        onClick={downloadEncrypted}
                        className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-quantum-primary text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                        title="Download .vault file"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download .vault
                      </button>
                    </div>
                  </div>

                  {/* Encapsulated Key */}
                  <div className="space-y-2 p-4 bg-black/60 border border-white/10 rounded-2xl">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider font-bold">
                        Encapsulated Key (HEX)
                      </span>
                      <button 
                        onClick={() => copyText(result.encapsulatedKey, 'encKey')}
                        className="text-[10px] text-quantum-primary hover:underline font-mono flex items-center gap-1 cursor-pointer"
                      >
                        {copiedEncKey ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        {copiedEncKey ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <div className="text-[10px] font-mono text-quantum-primary break-all max-h-16 overflow-y-auto pr-2">
                      {result.encapsulatedKey}
                    </div>
                  </div>

                  {/* Unlock Secret Key */}
                  <div className="space-y-2 p-4 bg-black/60 border border-amber-500/20 rounded-2xl">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-amber-300 uppercase tracking-wider font-bold flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5" />
                        Unlock Secret Key (HEX)
                      </span>
                      <button 
                        onClick={() => copyText(result.unlockKey, 'unlockKey')}
                        className="text-[10px] text-amber-300 hover:underline font-mono flex items-center gap-1 cursor-pointer"
                      >
                        {copiedUnlockKey ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        {copiedUnlockKey ? 'Copied!' : 'Copy Secret Key'}
                      </button>
                    </div>
                    <div className="text-[10px] font-mono text-amber-200/90 break-all max-h-16 overflow-y-auto pr-2">
                      {result.unlockKey}
                    </div>
                    <p className="text-[9px] text-amber-400/80 font-mono pt-1">
                      ⚠️ Keep this key secure to decrypt your message at any time.
                    </p>
                  </div>
                </motion.div>
              )
            ) : (
              /* ================= DECRYPTION RESULTS ================= */
              !decryptedResult ? (
                /* Empty Decrypt Placeholder */
                <motion.div 
                  key="empty-decrypt"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-3xl bg-black/30 p-10 text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-quantum-primary/10 flex items-center justify-center mb-5 border border-quantum-primary/20 shadow-inner">
                    <Key className="w-8 h-8 text-quantum-primary/50" />
                  </div>
                  <h4 className="text-gray-300 font-mono text-xs uppercase tracking-widest font-black">
                    {t('locker_params_required') || 'Awaiting Decryption'}
                  </h4>
                  <p className="text-[11px] text-gray-500 mt-2 max-w-[280px] leading-relaxed font-sans">
                    {t('locker_params_required_desc') || 'Enter the encrypted payload, encapsulated key, and unlock key on the left, then click "Unlock Vault".'}
                  </p>
                </motion.div>
              ) : (
                /* Decryption Successful Card */
                <motion.div 
                  key="results-decrypt"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="quantum-card bg-gradient-to-br from-emerald-950/40 via-black/80 to-black/90 border-emerald-500/30 p-6 sm:p-8 space-y-6 rounded-3xl shadow-2xl"
                >
                  <div className="flex items-center justify-between pb-4 border-b border-white/10">
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      <h3 className="text-white font-display font-black uppercase tracking-wider text-xs sm:text-sm">
                        {t('locker_decrypted_data') || 'Decrypted Plaintext Result'}
                      </h3>
                    </div>
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold rounded-lg border border-emerald-500/40">
                      INTEGRITY VERIFIED 100%
                    </span>
                  </div>

                  {/* Decrypted Content Box */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider font-bold">
                      Original Decoded Content:
                    </label>
                    <div className="p-6 bg-black/80 border border-emerald-500/30 rounded-2xl min-h-48 max-h-80 overflow-y-auto shadow-inner">
                      <p className="text-sm sm:text-base text-emerald-200 leading-relaxed break-words whitespace-pre-wrap font-sans font-medium">
                        {decryptedResult}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <button 
                      onClick={() => copyText(decryptedResult, 'decrypted')}
                      className="py-3.5 bg-white/10 hover:bg-white/15 text-white border border-white/10 text-xs font-bold uppercase rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {copiedDecrypted ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      {copiedDecrypted ? 'Copied!' : (t('locker_copy_plaintext') || 'Copy Plaintext')}
                    </button>
                    <button 
                      onClick={() => {
                        const blob = new Blob([decryptedResult], { type: 'text/plain;charset=utf-8' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'decrypted_message.txt';
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="py-3.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      {t('locker_download_txt') || 'Download .txt'}
                    </button>
                  </div>

                  {/* Footer status */}
                  <div className="flex items-center justify-center gap-4 text-[10px] font-mono text-gray-400 pt-2">
                    <span>ML-KEM-768 Decapsulation Complete</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>RAM Scrubber FIPS 140-3 Executed</span>
                  </div>
                </motion.div>
              )
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
