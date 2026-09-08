import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  Send, 
  Lock, 
  ShieldCheck, 
  Cpu, 
  Zap,
  Terminal,
  User,
  Bot,
  Plus,
  Key as KeyIcon,
  ChevronRight,
  Mail,
  Users,
  Copy,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import { useTranslation } from '../../lib/TranslationContext';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  cipher?: string;
  isEncrypted?: boolean;
}

export default function QuantumChat() {
  const { t } = useTranslation();
  const [view, setView] = useState<'lobby' | 'chat'>('lobby');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [roomPublicKey, setRoomPublicKey] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Socket Connection
  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    newSocket.on('new-message', (data: any) => {
      const newMessage: Message = {
        id: Math.random().toString(),
        senderId: data.senderId,
        senderName: data.senderId === newSocket.id ? 'You' : 'Agent_' + data.senderId.substring(0, 4),
        content: data.message,
        cipher: data.encapsulatedKey,
        isEncrypted: true
      };
      setMessages(prev => [...prev, newMessage]);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const createRoom = async () => {
    try {
      const response = await axios.post('/api/pqc/chat/create-room');
      const { roomId: newRoomId, publicKey } = response.data;
      setRoomId(newRoomId);
      setRoomPublicKey(publicKey);
      setView('chat');
      socket?.emit('join-room', newRoomId);
      
      setMessages([{
        id: '1',
        senderId: 'system',
        senderName: 'SYSTEM',
        content: `Quantum Session created. ID: ${newRoomId}. Only code holders can join.`,
        isEncrypted: false
      }]);
    } catch (error) {
      console.error('Failed to create room', error);
    }
  };

  const joinWithCode = async () => {
    if (!joinCode) return;
    setIsJoining(true);
    try {
      const response = await axios.post('/api/pqc/chat/validate-code', { code: joinCode });
      const { roomId: joinedRoomId, publicKey } = response.data;
      setRoomId(joinedRoomId);
      setRoomPublicKey(publicKey);
      setView('chat');
      socket?.emit('join-room', joinedRoomId);
      
      setMessages([{
        id: '1',
        senderId: 'system',
        senderName: 'SYSTEM',
        content: `Access to session ${joinedRoomId} authorized via ML-KEM.`,
        isEncrypted: false
      }]);
    } catch (error) {
      alert("Invalid code");
    } finally {
      setIsJoining(false);
    }
  };

  const sendInvite = async () => {
    if (!inviteEmail || !roomId) return;
    setIsInviting(true);
    try {
      const response = await axios.post('/api/pqc/chat/invite', { roomId, email: inviteEmail });
      setInviteCode(response.data.code);
      setInviteEmail('');
      setTimeout(() => setInviteCode(null), 30000); // Clear after 30s
    } catch (error) {
      console.error('Invite failed', error);
    } finally {
      setIsInviting(false);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || !roomId || !roomPublicKey) return;

    try {
      const response = await axios.post('/api/pqc/chat-exchange', {
        message: inputValue,
        publicKey: roomPublicKey
      });

      socket?.emit('send-message', {
        roomId,
        message: inputValue,
        encryptedData: response.data.encryptedMessage,
        encapsulatedKey: response.data.encapsulatedKey
      });

      setInputValue('');
    } catch (error) {
      console.error('Send failed', error);
    }
  };

  if (view === 'lobby') {
    return (
      <div className="max-w-2xl mx-auto space-y-10 py-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
        <div className="text-center space-y-6">
          <div className="relative inline-flex mb-2">
            <div className="absolute inset-0 bg-quantum-primary/20 blur-2xl rounded-full" />
            <div className="relative p-5 bg-black/40 border border-quantum-primary/30 rounded-3xl">
              <MessageSquare className="w-12 h-12 text-quantum-primary" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl sm:text-5xl font-display font-black text-white uppercase tracking-tighter leading-none">
              Quantum <span className="text-quantum-primary drop-shadow-[0_0_10px_rgba(0,242,255,0.5)]">{t('chat_title')}</span>
            </h2>
            <p className="text-[10px] sm:text-[11px] text-gray-500 font-mono uppercase tracking-[0.3em] max-w-md mx-auto leading-relaxed">
              {t('chat_subtitle')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5">
          <button 
            onClick={createRoom}
            className="quantum-card bg-black/60 border-quantum-primary/20 hover:border-quantum-primary/50 transition-all group p-8 flex items-center justify-between relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-2 opacity-5 italic font-mono text-4xl select-none">CREATE</div>
            <div className="flex items-center gap-6 text-left relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-quantum-primary/10 flex items-center justify-center border border-quantum-primary/20 group-hover:scale-110 transition-transform">
                <Plus className="w-8 h-8 text-quantum-primary" />
              </div>
              <div>
                <h3 className="text-white font-display font-bold uppercase tracking-[0.15em] text-sm">{t('chat_new_session')}</h3>
                <p className="text-[10px] text-gray-400 uppercase mt-1.5 tracking-wider">{t('chat_new_session_desc')}</p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-gray-700 group-hover:text-quantum-primary group-hover:translate-x-1 transition-all" />
          </button>

          <div className="quantum-card bg-black/60 border-white/10 p-8 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-5 italic font-mono text-4xl select-none">JOIN</div>
            <div className="flex items-center gap-6 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5">
                <KeyIcon className="w-8 h-8 text-gray-500" />
              </div>
              <div>
                <h3 className="text-white font-display font-bold uppercase tracking-[0.15em] text-sm">{t('chat_quick_access')}</h3>
                <p className="text-[10px] text-gray-400 uppercase mt-1.5 tracking-wider">{t('chat_enter_invite')}</p>
              </div>
            </div>
            
            <div className="flex gap-3 relative z-10">
              <input 
                type="text"
                placeholder={t('chat_code_placeholder')}
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                className="flex-1 bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white uppercase tracking-[0.4em] font-mono focus:ring-2 focus:ring-quantum-primary/50 outline-none transition-all placeholder:text-gray-700"
              />
              <button 
                onClick={joinWithCode}
                disabled={!joinCode || isJoining}
                className="px-8 bg-quantum-primary text-black text-[11px] font-black uppercase rounded-2xl hover:bg-quantum-secondary hover:text-white transition-all disabled:opacity-30 flex items-center justify-center shadow-[0_0_20px_rgba(0,242,255,0.2)]"
              >
                {isJoining ? <Loader2 className="w-5 h-5 animate-spin" /> : t('chat_enter_btn')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto h-[85vh] lg:h-[750px] max-h-[900px] flex flex-col bg-black/70 backdrop-blur-3xl border border-white/10 rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.5)] relative animate-in fade-in zoom-in-95 duration-700">
      <div className="p-4 sm:p-8 bg-white/[0.02] border-b border-white/5 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 sm:gap-6 relative z-20">
        <div className="flex items-center gap-3 sm:gap-5">
          <button 
            onClick={() => { setView('lobby'); socket?.emit('leave-room', roomId); }}
            className="p-2 sm:p-3 bg-white/5 hover:bg-white/10 rounded-xl sm:rounded-2xl transition-all text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative">
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-quantum-primary/10 border border-quantum-primary/20 flex items-center justify-center shadow-[0_0_20px_rgba(0,242,255,0.1)]">
                <div className="relative">
                  <MessageSquare className="w-5 h-5 sm:w-7 h-7 text-quantum-primary" />
                  <div className="absolute -top-1 -right-1 w-2 sm:w-2.5 h-2 sm:h-2.5 bg-green-500 rounded-full shadow-[0_0_10px_#22c55e]" />
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 sm:gap-3">
                <h3 className="text-white font-display font-black uppercase tracking-[0.2em] text-[11px] sm:text-[13px]">{t('chat_secure_session')}</h3>
                <span className="px-1.5 py-0.5 bg-quantum-primary/15 text-quantum-primary text-[8px] sm:text-[10px] font-mono font-bold rounded-md sm:rounded-lg border border-quantum-primary/20 tracking-widest">#{roomId}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex -space-x-1.5 sm:-space-x-2">
                  {[1, 2].map(i => <div key={i} className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white/10 border border-black/50 flex items-center justify-center"><User className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-500" /></div>)}
                </div>
                <span className="text-[8px] sm:text-[9px] font-mono text-gray-500 uppercase tracking-[0.1em] sm:tracking-[0.2em]">{t('chat_established_tag')}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          {inviteCode ? (
             <div className="flex items-center gap-3 sm:gap-4 px-4 py-2 sm:px-5 sm:py-3 bg-green-500/10 border border-green-500/20 rounded-xl sm:rounded-2xl animate-in zoom-in duration-500">
                <div className="p-1 sm:p-1.5 bg-green-500/20 rounded-lg">
                  <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500" />
                </div>
                <div>
                  <p className="text-[7px] sm:text-[8px] font-mono text-gray-500 uppercase tracking-widest mb-0.5">{t('chat_generated_invite')}</p>
                  <p className="text-[11px] sm:text-[13px] font-mono text-white font-black tracking-[0.2em]">{inviteCode}</p>
                </div>
                <button 
                  onClick={() => { navigator.clipboard.writeText(inviteCode); }}
                  className="ml-auto sm:ml-2 p-1.5 sm:p-2 hover:bg-white/5 rounded-lg sm:rounded-xl transition-all text-quantum-primary"
                  title={t('chat_copy_code')}
                >
                  <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
             </div>
          ) : (
            <div className="flex flex-row items-center gap-2 bg-white/[0.03] p-1.5 rounded-xl sm:rounded-2xl border border-white/5">
              <div className="relative flex-1 sm:w-48 md:w-64">
                <Mail className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                <input 
                  type="email" 
                  placeholder={t('chat_email_placeholder')}
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-lg sm:rounded-xl py-2 sm:py-3.5 pl-9 sm:pl-11 pr-3 text-[10px] sm:text-[11px] text-white outline-none focus:border-quantum-primary/40 transition-all placeholder:text-gray-700"
                />
              </div>
              <button 
                onClick={sendInvite}
                disabled={!inviteEmail || isInviting}
                className="h-10 sm:h-12 px-4 sm:px-6 bg-white/5 hover:bg-quantum-primary hover:text-black text-white text-[9px] sm:text-[11px] font-black uppercase rounded-lg sm:rounded-xl transition-all border border-white/10 disabled:opacity-30 shrink-0"
              >
                {isInviting ? <Loader2 className="w-3 h-3 animate-spin" /> : t('chat_invite_btn')}
              </button>
            </div>
          )}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-10 space-y-8 sm:space-y-10 scrollbar-hide relative z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,242,255,0.03)_0%,transparent_50%)] pointer-events-none" />
        
        {messages.map((msg) => (
          <motion.div 
            key={msg.id}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`flex w-full ${msg.senderId === socket?.id ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[75%] sm:max-w-[70%] lg:max-w-[60%] flex flex-col ${msg.senderId === socket?.id ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center gap-3 mb-2 px-3">
                <span className="text-[9px] sm:text-[10px] font-mono text-gray-500 uppercase font-black tracking-[0.2em]">{msg.senderName}</span>
                {msg.senderId === 'system' ? <Bot className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-quantum-secondary/60" /> : <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-quantum-primary/50" />}
              </div>
              
              <div className={`p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] relative shadow-2xl w-full ${
                msg.senderId === socket?.id
                  ? 'bg-gradient-to-br from-quantum-primary/20 to-quantum-primary/5 border border-quantum-primary/30 text-white rounded-tr-none' 
                  : msg.senderId === 'system'
                    ? 'bg-white/[0.02] border border-white/5 text-gray-400 font-mono italic text-[10px] sm:text-[11px] rounded-tl-none text-center'
                    : 'bg-white/[0.04] border border-white/10 text-gray-200 rounded-tl-none backdrop-blur-md'
              }`}>
                {msg.isEncrypted && (
                  <div className="mb-4 p-4 bg-black/60 border border-white/5 rounded-2xl flex items-center gap-4 overflow-hidden w-full">
                    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="text-[8px] font-mono text-quantum-primary uppercase tracking-[0.2em] font-black italic whitespace-nowrap">{t('chat_encapsulated_key')}</span>
                        <div className="h-[1px] flex-1 bg-quantum-primary/20" />
                      </div>
                      <span className="text-[9px] font-mono text-quantum-primary/40 break-all leading-tight italic line-clamp-1 group-hover:line-clamp-none transition-all">
                        {msg.cipher}
                      </span>
                    </div>
                    <div className="p-2 bg-quantum-primary/10 rounded-xl shrink-0">
                      <Cpu className="w-4 h-4 text-quantum-primary" />
                    </div>
                  </div>
                )}
                <p className={`text-sm sm:text-base tracking-wide leading-relaxed ${msg.senderId === 'system' ? 'text-[12px] opacity-80' : 'font-medium'}`}>
                  {msg.content}
                </p>
                {msg.isEncrypted && (
                  <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)] animate-pulse" />
                      <span className="text-[8px] font-mono text-green-500/80 uppercase font-black tracking-widest leading-none">{t('chat_nist_compliant')}</span>
                    </div>
                    <Zap className="w-3.5 h-3.5 text-quantum-primary/40" />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="bg-white/5 border border-white/5 px-4 py-3 rounded-full flex gap-1.5">
              <span className="w-1.5 h-1.5 bg-quantum-primary/50 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-quantum-primary/50 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-quantum-primary/50 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </motion.div>
        )}
      </div>

      <div className="p-4 sm:p-10 bg-gradient-to-t from-black to-transparent border-t border-white/5 relative z-20">
        <div className="relative flex items-center max-w-5xl mx-auto">
          <div className="absolute left-4 sm:left-6">
            <Terminal className="w-4 h-4 sm:w-5 h-5 text-gray-500" />
          </div>
          <input 
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t('chat_secure_command')}
            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl sm:rounded-[1.5rem] py-4 sm:py-6 pl-11 sm:pl-16 pr-20 sm:pr-24 text-xs sm:text-base text-white placeholder:text-gray-700 focus:ring-2 focus:ring-quantum-primary/40 shadow-inner outline-none transition-all backdrop-blur-md"
          />
          <button 
            onClick={handleSend}
            disabled={!inputValue.trim() || !roomId}
            className="absolute right-2 sm:right-3 p-3 sm:p-4 bg-quantum-primary text-black rounded-lg sm:rounded-2xl hover:bg-quantum-secondary hover:text-white transition-all disabled:opacity-30 shadow-[0_0_30px_rgba(0,242,255,0.3)]"
          >
            <Send className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
        <div className="mt-4 sm:mt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-14">
          <div className="flex items-center gap-2 sm:gap-3 group">
             <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-quantum-primary animate-pulse group-hover:scale-150 transition-transform" />
             <span className="text-[8px] sm:text-[10px] font-mono text-gray-600 uppercase font-black tracking-[0.2em]">{t('chat_signal_secure')}</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
             <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-700" />
             <span className="text-[8px] sm:text-[10px] font-mono text-gray-600 uppercase font-black tracking-[0.2em]">AES-GCM-256</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 hidden xs:flex">
             <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-700" />
             <span className="text-[8px] sm:text-[10px] font-mono text-gray-600 uppercase font-black tracking-[0.2em]">{t('chat_lattice_enabled')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
