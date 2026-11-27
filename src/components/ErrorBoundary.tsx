import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export default class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  declare props: ErrorBoundaryProps;
  declare state: ErrorBoundaryState;
  declare setState: (state: Partial<ErrorBoundaryState>) => void;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error?.message || 'Errore imprevisto nella piattaforma.',
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('Application ErrorBoundary caught:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, errorMessage: '' });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      let parsedMsg = this.state.errorMessage;
      try {
        const parsed = JSON.parse(this.state.errorMessage);
        if (parsed && typeof parsed.error === 'string') {
          parsedMsg = `${parsed.error}${parsed.path ? ` (${parsed.operationType}: ${parsed.path})` : ''}`;
        }
      } catch {
        // plain string message
      }

      return (
        <div className="min-h-screen bg-[#050810] text-white flex items-center justify-center p-6 font-sans">
          <div className="max-w-lg w-full bg-[#0b1220] border border-red-500/30 rounded-3xl p-8 shadow-2xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-2xl text-red-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold uppercase tracking-wider text-white">
                  Errore di Sistema / Permessi
                </h2>
                <p className="text-xs text-gray-400 font-mono">
                  Spark Quantum Engine • Protezione Integrità
                </p>
              </div>
            </div>

            <div className="p-4 bg-black/50 border border-white/10 rounded-2xl text-xs font-mono text-red-200 break-words">
              {parsedMsg}
            </div>

            <button
              onClick={this.handleReset}
              className="w-full py-3.5 px-4 bg-cyan-400 hover:bg-cyan-300 text-black font-bold uppercase tracking-wider text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <RefreshCcw className="w-4 h-4" />
              <span>Ricarica Piattaforma</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
