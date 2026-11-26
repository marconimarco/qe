import { ml_kem768 } from '@noble/post-quantum/ml-kem.js';
import { zeroizeBuffer } from './zeroTraceMemory';

export interface ClientMlKemKeyPair {
  publicKeyHex: string;
  secretKeyBytes: Uint8Array;
}

export interface ChatPeerPublic {
  peerId: string;
  name: string;
  publicKey: string; // ML-KEM-768 public key (hex, 1184 bytes)
  online?: boolean;
}

export interface PeerKemEnvelope {
  kemCiphertext: string; // Base64 (1088 bytes ML-KEM-768 ciphertext)
  wrapIv: string; // Base64 (12 bytes AES-GCM IV)
  wrappedKey: string; // Base64 (AES-256-GCM wrapped 32-byte message key + 16B tag)
}

export interface EncryptedWireMessage {
  id: string;
  roomId: string;
  senderPeerId: string;
  senderName: string;
  iv: string; // Base64 (12 bytes)
  ciphertext: string; // Base64 (AES-256-GCM ciphertext + tag)
  envelopes: Record<string, PeerKemEnvelope>;
  timestamp: string;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.trim().replace(/\s+/g, '');
  if (clean.length % 2 !== 0 || !/^[0-9a-fA-F]+$/.test(clean)) {
    throw new Error('Chiave esadecimale non valida.');
  }
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    out[i] = binary.charCodeAt(i);
  }
  return out;
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const buf = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buf).set(bytes);
  return buf;
}

async function deriveKeyWrapAesKey(sharedSecret: Uint8Array, kemCiphertext: Uint8Array): Promise<CryptoKey> {
  const combined = new Uint8Array(sharedSecret.length + kemCiphertext.length);
  combined.set(sharedSecret, 0);
  combined.set(kemCiphertext, sharedSecret.length);
  try {
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', toArrayBuffer(combined));
    return await window.crypto.subtle.importKey(
      'raw',
      hashBuffer,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  } finally {
    zeroizeBuffer(combined);
  }
}

/**
 * Generates a real NIST FIPS 203 ML-KEM-768 keypair strictly inside browser RAM.
 * Secret key (2400 bytes) never leaves the client.
 */
export function generateClientMlKemKeyPair(): ClientMlKemKeyPair {
  const { publicKey, secretKey } = ml_kem768.keygen();
  return {
    publicKeyHex: bytesToHex(publicKey),
    secretKeyBytes: secretKey,
  };
}

/**
 * Encrypts a chat message end-to-end in the browser:
 * 1. Fresh random 256-bit message key + 96-bit IV encrypts plaintext via AES-256-GCM (authenticated AAD).
 * 2. For every participant's ML-KEM-768 public key in the room, encapsulates a unique shared secret
 *    and wraps the message key so ONLY holders of matching private keys can decrypt.
 * Zero plaintext ever leaves the browser.
 */
export async function encryptE2EERoomMessage(params: {
  plaintext: string;
  roomId: string;
  messageId: string;
  senderPeerId: string;
  peers: ChatPeerPublic[];
}): Promise<{
  iv: string;
  ciphertext: string;
  envelopes: Record<string, PeerKemEnvelope>;
}> {
  const { plaintext, roomId, messageId, senderPeerId, peers } = params;
  if (!peers || peers.length === 0) {
    throw new Error('Nessun partecipante attivo nella stanza per l’incapsulamento PQC.');
  }

  const msgKeyBytes = new Uint8Array(32);
  const msgIvBytes = new Uint8Array(12);
  window.crypto.getRandomValues(msgKeyBytes);
  window.crypto.getRandomValues(msgIvBytes);

  const aadBytes = new TextEncoder().encode(`${roomId}|${senderPeerId}|${messageId}`);
  const plainBytes = new TextEncoder().encode(plaintext);

  try {
    const aesMsgKey = await window.crypto.subtle.importKey(
      'raw',
      toArrayBuffer(msgKeyBytes),
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    );

    const encryptedMsgBuf = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: toArrayBuffer(msgIvBytes),
        additionalData: toArrayBuffer(aadBytes),
      },
      aesMsgKey,
      toArrayBuffer(plainBytes)
    );

    const envelopes: Record<string, PeerKemEnvelope> = {};

    for (const peer of peers) {
      if (!peer.publicKey) continue;
      const peerPkBytes = hexToBytes(peer.publicKey);
      const { cipherText: kemCt, sharedSecret } = ml_kem768.encapsulate(peerPkBytes);
      try {
        const wrapKey = await deriveKeyWrapAesKey(sharedSecret, kemCt);
        const wrapIv = new Uint8Array(12);
        window.crypto.getRandomValues(wrapIv);

        const wrappedKeyBuf = await window.crypto.subtle.encrypt(
          { name: 'AES-GCM', iv: toArrayBuffer(wrapIv) },
          wrapKey,
          toArrayBuffer(msgKeyBytes)
        );

        envelopes[peer.peerId] = {
          kemCiphertext: bytesToBase64(kemCt),
          wrapIv: bytesToBase64(wrapIv),
          wrappedKey: bytesToBase64(new Uint8Array(wrappedKeyBuf)),
        };
      } finally {
        zeroizeBuffer(sharedSecret);
      }
    }

    return {
      iv: bytesToBase64(msgIvBytes),
      ciphertext: bytesToBase64(new Uint8Array(encryptedMsgBuf)),
      envelopes,
    };
  } finally {
    zeroizeBuffer(msgKeyBytes);
    zeroizeBuffer(plainBytes);
  }
}

/**
 * Decapsulates the recipient's ML-KEM-768 envelope with their local secret key
 * and verifies/decrypts the AES-256-GCM ciphertext inside the browser.
 */
export async function decryptE2EERoomMessage(params: {
  wireMessage: EncryptedWireMessage;
  myPeerId: string;
  mySecretKeyBytes: Uint8Array;
}): Promise<{
  plaintext: string;
  kemCiphertextHexPreview: string;
}> {
  const { wireMessage, myPeerId, mySecretKeyBytes } = params;
  const envelope = wireMessage.envelopes?.[myPeerId];
  if (!envelope) {
    throw new Error('Nessun envelope ML-KEM-768 destinato a questa sessione (Forward Secrecy attiva).');
  }

  const kemCtBytes = base64ToBytes(envelope.kemCiphertext);
  const wrapIvBytes = base64ToBytes(envelope.wrapIv);
  const wrappedKeyBytes = base64ToBytes(envelope.wrappedKey);
  const msgIvBytes = base64ToBytes(wireMessage.iv);
  const ciphertextBytes = base64ToBytes(wireMessage.ciphertext);
  const aadBytes = new TextEncoder().encode(
    `${wireMessage.roomId}|${wireMessage.senderPeerId}|${wireMessage.id}`
  );

  const sharedSecret = ml_kem768.decapsulate(kemCtBytes, mySecretKeyBytes);
  let msgKeyBytes: Uint8Array | null = null;

  try {
    const wrapKey = await deriveKeyWrapAesKey(sharedSecret, kemCtBytes);
    const unwrappedBuf = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: toArrayBuffer(wrapIvBytes) },
      wrapKey,
      toArrayBuffer(wrappedKeyBytes)
    );
    msgKeyBytes = new Uint8Array(unwrappedBuf);

    const aesMsgKey = await window.crypto.subtle.importKey(
      'raw',
      toArrayBuffer(msgKeyBytes),
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );

    const decryptedBuf = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: toArrayBuffer(msgIvBytes),
        additionalData: toArrayBuffer(aadBytes),
      },
      aesMsgKey,
      toArrayBuffer(ciphertextBytes)
    );

    const plaintext = new TextDecoder().decode(decryptedBuf);
    return {
      plaintext,
      kemCiphertextHexPreview: bytesToHex(kemCtBytes.subarray(0, 24)),
    };
  } finally {
    zeroizeBuffer(sharedSecret);
    if (msgKeyBytes) zeroizeBuffer(msgKeyBytes);
  }
}
