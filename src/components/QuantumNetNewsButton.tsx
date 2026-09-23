import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Newspaper, ExternalLink, X, RefreshCw, ChevronRight, Calendar, Sparkles } from 'lucide-react';
import axios from 'axios';

export interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  url: string;
  category?: string;
  content?: string;
}

export default function QuantumNetNewsButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/news');
      if (res.data && res.data.articles) {
        setArticles(res.data.articles);
      }
    } catch (err) {
      console.error('Failed to load news:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setIsOpen(true);
    }, 150);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 350);
  };

  return (
    <>
      {/* Floating round button on the left, vertically centered */}
      <div 
        className="fixed left-3 sm:left-5 top-1/2 -translate-y-1/2 z-50 select-none"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <button
          onClick={() => setIsOpen(prev => !prev)}
          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 flex items-center justify-center transition-all duration-300 shadow-2xl relative group cursor-pointer ${
            isOpen 
              ? 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_30px_rgba(0,242,255,0.6)] scale-110' 
              : 'bg-black/85 border-cyan-500/40 hover:border-cyan-300 hover:shadow-[0_0_25px_rgba(0,242,255,0.45)] hover:scale-105'
          }`}
          title="Quantum-Net News"
        >
          {/* Subtle pulse effect */}
          <span className="absolute inset-0 rounded-full bg-cyan-400/20 animate-ping pointer-events-none opacity-40" />

          {/* Icon */}
          <Newspaper className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400 group-hover:text-cyan-200 transition-colors" />

          {/* Small badge */}
          <span className="absolute -bottom-1 px-1.5 py-0.2 bg-cyan-950 border border-cyan-400/60 rounded-full text-[8px] font-mono text-cyan-300 font-bold tracking-tight">
            NEWS
          </span>
        </button>

        {/* Hover / Click Menu Popup (Flyout on the right of the button) */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, x: -15, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -15, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute left-16 sm:left-18 top-1/2 -translate-y-1/2 w-80 sm:w-96 max-h-[80vh] flex flex-col bg-[#0b1220]/95 border border-cyan-500/40 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8),0_0_30px_rgba(0,242,255,0.15)] backdrop-blur-xl overflow-hidden pointer-events-auto"
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-white/10 bg-slate-900/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-xs sm:text-sm text-white tracking-wide uppercase">
                      Quantum-Net News
                    </h3>
                    <p className="text-[10px] text-cyan-400/80 font-mono">
                      quantum-net.it/news
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={fetchNews}
                    disabled={loading}
                    className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                    title="Aggiorna notizie"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* News list */}
              <div className="p-3 overflow-y-auto space-y-2.5 max-h-[60vh] scrollbar-thin scrollbar-thumb-cyan-500/30">
                {loading && articles.length === 0 ? (
                  <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" />
                    <span className="text-xs font-mono">Caricamento notizie...</span>
                  </div>
                ) : articles.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400 font-mono">
                    Nessuna notizia disponibile al momento.
                  </div>
                ) : (
                  articles.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSelectedArticle(item);
                      }}
                      className="p-3 bg-slate-950/60 hover:bg-cyan-950/40 border border-white/5 hover:border-cyan-500/40 rounded-xl transition-all cursor-pointer group flex flex-col gap-1 text-left"
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span className="text-cyan-400/90 font-semibold">{item.category || 'Quantum'}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-2.5 h-2.5 text-slate-500" />
                          {item.date}
                        </span>
                      </div>

                      <h4 className="text-xs font-semibold text-white group-hover:text-cyan-200 transition-colors line-clamp-2 leading-snug">
                        {item.title}
                      </h4>

                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {item.excerpt}
                      </p>

                      <div className="pt-1 flex items-center justify-between text-[10px] text-cyan-400/80 font-mono group-hover:text-cyan-300">
                        <span>Leggi dettagli</span>
                        <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="p-2.5 bg-slate-950 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="text-[10px] text-slate-500">Fonte: Quantum-Net</span>
                <a
                  href="https://www.quantum-net.it/news/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer"
                >
                  <span>Portale Completo</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Detail Pop-up Modal when clicking an article title/card */}
      <AnimatePresence>
        {selectedArticle && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-xl bg-[#0b1324] border-2 border-cyan-500/50 rounded-3xl p-6 shadow-[0_0_50px_rgba(0,242,255,0.25)] flex flex-col gap-4 text-white relative max-h-[85vh] overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedArticle(null)}
                className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Category & Date */}
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/30">
                  {selectedArticle.category || 'Quantum-Net Article'}
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-400">{selectedArticle.date}</span>
              </div>

              {/* Title */}
              <h2 className="text-base sm:text-lg md:text-xl font-display font-bold text-white leading-snug">
                {selectedArticle.title}
              </h2>

              {/* Content body */}
              <div className="overflow-y-auto pr-2 space-y-3 text-slate-300 text-xs sm:text-sm leading-relaxed max-h-[50vh] scrollbar-thin scrollbar-thumb-cyan-500/30">
                <p className="font-medium text-slate-200">
                  {selectedArticle.excerpt}
                </p>
                <div className="p-3 bg-slate-900/80 border border-white/5 rounded-xl font-mono text-xs text-slate-400">
                  Per l'articolo completo e gli approfondimenti tecnici, consulta la pubblicazione originale su Quantum-Net:
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs font-semibold transition-all cursor-pointer"
                >
                  Chiudi
                </button>
                <a
                  href={selectedArticle.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 cursor-pointer"
                >
                  <span>Apri su Quantum-Net</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
