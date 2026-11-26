import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
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
  Copy,
  Check,
  ArrowLeft,
  Loader2,
  RefreshCcw,
  Users,
  AlertTriangle
} from 'lucide-react';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import { useTranslation } from '../../lib/TranslationContext';
import {
  generateClientMlKemKeyPair,
  encryptE2EERoomMessage,
  decryptE2EERoomMessage,
  ChatPeerPublic,
  EncryptedWireMessage
} from '../../lib/pqc/e2eeChatCrypto';
import { zeroizeBuffer } from '../../lib/pqc/zeroTraceMemory';

interface UiChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  systemKind?: 'created' | 'authorized';
  roomCode?: string;
  kemCipherPreview?: string;
  isEncrypted?: boolean;
  decryptError?: string;
  timestamp?: string;
}

export default function QuantumChat({ onBack }: { onBack?: (forceHome?: boolean) => void }) {
  const { t } = useTranslation();
  const [view, setView] = useState<'lobby' | 'chat'>('lobby');
  const [displayName, setDisplayName] = useState('');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [myPeerId, setMyPeerId] = useState<string | null>(null);
  const [myPeerToken, setMyPeerToken] = useState<string | null>(null);
  const [peers, setPeers] = useState<ChatPeerPublic[]>([]);
  const [messages, setMessages] = useState<UiChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isRotatingCode, setIsRotatingCode] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [lobbyError, setLobbyError] = useState<string | null>(null);
  const [roomError, setRoomError] = useState<string | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const mySecretKeyRef = useRef<Uint8Array | null>(null);
  const myPeerIdRef = useRef<string | null>(null);
  const roomIdRef = useRef<string | null>(null);
  const peerTokenRef = useRef<string | null>(null);
  const seenMessageIdsRef = useRef<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    myPeerIdRef.current = myPeerId;
    roomIdRef.current = roomId;
    peerTokenRef.current = myPeerToken;
  }, [myPeerId, roomId, myPeerToken]);

  const scrubLocalSessionKeys = useCallback(() => {
    if (mySecretKeyRef.current) {
      zeroizeBuffer(mySecretKeyRef.current);
      mySecretKeyRef.current = null;
    }
    seenMessageIdsRef.current.clear();
  }, []);

  const decryptIncomingWireMessage = useCallback(async (wireMsg: EncryptedWireMessage): Promise<UiChatMessage> => {
    const activePeerId = myPeerIdRef.current;
    const skBytes = mySecretKeyRef.current;
    if (!activePeerId || !skBytes) {
      return {
        id: wireMsg.id,
        senderId: wireMsg.senderPeerId,
        senderName: wireMsg.senderName,
        content: '[Chiave privata locale non disponibile]',
        isEncrypted: true,
        decryptError: 'Chiave privata assente',
        timestamp: wireMsg.timestamp,
      };
    }

    try {
      const { plaintext, kemCiphertextHexPreview } = await decryptE2EERoomMessage({
        wireMessage: wireMsg,
        myPeerId: activePeerId,
        mySecretKeyBytes: skBytes,
      });
      return {
        id: wireMsg.id,
        senderId: wireMsg.senderPeerId,
        senderName: wireMsg.senderName,
        content: plaintext,
        kemCipherPreview: kemCiphertextHexPreview,
        isEncrypted: true,
        timestamp: wireMsg.timestamp,
      };
    } catch (err: any) {
      return {
        id: wireMsg.id,
        senderId: wireMsg.senderPeerId,
        senderName: wireMsg.senderName,
        content:
          '[Messaggio cifrato prima del tuo ingresso: Forward Secrecy attiva, chiave non incapsulata per questo dispositivo]',
        isEncrypted: true,
        decryptError: err?.message || 'Decapsulamento ML-KEM fallito',
        timestamp: wireMsg.timestamp,
      };
    }
  }, []);

  // Real-time Socket.IO connection with E2EE authentication & auto-rejoin
  useEffect(() => {
    const sock = io();
    socketRef.current = sock;

    sock.on('connect', () => {
      setSocketConnected(true);
      if (roomIdRef.current && myPeerIdRef.current && peerTokenRef.current) {
        sock.emit('join-room', {
          roomId: roomIdRef.current,
          peerId: myPeerIdRef.current,
          peerToken: peerTokenRef.current,
        });
      }
    });

    sock.on('disconnect', () => {
      setSocketConnected(false);
    });

    sock.on('room-error', (payload: { error?: string }) => {
      if (payload?.error) setRoomError(payload.error);
    });

    sock.on('peers-updated', (payload: { peers: ChatPeerPublic[] }) => {
      if (Array.isArray(payload?.peers)) {
        setPeers(payload.peers);
      }
    });

    sock.on('new-message', async (wireMsg: EncryptedWireMessage) => {
      if (!wireMsg?.id || seenMessageIdsRef.current.has(wireMsg.id)) return;
      seenMessageIdsRef.current.add(wireMsg.id);
      const uiMsg = await decryptIncomingWireMessage(wireMsg);
      setMessages((prev) => (prev.some((m) => m.id === uiMsg.id) ? prev : [...prev, uiMsg]));
    });

    return () => {
      sock.emit('leave-room');
      sock.close();
      socketRef.current = null;
      scrubLocalSessionKeys();
    };
  }, [decryptIncomingWireMessage, scrubLocalSessionKeys]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const createRoom = async () => {
    setLobbyError(null);
    setRoomError(null);
    setIsCreating(true);
    try {
      scrubLocalSessionKeys();
      // Generate real FIPS 203 ML-KEM-768 keypair purely in browser RAM
      const kp = generateClientMlKemKeyPair();
      mySecretKeyRef.current = kp.secretKeyBytes;

      const response = await axios.post('/api/pqc/chat/create-room', {
        publicKey: kp.publicKeyHex,
        displayName: displayName.trim() || undefined,
      });

      const {
        roomId: newRoomId,
        inviteCode: newInviteCode,
        peerId: newPeerId,
        peerToken: newPeerToken,
        peers: initialPeers,
      } = response.data;

      myPeerIdRef.current = newPeerId;
      roomIdRef.current = newRoomId;
      peerTokenRef.current = newPeerToken;

      setRoomId(newRoomId);
      setInviteCode(newInviteCode);
      setMyPeerId(newPeerId);
      setMyPeerToken(newPeerToken);
      setPeers(initialPeers || []);
      setView('chat');

      socketRef.current?.emit('join-room', {
        roomId: newRoomId,
        peerId: newPeerId,
        peerToken: newPeerToken,
      });

      setMessages([
        {
          id: 'sys-created',
          senderId: 'system',
          senderName: 'SYSTEM',
          systemKind: 'created',
          roomCode: newInviteCode,
          content: `Sessione E2EE creata (ID #${newRoomId}). Codice invito: ${newInviteCode}. Condividi il codice con un altro utente/scheda per chattare con ML-KEM-768 reale.`,
          isEncrypted: false,
        },
      ]);
    } catch (error: any) {
      scrubLocalSessionKeys();
      setLobbyError(error?.response?.data?.error || 'Impossibile creare la stanza E2EE.');
    } finally {
      setIsCreating(false);
    }
  };

  const joinWithCode = async () => {
    const cleanCode = joinCode.trim().toUpperCase();
    if (!cleanCode) return;
    setLobbyError(null);
    setRoomError(null);
    setIsJoining(true);

    try {
      scrubLocalSessionKeys();
      const kp = generateClientMlKemKeyPair();
      mySecretKeyRef.current = kp.secretKeyBytes;

      const response = await axios.post('/api/pqc/chat/validate-code', {
        code: cleanCode,
        publicKey: kp.publicKeyHex,
        displayName: displayName.trim() || undefined,
      });

      const {
        roomId: joinedRoomId,
        inviteCode: roomInviteCode,
        peerId: newPeerId,
        peerToken: newPeerToken,
        peers: currentPeers,
        encryptedHistory,
      } = response.data;

      myPeerIdRef.current = newPeerId;
      roomIdRef.current = joinedRoomId;
      peerTokenRef.current = newPeerToken;

      setRoomId(joinedRoomId);
      setInviteCode(roomInviteCode);
      setMyPeerId(newPeerId);
      setMyPeerToken(newPeerToken);
      setPeers(currentPeers || []);
      setView('chat');

      socketRef.current?.emit('join-room', {
        roomId: joinedRoomId,
        peerId: newPeerId,
        peerToken: newPeerToken,
      });

      const historyUi: UiChatMessage[] = [
        {
          id: 'sys-joined',
          senderId: 'system',
          senderName: 'SYSTEM',
          systemKind: 'authorized',
          roomCode: joinedRoomId,
          content: `Accesso E2EE autorizzato (Stanza #${joinedRoomId}). Chiave ML-KEM-768 generata localmente nel browser.`,
          isEncrypted: false,
        },
      ];

      if (Array.isArray(encryptedHistory)) {
        for (const wireMsg of encryptedHistory as EncryptedWireMessage[]) {
          seenMessageIdsRef.current.add(wireMsg.id);
          historyUi.push(await decryptIncomingWireMessage(wireMsg));
        }
      }

      setMessages(historyUi);
    } catch (error: any) {
      scrubLocalSessionKeys();
      setLobbyError(error?.response?.data?.error || t('chat_invalid_code'));
    } finally {
      setIsJoining(false);
    }
  };

  const rotateInviteCode = async () => {
    if (!roomId || !myPeerId || !myPeerToken) return;
    setIsRotatingCode(true);
    try {
      const response = await axios.post('/api/pqc/chat/rotate-invite', {
        roomId,
        peerId: myPeerId,
        peerToken: myPeerToken,
      });
      if (response.data?.inviteCode) {
        setInviteCode(response.data.inviteCode);
      }
    } catch (error: any) {
      setRoomError(error?.response?.data?.error || 'Impossibile rigenerare il codice.');
    } finally {
      setIsRotatingCode(false);
    }
  };

  const handleLeaveRoom = () => {
    socketRef.current?.emit('leave-room');
    scrubLocalSessionKeys();
    setView('lobby');
    setRoomId(null);
    setInviteCode(null);
    setMyPeerId(null);
    setMyPeerToken(null);
    setPeers([]);
    setMessages([]);
    setRoomError(null);
  };

  const handleSend = async () => {
    const plaintext = inputValue.trim();
    if (!plaintext || !roomId || !myPeerId || isSending) return;

    setIsSending(true);
    setRoomError(null);
    try {
      const messageId =
        typeof window.crypto?.randomUUID === 'function'
          ? window.crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

      const targetPeers =
        peers.length > 0
          ? peers
          : [];

      const { iv, ciphertext, envelopes } = await encryptE2EERoomMessage({
        plaintext,
        roomId,
        messageId,
        senderPeerId: myPeerId,
        peers: targetPeers,
      });

      // Emit ONLY ciphertext + per-peer ML-KEM-768 envelopes (ZERO plaintext on wire)
      socketRef.current?.emit('send-message', {
        roomId,
        id: messageId,
        iv,
        ciphertext,
        envelopes,
      });

      setInputValue('');
    } catch (error: any) {
      setRoomError(error?.message || 'Errore durante la cifratura E2EE del messaggio.');
    } finally {
      setIsSending(false);
    }
  };

  const copyInviteCode = () => {
    if (!inviteCode) return;
    navigator.clipboard.writeText(inviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (view === 'lobby') {
    return (
      <div className="max-w-2xl mx-auto space-y-8 py-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
        <div className="text-center space-y-4">
          <div className="relative inline-flex mb-1">
            <div className="absolute inset-0 bg-quantum-primary/20 blur-2xl rounded-full" />
            <div className="relative p-5 bg-black/40 border border-quantum-primary/30 rounded-3xl">
              <MessageSquare className="w-12 h-12 text-quantum-primary" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl sm:text-5xl font-display font-black text-white uppercase tracking-tighter leading-none">
              Quantum <span className="text-quantum-primary drop-shadow-[0_0_10px_rgba(0,242,255,0.5)]">{t('chat_title')}</span>
            </h2>
            <p className="text-[10px] sm:text-[11px] text-gray-400 font-mono uppercase tracking-[0.25em] max-w-lg mx-auto leading-relaxed">
              E2EE Reale • NIST FIPS 203 ML-KEM-768 + WebCrypto AES-256-GCM
            </p>
          </div>
        </div>

        {/* Optional Alias */}
        <div className="quantum-card bg-black/50 border-white/10 p-5 space-y-2">
          <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-bold block">
            Nome Nodo / Alias Sessione (opzionale)
          </label>
          <input
            type="text"
            maxLength={32}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Es. Alice_Lab"
            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-xs text-white font-mono focus:ring-2 focus:ring-quantum-primary/50 outline-none"
          />
        </div>

        {lobbyError && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-2.5 text-xs font-mono text-red-300">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{lobbyError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-5">
          <button
            onClick={createRoom}
            disabled={isCreating}
            className="quantum-card bg-black/60 border-quantum-primary/20 hover:border-quantum-primary/50 transition-all group p-8 flex items-center justify-between relative overflow-hidden cursor-pointer disabled:opacity-50"
          >
            <div className="absolute top-0 right-0 p-2 opacity-5 italic font-mono text-4xl select-none">{t('chat_badge_create')}</div>
            <div className="flex items-center gap-6 text-left relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-quantum-primary/10 flex items-center justify-center border border-quantum-primary/20 group-hover:scale-110 transition-transform">
                {isCreating ? <Loader2 className="w-8 h-8 text-quantum-primary animate-spin" /> : <Plus className="w-8 h-8 text-quantum-primary" />}
              </div>
              <div>
                <h3 className="text-white font-display font-bold uppercase tracking-[0.15em] text-sm">{t('chat_new_session')}</h3>
                <p className="text-[10px] text-gray-400 uppercase mt-1.5 tracking-wider">
                  Genera coppia ML-KEM-768 locale e ottieni un codice stanza reale
                </p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-gray-700 group-hover:text-quantum-primary group-hover:translate-x-1 transition-all" />
          </button>

          <div className="quantum-card bg-black/60 border-white/10 p-8 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-5 italic font-mono text-4xl select-none">{t('chat_badge_join')}</div>
            <div className="flex items-center gap-6 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5">
                <KeyIcon className="w-8 h-8 text-gray-500" />
              </div>
              <div>
                <h3 className="text-white font-display font-bold uppercase tracking-[0.15em] text-sm">{t('chat_quick_access')}</h3>
                <p className="text-[10px] text-gray-400 uppercase mt-1.5 tracking-wider">
                  Inserisci il codice stanza generato da un altro dispositivo o scheda del browser
                </p>
              </div>
            </div>

            <div className="flex gap-3 relative z-10">
              <input
                type="text"
                placeholder={t('chat_code_placeholder')}
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && joinWithCode()}
                className="flex-1 bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white uppercase tracking-[0.35em] font-mono focus:ring-2 focus:ring-quantum-primary/50 outline-none transition-all placeholder:text-gray-700"
              />
              <button
                onClick={joinWithCode}
                disabled={!joinCode.trim() || isJoining}
                className="px-8 bg-quantum-primary text-black text-[11px] font-black uppercase rounded-2xl hover:bg-quantum-secondary hover:text-white transition-all disabled:opacity-30 flex items-center justify-center shadow-[0_0_20px_rgba(0,242,255,0.2)] cursor-pointer"
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
    <div className="max-w-5xl mx-auto h-[85vh] lg:h-[750px] max-h-[900px] flex flex-col bg-black/70 backdrop-blur-3xl border border-white/10 rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.5)] relative animate-in fade-in zoom-in-95 duration-500">
      {/* Header */}
      <div className="p-4 sm:p-6 bg-white/[0.02] border-b border-white/5 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 relative z-20">
        <div className="flex items-center gap-3 sm:gap-5">
          <button
            onClick={handleLeaveRoom}
            className="p-2 sm:p-3 bg-white/5 hover:bg-white/10 rounded-xl sm:rounded-2xl transition-all text-gray-400 hover:text-white cursor-pointer"
            title="Esci e azzera chiave locale"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-quantum-primary/10 border border-quantum-primary/20 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 sm:w-6 h-6 text-quantum-primary" />
                <div
                  className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${
                    socketConnected ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-amber-500'
                  }`}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-white font-display font-black uppercase tracking-[0.15em] text-[11px] sm:text-[13px]">
                  {t('chat_secure_session')}
                </h3>
                <span className="px-1.5 py-0.5 bg-quantum-primary/15 text-quantum-primary text-[9px] font-mono font-bold rounded-md border border-quantum-primary/20 tracking-widest">
                  #{roomId}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1 text-[9px] font-mono text-emerald-400 uppercase font-bold">
                  <Users className="w-3 h-3" />
                  {peers.length} {peers.length === 1 ? 'Nodo attivo' : 'Nodi attivi'}
                </span>
                <span className="text-[9px] font-mono text-gray-500">
                  ({peers.map((p) => (p.peerId === myPeerId ? `${p.name} (Tu)` : p.name)).join(', ')})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Real Invite Code Sharing Bar (no fake email simulator) */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {inviteCode && (
            <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/10 border border-emerald-500/25 rounded-xl">
              <div>
                <p className="text-[8px] font-mono text-gray-400 uppercase tracking-widest">Codice Invito Reale</p>
                <p className="text-xs sm:text-sm font-mono text-white font-black tracking-[0.25em]">{inviteCode}</p>
              </div>
              <button
                onClick={copyInviteCode}
                className="p-2 bg-white/5 hover:bg-quantum-primary hover:text-black rounded-lg transition-all text-quantum-primary cursor-pointer"
                title={t('chat_copy_code')}
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                onClick={rotateInviteCode}
                disabled={isRotatingCode}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all text-gray-300 cursor-pointer disabled:opacity-40"
                title="Rigenera codice invito"
              >
                <RefreshCcw className={`w-4 h-4 ${isRotatingCode ? 'animate-spin' : ''}`} />
              </button>
            </div>
          )}
        </div>
      </div>

      {roomError && (
        <div className="mx-6 mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-xs font-mono text-red-300">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{roomError}</span>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 scrollbar-hide relative z-10">
        {messages.map((msg) => {
          const isMe = msg.senderId === myPeerId;
          const isSystem = msg.senderId === 'system';
          const displaySender = isSystem ? t('chat_system') : isMe ? `${msg.senderName} (${t('chat_you')})` : msg.senderName;

          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] sm:max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-2 mb-1.5 px-2">
                  <span className="text-[9px] font-mono text-gray-400 uppercase font-bold tracking-wider">
                    {displaySender}
                  </span>
                  {isSystem ? (
                    <Bot className="w-3.5 h-3.5 text-quantum-secondary/60" />
                  ) : (
                    <User className="w-3.5 h-3.5 text-quantum-primary/50" />
                  )}
                </div>

                <div
                  className={`p-4 sm:p-5 rounded-2xl relative shadow-xl w-full ${
                    isMe
                      ? 'bg-gradient-to-br from-quantum-primary/20 to-quantum-primary/5 border border-quantum-primary/30 text-white rounded-tr-none'
                      : isSystem
                      ? 'bg-white/[0.02] border border-white/10 text-gray-300 font-mono text-[11px] rounded-tl-none'
                      : 'bg-white/[0.05] border border-white/15 text-gray-100 rounded-tl-none backdrop-blur-md'
                  }`}
                >
                  {msg.isEncrypted && msg.kemCipherPreview && (
                    <div className="mb-3 p-2.5 bg-black/60 border border-white/10 rounded-xl flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <span className="text-[8px] font-mono text-quantum-primary uppercase tracking-widest font-bold block">
                          ML-KEM-768 CIPHERTEXT HEADER
                        </span>
                        <span className="text-[9px] font-mono text-quantum-primary/60 break-all">
                          0x{msg.kemCipherPreview}...
                        </span>
                      </div>
                      <Cpu className="w-4 h-4 text-quantum-primary shrink-0" />
                    </div>
                  )}

                  <p className={`text-sm tracking-wide leading-relaxed ${msg.decryptError ? 'text-amber-300 italic text-xs font-mono' : ''}`}>
                    {msg.content}
                  </p>

                  {msg.isEncrypted && !msg.decryptError && (
                    <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                        <span className="text-[8px] font-mono text-emerald-400 uppercase font-bold tracking-widest">
                          Decifrato E2EE in locale (FIPS 203)
                        </span>
                      </div>
                      <Lock className="w-3 h-3 text-quantum-primary/60" />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Input */}
      <div className="p-4 sm:p-6 bg-gradient-to-t from-black to-transparent border-t border-white/5 relative z-20">
        <div className="relative flex items-center max-w-5xl mx-auto">
          <div className="absolute left-4 sm:left-5">
            <Terminal className="w-4 h-4 sm:w-5 h-5 text-gray-500" />
          </div>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t('chat_secure_command')}
            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-11 sm:pl-14 pr-20 text-xs sm:text-sm text-white placeholder:text-gray-600 focus:ring-2 focus:ring-quantum-primary/40 shadow-inner outline-none transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || !roomId || isSending}
            className="absolute right-2 p-3 bg-quantum-primary text-black rounded-xl hover:bg-cyan-300 transition-all disabled:opacity-30 shadow-[0_0_25px_rgba(0,242,255,0.25)] cursor-pointer"
          >
            {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-6 text-[9px] font-mono text-gray-500 uppercase font-bold tracking-widest">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Zero Plaintext Server Relay</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-quantum-primary" />
            <span>AES-GCM-256 (WebCrypto)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-quantum-primary" />
            <span>ML-KEM-768 Per-Peer Envelopes</span>
          </div>
        </div>
      </div>
    </div>
  );
}
