import React, { useState, useEffect } from 'react';
import { 
  X, 
  HelpCircle, 
  Cpu, 
  ShieldCheck, 
  Terminal, 
  BookOpen, 
  Key, 
  Sparkles, 
  Database, 
  ArrowRight,
  Send,
  Mail,
  MessageSquare,
  CheckCircle2,
  Inbox,
  Trash2,
  Clock,
  UserCheck
} from 'lucide-react';
import { useTranslation } from '../lib/TranslationContext';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToSection?: (sectionId: string) => void;
  currentUser?: {
    username: string;
    role: 'admin' | 'user';
  };
}

interface SupportTicket {
  id: string;
  senderEmail: string;
  senderName?: string;
  subject: string;
  message: string;
  timestamp: string;
  status: 'pending' | 'resolved';
}

const SUPPORT_STORAGE_KEY = 'spark_quantum_support_tickets';

export default function HelpModal({ 
  isOpen, 
  onClose, 
  onNavigateToSection,
  currentUser 
}: HelpModalProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'guide' | 'contact' | 'inbox'>('contact');
  
  // Contact form state
  const [senderEmail, setSenderEmail] = useState('');
  const [subject, setSubject] = useState('Quantum Algorithm & Problem Request');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Admin tickets list
  const [tickets, setTickets] = useState<SupportTicket[]>(() => {
    try {
      const saved = localStorage.getItem(SUPPORT_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (isOpen) {
      // Reload tickets from storage
      try {
        const saved = localStorage.getItem(SUPPORT_STORAGE_KEY);
        if (saved) setTickets(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading tickets', e);
      }
      setSubmittedSuccess(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      alert(t('problemPlaceholder') || 'Please enter your message or problem description.');
      return;
    }

    setIsSubmitting(true);

    const newTicket: SupportTicket = {
      id: 'REQ-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      senderEmail: senderEmail.trim() || currentUser?.username || 'anonymous_user@quantum.net',
      senderName: currentUser?.username || 'User',
      subject: subject,
      message: message.trim(),
      timestamp: new Date().toLocaleString(),
      status: 'pending'
    };

    setTimeout(() => {
      const updated = [newTicket, ...tickets];
      setTickets(updated);
      try {
        localStorage.setItem(SUPPORT_STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('Error saving ticket', err);
      }

      setIsSubmitting(false);
      setSubmittedSuccess(true);
      setMessage('');
      setSenderEmail('');
    }, 600);
  };

  const handleToggleResolved = (ticketId: string) => {
    const updated = tickets.map(t => 
      t.id === ticketId 
        ? { ...t, status: (t.status === 'pending' ? 'resolved' : 'pending') as 'pending' | 'resolved' } 
        : t
    );
    setTickets(updated);
    localStorage.setItem(SUPPORT_STORAGE_KEY, JSON.stringify(updated));
  };

  const handleDeleteTicket = (ticketId: string) => {
    const updated = tickets.filter(t => t.id !== ticketId);
    setTickets(updated);
    localStorage.setItem(SUPPORT_STORAGE_KEY, JSON.stringify(updated));
  };

  const helpTopics = [
    {
      icon: Cpu,
      title: 'Quantum Hardware & IBM Gateway',
      tag: 'REALQ / IBM',
      description: 'Connect directly to real quantum backends or simulation engines using OpenQASM 2.0. Execute variational circuits, monitor jobs in real-time, and run QAOA / VQE optimizations.',
      quickAction: 'realq'
    },
    {
      icon: ShieldCheck,
      title: 'Post-Quantum Cryptography (PQC)',
      tag: 'NIST FIPS 203 / 204',
      description: 'Encrypt, encapsulate, and protect mission-critical datasets with ML-KEM-768 (Kyber) and ML-DSA algorithms resistant to Shor quantum attacks.',
      quickAction: 'pqc_group'
    },
    {
      icon: Terminal,
      title: 'Quantum AI Agents & CrossCode',
      tag: 'AI GENERATOR',
      description: 'Generate high-fidelity quantum circuits and algorithms through prompt engineering. Convert seamlessly between Qiskit, OpenQASM, Cirq, and Pennylane.',
      quickAction: 'quantum_code'
    },
    {
      icon: Database,
      title: 'Quantum Business Intelligence (BI)',
      tag: 'CSV & DATA',
      description: 'Upload CSV datasets, map classical variables to qubits via phase/amplitude encoding, and simulate multi-scenario portfolio/logistics optimization.',
      quickAction: 'quantumbi'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn select-none text-white font-sans">
      <div 
        className="relative w-full max-w-4xl max-h-[92vh] bg-gradient-to-b from-[#0e1628] via-[#090e1a] to-[#050811] border border-cyan-500/30 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-cyan-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-black/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl text-cyan-400 shadow-[0_0_15px_rgba(0,242,255,0.2)]">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-display font-bold uppercase tracking-wider text-white">
                  Help Center & Support
                </h2>
                <span className="px-2 py-0.5 text-[9px] font-mono uppercase bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 rounded-full font-bold">
                  Spark Quantum Engine
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-gray-400 font-mono">
                Contact Administrator, Problem Requests & Documentation Guide
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            {/* Tabs */}
            <div className="flex items-center p-1 bg-black/60 border border-white/10 rounded-xl">
              <button
                id="help-tab-contact-btn"
                onClick={() => setActiveTab('contact')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'contact' 
                    ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(0,242,255,0.4)]' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Contact Admin</span>
              </button>

              <button
                id="help-tab-guide-btn"
                onClick={() => setActiveTab('guide')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'guide' 
                    ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(0,242,255,0.4)]' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Guide</span>
              </button>

              {currentUser?.role === 'admin' && (
                <button
                  id="help-tab-inbox-btn"
                  onClick={() => setActiveTab('inbox')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 relative cursor-pointer ${
                    activeTab === 'inbox' 
                      ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(0,242,255,0.4)]' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Inbox className="w-3.5 h-3.5" />
                  <span>Inbox ({tickets.length})</span>
                </button>
              )}
            </div>

            <button
              id="close-help-modal-btn"
              onClick={onClose}
              className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-colors cursor-pointer ml-1"
              title="Close Help"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 font-mono text-xs text-gray-300 leading-relaxed scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          
          {/* ================= TAB 1: CONTACT ADMINISTRATOR ================= */}
          {activeTab === 'contact' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Intro Description */}
              <div className="p-4 sm:p-5 bg-gradient-to-r from-cyan-950/40 via-black/60 to-black/60 border border-cyan-500/30 rounded-2xl">
                <div className="flex items-center gap-2 text-cyan-300 font-bold uppercase tracking-wider text-xs mb-1.5">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Direct Quantum Problem Submission</span>
                </div>
                <p className="text-gray-300 text-xs leading-relaxed font-sans">
                  {t('s_realq_intro') || 
                    "Transform your computational bottlenecks into executable algorithms using Quantum Embedding techniques. We deliver optimized source code to launch your simulations on quantum computers, or manage the entire infrastructure directly for you."}
                </p>
              </div>

              {submittedSuccess ? (
                /* Success Feedback */
                <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center space-y-4 animate-fadeIn">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center shadow-[0_0_20px_rgba(52,211,153,0.3)]">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-wider text-white">
                      {t('requestSent') || "Request Sent Successfully"}
                    </h4>
                    <p className="text-xs text-emerald-300 mt-1 max-w-md mx-auto">
                      Your message has been delivered to the quantum systems administrator. You will be contacted shortly.
                    </p>
                  </div>
                  <button
                    onClick={() => setSubmittedSuccess(false)}
                    className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold uppercase text-xs rounded-xl transition-all shadow-lg cursor-pointer"
                  >
                    Send Another Request
                  </button>
                </div>
              ) : (
                /* Contact Form */
                <form onSubmit={handleSendMessage} className="space-y-4 bg-black/40 border border-white/10 p-5 sm:p-6 rounded-2xl">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="text-white font-bold uppercase tracking-wider text-xs flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-cyan-400" />
                      {t('problemRequest') || "Problem Request / Information to Admin"}
                    </span>
                    <span className="text-[10px] text-gray-400">Direct Admin Dispatch</span>
                  </div>

                  {/* Subject selector */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">
                      Subject / Topic
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-cyan-400 transition-all font-mono"
                    >
                      <option value="Quantum Algorithm & Problem Request">Quantum Algorithm & Problem Request</option>
                      <option value="IBM QPU Execution & Hardware Access">IBM QPU Execution & Hardware Access</option>
                      <option value="Post-Quantum Cryptography Integration">Post-Quantum Cryptography Integration</option>
                      <option value="Enterprise BI & Dataset Optimization">Enterprise BI & Dataset Optimization</option>
                      <option value="Bug Report & Technical Assistance">Bug Report & Technical Assistance</option>
                    </select>
                  </div>

                  {/* Message box */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">
                      {t('problemRequest') || "Describe your problem or request"}
                    </label>
                    <textarea 
                      id="help-problem-textarea"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      placeholder={t('problemPlaceholder') || "Describe the computational challenge, algorithm, or question for the administrator..."}
                      className="w-full h-36 bg-black/60 border border-white/10 rounded-xl p-4 text-white text-xs placeholder:text-gray-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all resize-none shadow-inner outline-none font-mono leading-relaxed"
                    />
                  </div>

                  {/* Email & Submit */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
                    <div className="sm:col-span-8 relative">
                      <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                      <input 
                        id="help-sender-email"
                        type="email" 
                        value={senderEmail}
                        onChange={(e) => setSenderEmail(e.target.value)}
                        placeholder={t('emailPlaceholder') || "Your work email address (for reply)..."}
                        className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-xs placeholder:text-gray-600 focus:border-cyan-400 outline-none font-mono"
                      />
                    </div>
                    <div className="sm:col-span-4">
                      <button 
                        id="help-send-btn"
                        type="submit"
                        disabled={isSubmitting || !message.trim()}
                        className="w-full h-full min-h-[42px] bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase tracking-wider text-xs rounded-xl transition-all shadow-[0_0_20px_rgba(0,242,255,0.3)] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                      >
                        {isSubmitting ? (
                          <span>Sending...</span>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>{t('send') || "Send Request"}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ================= TAB 2: GUIDE & DOCUMENTATION ================= */}
          {activeTab === 'guide' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Quick Overview Card */}
              <div className="p-4 sm:p-5 bg-cyan-500/5 border border-cyan-500/20 rounded-2xl">
                <div className="flex items-center gap-2 text-cyan-300 font-bold uppercase tracking-wider text-xs mb-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Platform Architecture & Hardware Overview</span>
                </div>
                <p className="text-gray-300 text-xs leading-relaxed font-sans">
                  Spark Quantum Engine is an enterprise-grade hybrid quantum computing and Post-Quantum Cryptography (PQC) ecosystem designed to execute multi-sector simulations, optimize high-dimensional corporate variables, and secure communications against post-quantum cryptographic vulnerabilities.
                </p>
              </div>

              {/* Core Modules Grid */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-white mb-3 flex items-center gap-2 font-mono">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  <span>Core Modules & Capabilities</span>
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {helpTopics.map((topic, i) => {
                    const Icon = topic.icon;
                    return (
                      <div 
                        key={i}
                        className="p-4 bg-white/[0.02] border border-white/10 hover:border-cyan-500/40 rounded-xl transition-all flex flex-col justify-between group"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                                <Icon className="w-4 h-4" />
                              </div>
                              <span className="font-bold text-white text-xs">{topic.title}</span>
                            </div>
                            <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-gray-400 uppercase">
                              {topic.tag}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-400 leading-relaxed font-mono mb-3">
                            {topic.description}
                          </p>
                        </div>

                        {onNavigateToSection && (
                          <button
                            onClick={() => {
                              onClose();
                              onNavigateToSection(topic.quickAction);
                            }}
                            className="mt-2 text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono uppercase tracking-wider font-bold transition-colors cursor-pointer group-hover:translate-x-1 duration-200"
                          >
                            <span>Launch Module</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Technical Support & API Keys */}
              <div className="p-4 bg-black/40 border border-white/10 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider">
                  <Key className="w-4 h-4 text-cyan-400" />
                  <span>Configuring Google API Key & IBM Token</span>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed font-mono">
                  • <strong className="text-gray-200">Google API Key:</strong> Click the "API Key" button on the top right to configure your Gemini key. This enables AI code generation and interactive quantum assistant features.<br />
                  • <strong className="text-gray-200">IBM Quantum Token:</strong> Obtain your API token from <a href="https://quantum.ibm.com/" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">quantum.ibm.com</a> and insert it within the IBM Quantum Gateway module to dispatch jobs directly to physical QPUs.
                </p>
              </div>
            </div>
          )}

          {/* ================= TAB 3: ADMIN INBOX (VISIBLE TO ADMIN) ================= */}
          {activeTab === 'inbox' && currentUser?.role === 'admin' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Inbox className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                    Received User Problem Requests ({tickets.length})
                  </h3>
                </div>
                <span className="text-[10px] text-gray-400">Admin Management Portal</span>
              </div>

              {tickets.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-white/10 rounded-2xl bg-black/20 text-gray-500">
                  <Inbox className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p>No support requests received yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tickets.map((t) => (
                    <div 
                      key={t.id}
                      className={`p-4 rounded-xl border transition-all ${
                        t.status === 'resolved' 
                          ? 'bg-white/[0.02] border-white/10 opacity-70' 
                          : 'bg-black/60 border-cyan-500/30 shadow-lg'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-white/5">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[9px] font-bold">
                            {t.id}
                          </span>
                          <span className="font-bold text-white text-xs">{t.subject}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-gray-400">
                          <Clock className="w-3 h-3" />
                          <span>{t.timestamp}</span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-200 whitespace-pre-wrap leading-relaxed mb-3 bg-black/40 p-3 rounded-lg border border-white/5 font-sans">
                        {t.message}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-2 text-[10px]">
                        <div className="flex items-center gap-2 text-gray-400">
                          <Mail className="w-3.5 h-3.5 text-cyan-400" />
                          <span className="text-gray-300 font-bold">{t.senderEmail}</span>
                          {t.senderName && <span className="text-gray-500">({t.senderName})</span>}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleResolved(t.id)}
                            className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                              t.status === 'resolved'
                                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                                : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                            }`}
                          >
                            <UserCheck className="w-3 h-3" />
                            <span>{t.status === 'resolved' ? 'Mark Pending' : 'Mark Resolved'}</span>
                          </button>

                          <button
                            onClick={() => handleDeleteTicket(t.id)}
                            className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-all cursor-pointer"
                            title="Delete Request"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-black/50 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-[10px] text-gray-500">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>Spark Quantum Engine • Direct Support & Administration Portal</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold uppercase text-xs rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
