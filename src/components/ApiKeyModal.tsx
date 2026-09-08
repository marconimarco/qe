import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Key, Eye, EyeOff, Check, X, Trash2, ExternalLink, ShieldCheck, Sparkles } from 'lucide-react';
import { getStoredApiKey, saveApiKey, removeApiKey } from '../services/apiKeyService';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved?: () => void;
}

export default function ApiKeyModal({ isOpen, onClose, onKeySaved }: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [hasExistingKey, setHasExistingKey] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const stored = getStoredApiKey();
      setApiKey(stored);
      setHasExistingKey(!!stored);
      setSavedSuccess(false);
    }
  }, [isOpen]);

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!apiKey.trim()) return;

    saveApiKey(apiKey.trim());
    setSavedSuccess(true);
    setHasExistingKey(true);

    if (onKeySaved) {
      onKeySaved();
    }

    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleRemove = () => {
    removeApiKey();
    setApiKey('');
    setHasExistingKey(false);
    if (onKeySaved) {
      onKeySaved();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-lg bg-quantum-bg/95 border border-quantum-primary/30 rounded-2xl p-6 sm:p-8 shadow-[0_0_50px_rgba(0,242,255,0.15)] text-white"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-quantum-primary/10 border border-quantum-primary/30 rounded-xl text-quantum-primary">
                <Key className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-display font-bold uppercase tracking-wide flex items-center gap-2">
                  Google API Key
                  {hasExistingKey && (
                    <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-green-500/20 border border-green-500/40 text-green-400 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> ACTIVE
                    </span>
                  )}
                </h3>
                <p className="text-xs text-gray-400">
                  Configure your API Key to enable advanced quantum intelligence features.
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase text-gray-300 flex items-center justify-between">
                  <span>API Key</span>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-quantum-primary hover:underline flex items-center gap-1 font-sans capitalize"
                  >
                    Get free key <ExternalLink className="w-3 h-3" />
                  </a>
                </label>

                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full bg-black/60 border border-white/10 rounded-xl py-3 px-4 pr-12 text-sm text-quantum-primary font-mono placeholder:text-gray-600 focus:outline-none focus:border-quantum-primary transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Status Message */}
              {savedSuccess && (
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-xs flex items-center gap-2 font-mono">
                  <Check className="w-4 h-4 shrink-0" />
                  API Key saved successfully in localStorage!
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={!apiKey.trim() || savedSuccess}
                  className="w-full sm:flex-1 py-3 px-5 bg-quantum-primary text-black font-bold uppercase tracking-wider text-xs rounded-xl hover:shadow-[0_0_20px_rgba(0,242,255,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {savedSuccess ? (
                    <>
                      <Check className="w-4 h-4" /> Saved
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Save Key
                    </>
                  )}
                </button>

                {hasExistingKey && (
                  <button
                    type="button"
                    onClick={handleRemove}
                    className="w-full sm:w-auto py-3 px-4 border border-red-500/30 text-red-400 hover:bg-red-500/10 font-bold uppercase tracking-wider text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" /> Remove
                  </button>
                )}
              </div>
            </form>

            <div className="mt-6 pt-4 border-t border-white/5 text-[11px] text-gray-500 leading-relaxed">
              💡 Your API Key is stored exclusively in your browser's <code className="text-gray-400">localStorage</code> and is never sent to any external server other than official Google AI Studio APIs.
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
