import React, { useState } from 'react';
import { Shield, Key, Lock, User, ArrowRight, AlertCircle, Eye, EyeOff, Cpu } from 'lucide-react';
import { loginUser, CurrentUserSession } from '../services/authService';
import QuantumParticleCanvas from './QuantumParticleCanvas';

interface LoginScreenProps {
  onLoginSuccess: (user: CurrentUserSession) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim()) {
      setErrorMessage('Please enter your username.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const result = loginUser(username, password);
      setIsLoading(false);

      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setErrorMessage(result.message || 'Invalid credentials.');
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-quantum-bg flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden select-none text-white font-sans">
      {/* Animated Quantum Particle / Atomic Molecular Canvas */}
      <QuantumParticleCanvas />

      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-quantum-primary/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-quantum-secondary/10 blur-[140px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 sm:p-4 bg-white/[0.03] border border-quantum-primary/30 rounded-2xl sm:rounded-3xl shadow-[0_0_30px_rgba(0,242,255,0.15)] mb-4 backdrop-blur-md">
            <Cpu className="w-8 h-8 sm:w-10 sm:h-10 text-quantum-primary animate-pulse" />
          </div>
          <h1 className="text-xl sm:text-2xl font-display font-black uppercase tracking-[0.25em] bg-gradient-to-r from-white via-gray-200 to-quantum-primary bg-clip-text text-transparent">
            Spark Quantum Engine
          </h1>
          <p className="text-[10px] sm:text-xs text-gray-400 font-mono tracking-widest uppercase mt-1">
            B2B Enterprise Quantum Systems Gateway
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-gradient-to-b from-[#0f172a]/95 to-[#0b0f19]/95 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-quantum-primary" />
              <span className="text-xs font-display font-bold uppercase tracking-wider text-white">
                Secure Authentication
              </span>
            </div>
            <span className="px-2 py-0.5 text-[9px] font-mono uppercase bg-quantum-primary/10 text-quantum-primary border border-quantum-primary/30 rounded-full">
              NIST FIPS 203 Ready
            </span>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-2.5 text-red-200 text-xs font-mono animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-gray-400 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-quantum-primary" />
                <span>Username</span>
              </label>
              <input
                id="login-username-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username..."
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-quantum-primary/50 focus:border-transparent transition-all font-mono"
                autoComplete="username"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-gray-400 mb-1.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-quantum-primary" />
                  <span>Password</span>
                </div>
              </label>
              <div className="relative">
                <input
                  id="login-password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password..."
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-quantum-primary/50 focus:border-transparent transition-all font-mono"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="submit-login-button"
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 py-3.5 px-4 bg-gradient-to-r from-quantum-primary to-cyan-400 hover:from-cyan-300 hover:to-quantum-primary text-black font-display font-bold uppercase tracking-[0.15em] text-xs rounded-xl shadow-[0_0_20px_rgba(0,242,255,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Access Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div className="text-center mt-6 text-[10px] text-gray-500 font-mono flex items-center justify-center gap-2">
          <Shield className="w-3.5 h-3.5 text-quantum-primary/70" />
          <span>Spark Quantum Engine • Multi-Tenant RBAC Security</span>
        </div>
      </div>
    </div>
  );
}
