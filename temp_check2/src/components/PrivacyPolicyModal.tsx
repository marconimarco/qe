import React, { useState, useEffect } from 'react';
import { X, Shield, Edit3, Eye, Save, RotateCcw, Copy, Check, Download, FileText } from 'lucide-react';

export const DEFAULT_PRIVACY_POLICY_TEXT = `===========================================================================
====
PRIVACY POLICY
PLATFORM: SPARK QUANTUM ENGINE (B2B)
===========================================================================
====
PREAMBLE AND COORDINATION WITH CONTRACTUAL TERMS
This Privacy Policy integrates and forms an inseparable part of the legal ecosystem comprising the
Non-Disclosure Agreement (NDA), the End-User License Agreement (EULA), and the Disclaimer
(General Terms and Conditions). Defined terms capitalized herein (e.g., "Provider", "User",
"Tenant", "spark Quantum Engine Dashboard", "Confidential Information") shall retain the exact
same meaning ascribed to them in the aforementioned contractual agreements.

QUICK HIGHLIGHTS: HOW WE HANDLE YOUR DATA IN THIS PLATFORM
- Automatic Flush Protocol: Asymmetric keys and cryptographic parameters generated via the
NIST Key Generator are subject to an immediate removal system (Automatic Flush). Temporary
data is wiped from the backend's volatile memory (RAM) immediately after use.
- Secure OpenQASM Logging: Transmission logs of OpenQASM circuits routed to physical QPUs
are retained internally on secure environments solely for security audit purposes and license
compliance monitoring.
- Post-Quantum Vault Protection: Files, keys, and tokens managed through the PQC Locker utilize
the NIST FIPS 203 // ML-KEM-768 Engine to secure your sensitive data against future quantum
decryption threats.
- Enterprise Quantum Routing: To process complex optimization and denoising requests, data is
transmitted via secure encrypted channels (TLS) to the IBM Quantum Cloud and heterogeneous
physical QPU clusters, ensuring no reuse of your inputs for generic public modeling.

1. DATA CONTROLLER AND PRIVACY ROLES (Art. 53 Disclaimer)
Provider as Data Processor: Pursuant to Art. 53 of the Disclaimer, regarding any computational
metrics, linear algebra datasets, variational algorithms parameters, and mathematical
configurations inputted directly by the User into the platform prompts or the real-time interface, the
Provider acts strictly as a Data Processor. The Tenant assumes the exclusive classification and
legal obligations of a Data Controller.
Third-Party Infrastructure and Quantum Partners: For hardware routing and executing complex
calculations over physical QPU clusters, the Provider interacts with enterprise quantum
infrastructure networks, including IBM Quantum Cloud. Pursuant to the secure bridge integration
frameworks, data is transmitted via encrypted paths (HTTPS/TLS) and isolated technically from
public clusters.
Provider as Data Controller: The Provider operates as a Data Controller solely regarding
workspace registration data, corporate billing details, technical access logs, and contractual
tracking files belonging to Tenants and their sub-users.

2. CATEGORIES OF DATA COLLECTED AND STRUCTURAL SENSITIVE DATA EXCLUSION
The Provider collects the following categories of data:
Tenant Identification and International Registration Data: Corporate name, international tax codes,
corporate registration numbers (e.g., VAT, EIN, LEI, Business ID), primary registered office
address, and geographic location of establishment.
Sub-User Data and Evidentiary Logs: Corporate email addresses, access credentials/API keys, IP
addresses, user-agent strings, and timestamps relating to every independent opt-in, login, or
computational interaction.
Quantum Execution Tracking Logs: Technical data associated with OpenQASM circuit
submissions, qubit allocations, and system engine updates, registered internally via secure logs to
verify user identity, data lineage, and operational integrity.
Absolute Prohibition on Sensitive or Protected Data (Art. 55 Disclaimer): In full compliance with Art.
55 of the Disclaimer, the User is strictly prohibited from entering health, biometric, judicial, political,
or personal data subject to special national protection frameworks into the calculation fields. The
Provider does not perform pre-screening operations and declaims all liability for breaches resulting
from the insertion of such prohibited data.

3. PURPOSES OF PROCESSING AND LEGAL BASES
The processing of personal data is governed by the principles of lawfulness and necessity,
according to the following purposes:
Contract Execution and SaaS Delivery: To allow access to the spark Quantum Engine Dashboard,
manage the multi-tenant workspace architecture, and deliver computational functionalities based
on quantum simulators, optimization matrices, and post-quantum cryptographic locker routines.
Forensic Tracking and Intellectual Property Protection: To monitor computing patterns and circuit
transmission volumes in order to prevent infrastructure abuse (such as mass scraping, reverse
engineering of encryption engines, prompt injection attacks, or unauthorized account sharing) and
to enable secure audit marking (Art. 3 NDA, Art. 4 and 6 EULA).
Legal Protection and Indefinite Retention of Contractual Logs: Pursuant to Art. 57 of the
Disclaimer, logs certifying the electronic acceptance of the 88 contractual articles and their
associated indemnity clauses will be retained indefinitely for the Provider's legal protection,
extending past service termination.

4. CLOUD ARCHITECTURE AND CROSS-BORDER DATA FLOWS (Art. 51-52 Disclaimer)
Multinational Transfers: The software architecture operates utilizing international servers,
third-party enterprise hardware infrastructures (IBM Quantum Cloud), and data center systems
distributed across multiple continents and regions based on quantum node availability and
technical requirements.
Authorization for Transfer: As established by Art. 52 of the Disclaimer, the User grants definitive,
unconditional consent for operational parameters, technical logs, and circuit configurations to be
transferred and processed outside their country of origin or use. Both parties pledge to respect,
within their respective operational boundaries, all applicable global and supranational corporate
data protection regulations.

5. DATA SECURITY AND LIMITATION ON PHYSICAL INSPECTIONS (Art. 49, 56, 58 Disclaimer)
Standard Security Measures: The Provider implements transport layer encryption (TLS/HTTPS) for
all API and computing channels. Operational data and configurations of each customer are
logically segregated at the database level through a multi-tenant structure.
User Negligence Liability Exclusion: The Provider is not liable for data breaches resulting from
User negligence in managing their unique tokens, passwords, or access credentials (Art. 49 & 56
Disclaimer).
Incompatibility with Physical Inspections: Pursuant to Art. 58 of the Disclaimer, the Provider
excludes all physical or logical access by the User, their employees, auditors, or third-party
inspectors to its private global cloud infrastructure.

6. DATA RETENTION, VOLATILE PROTECTION PROTOCOLS, AND POST-TERMINATION
ERASURE (Art. 5 NDA, Art. 60 Disclaimer)
Immediate Volatile Protection Protocol (Automatic Flush): As established by the system security
architecture, asymmetric keys and cryptographic factors handled by the NIST Key Generator are
never persistently saved to local databases. Upon the closing of the specific operations loop, all
transient parameters are completely erased from the volatile memory (RAM).
Quantum Execution Management: Files or data assets stored within the PQC Locker utilize the
ML-KEM-768 engine. Circuit logs are retained purely for security audit records. No customizable
files or report assets are retained beyond what is required to maintain the secure operational state
of the tenant space.
Corporate and Subscription Data: Following account closure or termination due to insolvency, the
Provider will purge all corporate registration and billing data from active databases, relieving itself
of any subsequent conservation or retrieval obligations (Art. 50 & 60 Disclaimer).
Data Covered by NDA: Information exchanged within the perimeter of the Non-Disclosure
Agreement remains subject to confidentiality obligations for a period of 3 (three) years following the
termination of the relationship.
Exception for Legal Logs: The indefinite retention of contractual acceptance logs for judicial
protection purposes remains unaffected (Art. 57 Disclaimer).

7. DATA BREACH MANAGEMENT AND NOTIFICATION PROTOCOL (Art. 59 Disclaimer)
In the event of a security breach on the servers, the Provider will inform the User within the
timelines mandated by applicable law, declaiming all liability for induced, indirect, or reputational
damages, as well as administrative sanctions imposed on the User (Art. 17-21, Art. 59 Disclaimer).

8. GOVERNING LAW, EXCLUSIVE JURISDICTION, AND PREVALENT LANGUAGE
Governing Law and Forum: Any data processing connected to the use of the spark Quantum
Engine platform, the routing of OpenQASM circuits, or the operation of the PQC Locker, and any
dispute arising out of or connected to it shall be exclusively governed by and construed in
accordance with the laws of the State where the Provider has its principal registered headquarters,
and submitted to the unique, mandatory, and overriding jurisdiction of the Court of such locality.
The User and the Tenant expressly, definitely, and unconditionally waive any right to initiate
proceedings or compete in any other global or national forums (Art. 81-82 Disclaimer).
Prevalent Language: Pursuant to Art. 77 of the Disclaimer, in the event of any discrepancies,
linguistic conflicts, automated translations, or divergent interpretations of this Privacy Policy across
foreign markets or international jurisdictions, the original Italian version of the contractual
architecture shall remain the sole legally and hermeneutically binding text between the parties.`;

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  canEdit?: boolean;
  canDownload?: boolean;
}

const STORAGE_KEY = 'spark_quantum_privacy_policy_text';

export default function PrivacyPolicyModal({ 
  isOpen, 
  onClose,
  canEdit = false,
  canDownload = false
}: PrivacyPolicyModalProps) {
  const [policyText, setPolicyText] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_PRIVACY_POLICY_TEXT;
  });
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

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

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, policyText);
    setIsEditing(false);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  const handleReset = () => {
    if (window.confirm('Do you want to reset to the original Privacy Policy text? All unsaved modifications will be lost.')) {
      setPolicyText(DEFAULT_PRIVACY_POLICY_TEXT);
      localStorage.setItem(STORAGE_KEY, DEFAULT_PRIVACY_POLICY_TEXT);
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 2500);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(policyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([policyText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'SPARK_QUANTUM_ENGINE_PRIVACY_POLICY.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const wordCount = policyText.trim() ? policyText.trim().split(/\s+/).length : 0;
  const charCount = policyText.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] bg-gradient-to-b from-[#0e1726] to-[#080d16] border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-2.5 bg-quantum-primary/10 border border-quantum-primary/30 rounded-xl text-quantum-primary">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-display font-bold uppercase tracking-wider text-white">
                  Privacy Policy
                </h2>
                <span className="px-2 py-0.5 text-[9px] font-mono uppercase bg-quantum-primary/10 text-quantum-primary border border-quantum-primary/30 rounded-full">
                  NIST FIPS 203 Compliant
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-gray-400 font-mono">
                Platform: SPARK QUANTUM ENGINE (B2B) • Legal & Data Protection
              </p>
            </div>
          </div>

          <button
            id="close-privacy-policy-modal"
            onClick={onClose}
            className="p-2 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-4 sm:px-6 py-3 bg-white/[0.02] border-b border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            {canEdit && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  isEditing
                    ? 'bg-quantum-primary text-black border-quantum-primary font-bold'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-gray-200'
                }`}
              >
                {isEditing ? (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </>
                ) : (
                  <>
                    <Edit3 className="w-3.5 h-3.5 text-quantum-primary" />
                    <span>Edit Text (Admin)</span>
                  </>
                )}
              </button>
            )}

            {canEdit && isEditing && (
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/40 transition-all font-bold cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            )}

            {canEdit && (
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-300 border border-white/10 hover:border-red-500/30 transition-all cursor-pointer"
                title="Reset to original default text"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset Default</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-500 hidden md:inline">
              {wordCount} words • {charCount} characters
            </span>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-all cursor-pointer"
              title="Copy to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            {canDownload && (
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-all cursor-pointer"
                title="Download as .txt file"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Download TXT</span>
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 font-mono text-xs text-gray-300 leading-relaxed scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {savedToast && (
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-300 flex items-center gap-2 text-xs">
              <Check className="w-4 h-4 text-green-400" />
              <span>Privacy Policy changes successfully saved!</span>
            </div>
          )}

          {isEditing ? (
            <div className="h-full flex flex-col space-y-2">
              <div className="flex items-center justify-between text-[11px] text-quantum-primary">
                <span>EDITING MODE ACTIVE — You can modify any section of the text:</span>
                <span>Saved persistently in local storage</span>
              </div>
              <textarea
                value={policyText}
                onChange={(e) => setPolicyText(e.target.value)}
                rows={22}
                className="w-full h-[55vh] p-4 bg-black/60 border border-quantum-primary/40 rounded-xl font-mono text-xs text-gray-200 focus:outline-none focus:ring-2 focus:ring-quantum-primary/60 resize-none leading-relaxed"
                placeholder="Enter or modify Privacy Policy text..."
              />
            </div>
          ) : (
            <div className="space-y-4 select-text">
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                <pre className="whitespace-pre-wrap font-mono text-xs text-gray-300 leading-relaxed font-normal">
                  {policyText}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-black/40 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono">
            <FileText className="w-3.5 h-3.5 text-quantum-primary" />
            <span>B2B Legal Framework • Spark Quantum Engine</span>
          </div>

          <div className="flex items-center gap-2">
            {isEditing && (
              <button
                onClick={handleSave}
                className="px-4 py-1.5 bg-quantum-primary text-black font-bold uppercase text-xs rounded-xl hover:bg-cyan-300 transition-colors cursor-pointer"
              >
                Save & Exit
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white font-medium text-xs rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
