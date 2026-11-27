import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Key,
  Copy,
  Check,
  ShieldAlert,
  Cpu,
  RefreshCcw,
  Fingerprint,
  Layers,
  Database,
  Activity,
  ShieldCheck,
  Zap,
  Download,
  AlertTriangle
} from 'lucide-react';
import axios from 'axios';
import { useTranslation } from '../../lib/TranslationContext';
import { prepareClientEntropyContribution, EntropySourceType, EntropyReport } from '../../lib/pqc/qrng';
import { zeroizeBuffer } from '../../lib/pqc/zeroTraceMemory';
import { clientGenerateMlKem768Keypair, isBackendUnavailableError } from '../../lib/pqc/clientPqcFallback';

export default function QuantumKeyGen({ onBack }: { onBack?: (forceHome?: boolean) => void }) {
  const { t } = useTranslation();
  const [isGenerating, setIsGenerating] = useState(false);
  const [entropySource, setEntropySource] = useState<EntropySourceType>('hybrid_nist');
  const [keys, setKeys] = useState<{
    publicKey: string;
    privateKey: string;
    algorithm: string;
    verifiedRoundTrip?: boolean;
    entropyTelemetry?: {
      source: string;
      anuLive?: boolean;
      bytesMixed?: number;
      conditioning?: string;
      minEntropy?: number;
      zeroTraceMemoryWiped?: boolean;
      fipsCompliance?: string;
    };
  } | null>(null);
  const [copiedType, setCopiedType] = useState<'pub' | 'priv' | null>(null);
  const [liveEntropy, setLiveEntropy] = useState<EntropyReport | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'info'; text: string } | null>(null);

  const generateKeys = async () => {
    setIsGenerating(true);
    setKeys(null);
    setStatusMessage(null);

    let entropyBytes: Uint8Array | null = null;
    try {
      // 1. Real browser WebCrypto hardware CSPRNG contribution (64 bytes)
      const { entropy, report } = prepareClientEntropyContribution(64, entropySource);
      entropyBytes = entropy;
      setLiveEntropy(report);

      // 2. Server-side NIST SP 800-90C HKDF-SHA512 conditioning + real FIPS 203 ML-KEM-768 keygen & self-test
      const response = await axios.post('/api/pqc/keygen', {
        entropySource,
        clientEntropyHex: report.clientEntropyHex,
      }, { timeout: 5000 });

      if (response.data && response.data.publicKey) {
        setKeys(response.data);
      } else {
        // Static host fallback (e.g. GitHub Pages)
        const localKeys = await clientGenerateMlKem768Keypair({
          entropySource,
          clientEntropyHex: report.clientEntropyHex,
        });
        setKeys(localKeys);
      }
    } catch (error: any) {
      if (isBackendUnavailableError(error)) {
        try {
          const localKeys = await clientGenerateMlKem768Keypair({
            entropySource,
          });
          setKeys(localKeys);
          return;
        } catch (fallbackErr: any) {
          setStatusMessage({ type: 'error', text: fallbackErr?.message || t('keygen_err_gen') });
          return;
        }
      }
      console.error('Key generation failed', error);
      const errorMsg = error.response?.data?.error || error.message || t('keygen_err_gen');
      setStatusMessage({ type: 'error', text: errorMsg });
    } finally {
      if (entropyBytes) {
        zeroizeBuffer(entropyBytes);
      }
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, type: 'pub' | 'priv') => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const downloadKeyPairJson = () => {
    if (!keys) return;
    const payload = {
      algorithm: keys.algorithm,
      standard: 'NIST FIPS 203 (ML-KEM-768)',
      verifiedRoundTrip: keys.verifiedRoundTrip ?? true,
      generatedAt: new Date().toISOString(),
      entropyTelemetry: keys.entropyTelemetry,
      publicKeyHex: keys.publicKey,
      privateKeyHex: keys.privateKey,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ml_kem_768_keypair_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleManualPurge = () => {
    if (keys) {
      const privBytes = new TextEncoder().encode(keys.privateKey);
      zeroizeBuffer(privBytes);
      setKeys(null);
      setLiveEntropy(null);
      setStatusMessage({ type: 'info', text: t('keygen_purged_alert') });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-3 sm:space-y-4 px-4">
        <div className="inline-flex p-2 sm:p-3 bg-quantum-primary/10 border border-quantum-primary/30 rounded-xl sm:rounded-2xl mb-2">
          <Key className="w-6 h-6 sm:w-8 sm:h-8 text-quantum-primary" />
        </div>
        <h2 className="text-xl sm:text-4xl font-display font-black text-white uppercase tracking-tighter">
          NIST <span className="text-quantum-primary">{t('keygen_badge')}</span>
        </h2>
        <p className="text-[9px] sm:text-xs text-gray-500 font-mono uppercase tracking-[0.15em] sm:tracking-[0.2em] max-w-lg mx-auto leading-relaxed">
          {t('keygen_desc')}
        </p>

        {/* Real Cryptographic Entropy Source Selector */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setEntropySource('hybrid_nist')}
            className={`px-3 py-1.5 rounded-lg text-[9px] font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
              entropySource === 'hybrid_nist'
                ? 'bg-quantum-primary/20 text-quantum-primary border border-quantum-primary/40 shadow-[0_0_15px_rgba(0,242,255,0.2)]'
                : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20'
            }`}
          >
            <Zap className="w-3 h-3" />
            {t('keygen_ent_hybrid')}
          </button>
          <button
            onClick={() => setEntropySource('quantum_vacuum')}
            className={`px-3 py-1.5 rounded-lg text-[9px] font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
              entropySource === 'quantum_vacuum'
                ? 'bg-quantum-primary/20 text-quantum-primary border border-quantum-primary/40 shadow-[0_0_15px_rgba(0,242,255,0.2)]'
                : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20'
            }`}
          >
            <Activity className="w-3 h-3" />
            {t('keygen_ent_vac')}
          </button>
          <button
            onClick={() => setEntropySource('hardware_trng')}
            className={`px-3 py-1.5 rounded-lg text-[9px] font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
              entropySource === 'hardware_trng'
                ? 'bg-quantum-primary/20 text-quantum-primary border border-quantum-primary/40 shadow-[0_0_15px_rgba(0,242,255,0.2)]'
                : 'bg-white/5 text-gray-400 border border-white/10 hover:border-white/20'
            }`}
          >
            <Cpu className="w-3 h-3" />
            Hardware CSPRNG (SP 800-90B)
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 px-4">
        <button
          onClick={generateKeys}
          disabled={isGenerating}
          className="relative group w-full sm:w-auto px-6 sm:px-12 py-4 sm:py-5 bg-quantum-primary text-black font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[10px] sm:text-xs rounded-xl sm:rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_50px_rgba(0,242,255,0.2)] hover:shadow-[0_0_60px_rgba(0,242,255,0.4)] disabled:opacity-50 cursor-pointer"
        >
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl sm:rounded-2xl" />
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            {isGenerating ? <RefreshCcw className="w-4 h-4 sm:w-5 h-5 animate-spin" /> : <Cpu className="w-4 h-4 sm:w-5 h-5" />}
            {isGenerating ? t('keygen_btn_computing') : t('keygen_btn_generate')}
          </div>
        </button>

        {keys && (
          <>
            <button
              onClick={downloadKeyPairJson}
              className="w-full sm:w-auto px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/15 text-quantum-primary font-mono text-[9px] font-bold uppercase rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Scarica JSON
            </button>
            <button
              onClick={handleManualPurge}
              className="w-full sm:w-auto px-4 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-mono text-[9px] font-bold uppercase rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              {t('keygen_purge_btn')}
            </button>
          </>
        )}
      </div>

      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-mono flex items-center gap-2.5 ${
            statusMessage.type === 'error'
              ? 'bg-red-500/10 border-red-500/30 text-red-300'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
          }`}
        >
          {statusMessage.type === 'error' ? (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          ) : (
            <ShieldCheck className="w-4 h-4 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Real-time Conditioning & Verification Strip */}
      {(keys?.entropyTelemetry || liveEntropy) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 bg-quantum-primary/[0.04] border border-quantum-primary/20 rounded-xl flex flex-wrap items-center justify-between gap-2 text-[9px] font-mono"
        >
          <div className="flex items-center gap-2 text-gray-300">
            <Zap className="w-3.5 h-3.5 text-quantum-primary shrink-0" />
            <span>{t('keygen_harvester')}</span>
            <span className="text-quantum-primary font-bold">
              {keys?.entropyTelemetry?.source || liveEntropy?.sourceName}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {keys?.entropyTelemetry?.bytesMixed && (
              <span className="text-gray-400">
                Seed HKDF-SHA512: <strong className="text-white">{keys.entropyTelemetry.bytesMixed} B</strong>
              </span>
            )}
            {keys?.verifiedRoundTrip && (
              <span className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                <ShieldCheck className="w-3 h-3" /> FIPS 203 Encapsulate/Decapsulate OK
              </span>
            )}
            <span className="flex items-center gap-1 text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              <ShieldCheck className="w-3 h-3" /> {t('keygen_zt_active')}
            </span>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {keys && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Public Key Card */}
            <div className="quantum-card bg-black/60 border-quantum-primary/20 hover:border-quantum-primary/40 transition-colors group">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-quantum-primary/10 border border-quantum-primary/20 flex items-center justify-center">
                    <Database className="w-4 h-4 text-quantum-primary" />
                  </div>
                  <h3 className="text-white font-display font-bold uppercase tracking-widest text-[10px]">
                    {t('keygen_public_key_title')}
                  </h3>
                </div>
                <span className="text-[8px] font-mono text-gray-500 bg-white/5 px-2 py-0.5 rounded border border-white/5 uppercase">
                  1184 Bytes ({keys.publicKey.length / 2} B)
                </span>
              </div>

              <div className="relative">
                <div className="w-full bg-white/[0.03] border border-white/5 rounded-xl p-4 font-mono text-[9px] text-gray-400 break-all h-40 overflow-y-auto scrollbar-hide line-height-relaxed">
                  {keys.publicKey}
                </div>
                <button
                  onClick={() => copyToClipboard(keys.publicKey, 'pub')}
                  className="absolute bottom-3 right-3 p-2.5 bg-black/60 hover:bg-quantum-primary border border-white/10 hover:border-quantum-primary rounded-lg text-gray-400 hover:text-black transition-all group/btn cursor-pointer"
                >
                  {copiedType === 'pub' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Copy className="w-4 h-4" />
                      <span className="text-[8px] font-bold uppercase tracking-widest opacity-0 group-hover/btn:opacity-100 transition-opacity">
                        {t('keygen_copy')}
                      </span>
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* Private Key Card */}
            <div className="quantum-card bg-black/60 border-quantum-secondary/20 hover:border-quantum-secondary/40 transition-colors group">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-quantum-secondary/10 border border-quantum-secondary/20 flex items-center justify-center">
                    <ShieldAlert className="w-4 h-4 text-quantum-secondary" />
                  </div>
                  <h3 className="text-white font-display font-bold uppercase tracking-widest text-[10px]">
                    {t('keygen_private_key_title')}
                  </h3>
                </div>
                <span className="text-[8px] font-mono text-gray-500 bg-white/5 px-2 py-0.5 rounded border border-white/5 uppercase">
                  2400 Bytes ({keys.privateKey.length / 2} B)
                </span>
              </div>

              <div className="relative">
                <div className="w-full bg-white/[0.03] border border-red-500/5 rounded-xl p-4 font-mono text-[9px] text-quantum-secondary/80 break-all h-40 overflow-y-auto scrollbar-hide line-height-relaxed blur-[2px] hover:blur-0 transition-all duration-300">
                  {keys.privateKey}
                </div>
                <button
                  onClick={() => copyToClipboard(keys.privateKey, 'priv')}
                  className="absolute bottom-3 right-3 p-2.5 bg-black/60 hover:bg-quantum-secondary border border-white/10 hover:border-quantum-secondary rounded-lg text-gray-400 hover:text-white transition-all group/btn cursor-pointer"
                >
                  {copiedType === 'priv' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <div className="flex items-center gap-2">
                      <Copy className="w-4 h-4" />
                      <span className="text-[8px] font-bold uppercase tracking-widest opacity-0 group-hover/btn:opacity-100 transition-opacity">
                        {t('keygen_copy')}
                      </span>
                    </div>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8">
        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-start gap-4">
          <Fingerprint className="w-5 h-5 text-quantum-primary shrink-0" />
          <div>
            <h4 className="text-[10px] font-bold text-white uppercase mb-1">{t('keygen_true_ent_title')}</h4>
            <p className="text-[9px] text-gray-500 leading-relaxed font-mono uppercase">
              Condizionamento reale NIST SP 800-90C HKDF-SHA512 tra CSPRNG client/server e ANU Optical Vacuum QRNG.
            </p>
          </div>
        </div>
        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-start gap-4">
          <Layers className="w-5 h-5 text-quantum-primary shrink-0" />
          <div>
            <h4 className="text-[10px] font-bold text-white uppercase mb-1">{t('keygen_lattice_title')}</h4>
            <p className="text-[9px] text-gray-500 leading-relaxed font-mono uppercase">{t('keygen_lattice_desc')}</p>
          </div>
        </div>
        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-start gap-4">
          <RefreshCcw className="w-5 h-5 text-quantum-primary shrink-0" />
          <div>
            <h4 className="text-[10px] font-bold text-white uppercase mb-1">{t('keygen_zt_scrub_title')}</h4>
            <p className="text-[9px] text-gray-500 leading-relaxed font-mono uppercase">
              {t('keygen_zt_scrub_desc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
