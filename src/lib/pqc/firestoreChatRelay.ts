import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  writeBatch,
  Timestamp,
} from 'firebase/firestore';
import { auth, db, OperationType, handleFirestoreError } from '../../firebase';
import type { ChatPeerPublic, EncryptedWireMessage, PeerKemEnvelope } from './e2eeChatCrypto';

function randomHex(byteCount: number): string {
  const bytes = new Uint8Array(byteCount);
  window.crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function generateInviteCode(length = 6): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = new Uint8Array(length);
  window.crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => alphabet[b % alphabet.length])
    .join('');
}

function toIso(val: unknown): string {
  if (typeof val === 'string' && val) return val;
  if (val instanceof Timestamp) return val.toDate().toISOString();
  if (val && typeof (val as any).toDate === 'function') {
    return (val as any).toDate().toISOString();
  }
  return new Date().toISOString();
}

export function isFirestoreChatAvailable(): boolean {
  return Boolean(auth.currentUser && auth.currentUser.emailVerified);
}

export async function createFirestorePqcRoom(params: {
  publicKeyHex: string;
  displayName?: string;
}): Promise<{
  roomId: string;
  inviteCode: string;
  peerId: string;
  peers: ChatPeerPublic[];
}> {
  const fbUser = auth.currentUser;
  if (!fbUser || !fbUser.emailVerified) {
    throw new Error(
      'Per la Chat PQC su GitHub Pages senza server Node, accedi prima con Google (Cloud Firestore) dalla schermata di login.'
    );
  }

  const cleanPk = params.publicKeyHex.trim().toLowerCase();
  if (!/^[0-9a-f]{2368}$/.test(cleanPk)) {
    throw new Error('Chiave pubblica ML-KEM-768 non valida (richiesti 1184 byte esadecimali).');
  }

  const roomId = randomHex(6).toUpperCase();
  const inviteCode = generateInviteCode(6);
  const peerId = randomHex(8);
  const cleanName =
    params.displayName && params.displayName.trim()
      ? params.displayName.trim().slice(0, 32)
      : `Nodo_${peerId.slice(0, 4).toUpperCase()}`;

  const roomPath = `pqc_rooms/${roomId}`;
  try {
    const batch = writeBatch(db);
    batch.set(doc(db, 'pqc_rooms', roomId), {
      id: roomId,
      inviteCode,
      hostUid: fbUser.uid,
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    batch.set(doc(db, 'pqc_invites', inviteCode), {
      inviteCode,
      roomId,
      hostUid: fbUser.uid,
      createdAt: serverTimestamp(),
    });
    await batch.commit();

    await setDoc(doc(db, 'pqc_rooms', roomId, 'peers', peerId), {
      peerId,
      roomId,
      uid: fbUser.uid,
      name: cleanName,
      publicKey: cleanPk,
      online: true,
      joinedAt: serverTimestamp(),
    });

    return {
      roomId,
      inviteCode,
      peerId,
      peers: [
        {
          peerId,
          name: cleanName,
          publicKey: cleanPk,
          online: true,
        },
      ],
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, roomPath);
  }
}

export async function joinFirestorePqcRoom(params: {
  inviteCode: string;
  publicKeyHex: string;
  displayName?: string;
}): Promise<{
  roomId: string;
  inviteCode: string;
  peerId: string;
  peers: ChatPeerPublic[];
  encryptedHistory: EncryptedWireMessage[];
}> {
  const fbUser = auth.currentUser;
  if (!fbUser || !fbUser.emailVerified) {
    throw new Error(
      'Per entrare in una stanza E2EE via Firestore su GitHub Pages, accedi prima con Google (Cloud Firestore).'
    );
  }

  const cleanCode = params.inviteCode.trim().toUpperCase();
  if (!/^[A-Z0-9]{6,12}$/.test(cleanCode)) {
    throw new Error('Codice invito non valido.');
  }

  const cleanPk = params.publicKeyHex.trim().toLowerCase();
  if (!/^[0-9a-f]{2368}$/.test(cleanPk)) {
    throw new Error('Chiave pubblica ML-KEM-768 non valida.');
  }

  const invitePath = `pqc_invites/${cleanCode}`;
  let roomId = '';
  try {
    const inviteSnap = await getDoc(doc(db, 'pqc_invites', cleanCode));
    if (!inviteSnap.exists()) {
      throw new Error('Codice invito non valido o sessione terminata.');
    }
    roomId = String(inviteSnap.data().roomId || '');
    if (!roomId) {
      throw new Error('Stanza associata non trovata.');
    }
  } catch (error: any) {
    if (error?.message?.includes('Codice invito')) throw error;
    handleFirestoreError(error, OperationType.GET, invitePath);
  }

  const peerId = randomHex(8);
  const cleanName =
    params.displayName && params.displayName.trim()
      ? params.displayName.trim().slice(0, 32)
      : `Nodo_${peerId.slice(0, 4).toUpperCase()}`;

  const peerPath = `pqc_rooms/${roomId}/peers/${peerId}`;
  try {
    await setDoc(doc(db, 'pqc_rooms', roomId, 'peers', peerId), {
      peerId,
      roomId,
      uid: fbUser.uid,
      name: cleanName,
      publicKey: cleanPk,
      online: true,
      joinedAt: serverTimestamp(),
    });

    const peersSnap = await getDocs(
      query(collection(db, 'pqc_rooms', roomId, 'peers'), where('roomId', '==', roomId))
    );
    const peers: ChatPeerPublic[] = peersSnap.docs.map((d) => {
      const data = d.data();
      return {
        peerId: String(data.peerId),
        name: String(data.name),
        publicKey: String(data.publicKey),
        online: Boolean(data.online),
      };
    });

    const msgsSnap = await getDocs(
      query(collection(db, 'pqc_rooms', roomId, 'messages'), where('roomId', '==', roomId))
    );
    const encryptedHistory: EncryptedWireMessage[] = msgsSnap.docs
      .map((d) => {
        const data = d.data();
        return {
          id: String(data.id),
          roomId: String(data.roomId),
          senderPeerId: String(data.senderPeerId),
          senderName: String(data.senderName),
          iv: String(data.iv),
          ciphertext: String(data.ciphertext),
          envelopes: (data.envelopes || {}) as Record<string, PeerKemEnvelope>,
          timestamp: toIso(data.timestamp || data.createdAt),
        };
      })
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return {
      roomId,
      inviteCode: cleanCode,
      peerId,
      peers,
      encryptedHistory,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, peerPath);
  }
}

export async function rotateFirestoreInviteCode(params: {
  roomId: string;
  oldInviteCode: string;
}): Promise<string> {
  const fbUser = auth.currentUser;
  if (!fbUser || !fbUser.emailVerified) {
    throw new Error('Autenticazione Firestore richiesta.');
  }

  const newCode = generateInviteCode(6);
  const path = `pqc_rooms/${params.roomId}`;
  try {
    const batch = writeBatch(db);
    if (params.oldInviteCode) {
      batch.delete(doc(db, 'pqc_invites', params.oldInviteCode));
    }
    batch.set(doc(db, 'pqc_invites', newCode), {
      inviteCode: newCode,
      roomId: params.roomId,
      hostUid: fbUser.uid,
      createdAt: serverTimestamp(),
    });
    batch.update(doc(db, 'pqc_rooms', params.roomId), {
      inviteCode: newCode,
      updatedAt: serverTimestamp(),
    });
    await batch.commit();
    return newCode;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function sendFirestoreEncryptedMessage(params: {
  roomId: string;
  messageId: string;
  senderPeerId: string;
  senderName: string;
  iv: string;
  ciphertext: string;
  envelopes: Record<string, PeerKemEnvelope>;
}): Promise<void> {
  const fbUser = auth.currentUser;
  if (!fbUser || !fbUser.emailVerified) {
    throw new Error('Autenticazione Firestore richiesta.');
  }

  const cleanMsgId = params.messageId.replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 128);
  const cleanSenderName = (params.senderName || 'Nodo').trim().slice(0, 32) || 'Nodo';
  const path = `pqc_rooms/${params.roomId}/messages/${cleanMsgId}`;
  try {
    await setDoc(doc(db, 'pqc_rooms', params.roomId, 'messages', cleanMsgId), {
      id: cleanMsgId,
      roomId: params.roomId,
      senderUid: fbUser.uid,
      senderPeerId: params.senderPeerId,
      senderName: cleanSenderName,
      iv: params.iv,
      ciphertext: params.ciphertext,
      envelopes: params.envelopes,
      timestamp: new Date().toISOString(),
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function leaveFirestorePqcRoom(roomId: string, peerId: string): Promise<void> {
  const fbUser = auth.currentUser;
  if (!fbUser || !fbUser.emailVerified) return;
  try {
    await deleteDoc(doc(db, 'pqc_rooms', roomId, 'peers', peerId));
  } catch (err) {
    console.warn('Firestore leave peer cleanup warning:', err);
  }
}

export function subscribeFirestorePqcRoom(params: {
  roomId: string;
  onPeers: (peers: ChatPeerPublic[]) => void;
  onMessage: (wireMsg: EncryptedWireMessage) => void;
  onError: (errMsg: string) => void;
}): () => void {
  const peersPath = `pqc_rooms/${params.roomId}/peers`;
  const msgsPath = `pqc_rooms/${params.roomId}/messages`;

  const unsubPeers = onSnapshot(
    query(collection(db, 'pqc_rooms', params.roomId, 'peers'), where('roomId', '==', params.roomId)),
    (snap) => {
      const peers: ChatPeerPublic[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          peerId: String(data.peerId),
          name: String(data.name),
          publicKey: String(data.publicKey),
          online: Boolean(data.online),
        };
      });
      params.onPeers(peers);
    },
    (error) => {
      params.onError(error.message);
      handleFirestoreError(error, OperationType.LIST, peersPath);
    }
  );

  const unsubMsgs = onSnapshot(
    query(collection(db, 'pqc_rooms', params.roomId, 'messages'), where('roomId', '==', params.roomId)),
    (snap) => {
      const addedMsgs: EncryptedWireMessage[] = [];
      for (const change of snap.docChanges()) {
        if (change.type === 'added') {
          const data = change.doc.data();
          addedMsgs.push({
            id: String(data.id),
            roomId: String(data.roomId),
            senderPeerId: String(data.senderPeerId),
            senderName: String(data.senderName),
            iv: String(data.iv),
            ciphertext: String(data.ciphertext),
            envelopes: (data.envelopes || {}) as Record<string, PeerKemEnvelope>,
            timestamp: toIso(data.timestamp || data.createdAt),
          });
        }
      }
      addedMsgs
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        .forEach((m) => params.onMessage(m));
    },
    (error) => {
      params.onError(error.message);
      handleFirestoreError(error, OperationType.LIST, msgsPath);
    }
  );

  return () => {
    unsubPeers();
    unsubMsgs();
  };
}
