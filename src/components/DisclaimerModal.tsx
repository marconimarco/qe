import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Edit3, Eye, Save, RotateCcw, Copy, Check, Download, FileText, ShieldAlert } from 'lucide-react';

export const DEFAULT_DISCLAIMER_TEXT = `===========================================================================
====
GENERAL DISCLAIMER
GENERAL TERMS AND CONDITIONS OF SERVICE FOR "SPARK QUANTUM ENGINE"
===========================================================================
====
SECTION I: SCOPE, DEFINITIONS, AND UNIVERSAL NATURE OF THE AGREEMENT

Art. 1 - Global and Extraterritorial Scope
These General Terms and Conditions govern cross-border access to and use of the "spark
Quantum Engine" platform on a global scale, binding the User regardless of their country of
establishment, nationality, citizenship, or local jurisdiction.

Art. 2 - Conventional Identification of the Provider
"Provider" refers to the international corporate entity that owns and licenses the platform,
comprehensively including its founders, developers, shareholders, directors, employees, external
collaborators, global subsidiaries, and legal successors.

Art. 3 - Definition of User and B2B Tenant
"User" or "Tenant" refers to any legal entity, business, multinational corporation, public body,
professional, or consultant subscribing to the service for purposes strictly related to their economic,
industrial, or professional activity (B2B Scope).

Art. 4 - Computational Nature of the Software
The software is exclusively an advanced IT calculation tool based on quantum simulators,
proprietary variational algorithms, and third-party quantum hardware infrastructures. It does not
provide professional consulting or direct engineering services.

Art. 5 - Unilateral and Instantaneous Modification of Terms
The Provider reserves the absolute right to update, amend, or replace any of these 88 articles at
any time due to global technical shifts, updates to international NIST standards, or changes in
cloud infrastructure policies. Continued use constitutes implicit acceptance.

Art. 6 - Execution of the Cross-Border Electronic Agreement
The contract is deemed executed and fully effective between the parties internationally at the exact
moment the User selects the acceptance checkbox and transmits the electronic registration
impulse to the Provider's servers.

Art. 7 - International Registration and Identification Requirements
The User is solely responsible for the authenticity of the data provided during registration, including
international tax codes, corporate registration numbers (e.g., VAT, EIN, LEI, Business ID), and the
geographic location of their primary registered office.

Art. 8 - Prohibition of Account Sharing and Impersonalization
User licenses and access credentials are strictly for the internal organization of the Tenant and its
registered sub-users. Reselling, renting, or temporarily transferring accounts to unauthorized third
parties is strictly prohibited.

Art. 9 - Custody and Objective Liability for Access Credentials
The Tenant is strictly, automatically, and unlimitedly liable for any operation, simulation, data
extraction, or matrix calculation executed using their authentication credentials or API keys.

Art. 10 - Obligation of Connectivity and Infrastructure Compatibility
The User assumes exclusive responsibility for adapting their own computer systems, browsers,
networks, and internet protocols required to properly receive calculation outputs and establish the
secure cryptographic connections demanded by the platform.

SECTION II: ACCEPTANCE OF TECHNOLOGICAL RISK AND GLOBAL INDEMNITIES

Art. 11 - Global "As Is" and "As Available" Clause
The service is provided and accepted "as is" and "as available", without any implicit or explicit
warranty of continuity, merchantability, absence of defects, or suitability for specific national
markets.

Art. 12 - Recognition of the Non-Deterministic Nature of Quantum Computing
The User accepts that all simulation results and matrix calculations derive from non-deterministic
quantum algorithmic logics and are structured based on qubit probability distributions rather than
traditional static mathematical certainties.

Art. 13 - Exclusion of Warranties on Report Accuracy
The Provider makes no representation or warranty regarding the absolute precision, compliance,
or formal validity of the simulation reports with respect to the local technical and industrial
regulations of different global states.

Art. 14 - Awareness of Quantum Noise and Decoherence Risks
The User acknowledges the technical possibility that the hardware may undergo quantum noise
and intrinsic decoherence capable of altering calculations or causing energy convergence errors,
assuming all related operational and financial risks.

Art. 15 - Mandatory Human-in-the-Loop Validation Obligation
It is an essential, binding, and irreplaceable condition of this contract that the User subjects every
single OpenQASM circuit, report, or analysis from the platform to analytical review, correction, and
formal approval by a qualified human expert or engineer.

Art. 16 - Absolute Prohibition of Direct Implementation Without Review
It is strictly prohibited worldwide to use, implement, or distribute raw reports and calculation data
exported from the platform into industrial production processes without first performing the human
validation specified in Art. 15.

Art. 17 - Total Exclusion of Liability for Direct Damages
Under no circumstances and under no jurisdiction shall the Provider be held liable for material,
direct, or immediate damages suffered by the User or their clients resulting from the adoption of or
reliance on calculations generated by the platform.

Art. 18 - Imperative Exclusion of Indirect Damages and Loss of Profit
The Provider excludes any liability for indirect, incidental, consequential, financial, or punitive
damages, including but not limited to loss of profits, commercial contracts, revenues, or business
interruption.

Art. 19 - Exclusion for Failed Audits or Revocation of Industrial Certifications
The Provider shall not be liable in any way for the denial of certification, rejection of technical
documentation, suspension, or revocation of ISO/industrial compliance by any accreditation body,
international organism, or lead auditor.

Art. 20 - Exclusion for Administrative or Government Sanctions
The Provider is not responsible for financial penalties, civil or criminal fines, or administrative
sanctions imposed on the User by public authorities, ministries, or regulatory bodies of any country
due to deficiencies or errors arising from the software.

Art. 21 - Exclusion of Liability for Reputational Damage
No compensation or indemnity is due from the Provider for loss of brand image, commercial
de-indexing, boycotts, or damage to corporate reputation resulting from the use of faulty
calculations or simulations.

Art. 22 - Maximum Liability Cap Clause (Capped at €100)
Except where mandatorily provided otherwise by international public policy rules, the Provider's
total aggregate liability for any breach, tort, or negligence is strictly limited to a maximum ceiling of
€100 (one hundred euros).

Art. 23 - Exclusion of Liability for User-Submitted Inputs
The User assumes exclusive liability for all data, industrial parameters, and code strings entered
into the calculation fields, indemnifying the Provider against any sanction resulting from illegal,
protected, or misleading inputs.

Art. 24 - Structural Dependence on Third-Party Cloud Infrastructures
The User acknowledges that the delivery of the SaaS service depends strictly on the connectivity,
data centers, and APIs of international quantum hardware providers (e.g., IBM Quantum Cloud).
The Provider is not liable for systemic interruptions caused by these external nodes.

Art. 25 - Scheduled Suspensions for Global Maintenance
The Provider retains the right to temporarily deactivate servers and calculation bridges for routine
maintenance or software updates, excluding any right of the User to refunds or indemnities for
temporary unavailability.

Art. 26 - Emergency Suspension for Cybersecurity Threats
In the event of zero-day exploits, cyberattacks, or network anomalies, the Provider may
immediately block access to the software worldwide for the time necessary to restore infrastructure
security.

Art. 27 - Exclusion for Massive Cyberattacks (DDoS, Ransomware)
The Provider is not responsible for data loss or service interruptions resulting from hostile actions
by third parties, cyber-warfare, organized hacker attacks, malware injections, or Distributed Denial
of Service attacks.

Art. 28 - Exemption for Force Majeure and Geopolitical Instability
The Provider is released from any performance obligation in the event of wars, armed conflicts,
international embargoes, trade blocks, nationalizations, global pandemics, or power grid failures on
a continental scale.

Art. 29 - Prohibition of Using Results as Evidence Against the Provider
Calculation data, reports, and responses from the platform may not be used by the User, their legal
counsel, or intermediaries in court to prove non-performance or defects in the Provider's code.

Art. 30 - Universal Limitation Period (6 Months)
Any action, claim, or demand arising from this contract must be initiated by the User, under penalty
of total forfeiture, within 6 (six) months from the day the disputed simulation or computational
operation was executed.

SECTION III: INTELLECTUAL PROPERTY, REVERSE ENGINEERING, AND TRADE SECRETS

Art. 31 - Global and Exclusive Intellectual Property of the Software
The source code, user interface (UI/UX), noise mitigation algorithms, database structures, and all
logical components of the platform remain the exclusive international property of the Provider.

Art. 32 - Absolute Prohibition of Reverse Engineering on Encryption Engines
The User is strictly prohibited, in any state or territory worldwide, from decompiling, disassembling,
mapping, proxy-tracking, or analyzing the SaaS application code and internal API calls.

Art. 33 - Protection of Latent Logic and Proprietary Taxonomies
Entropy injection logics, simulator configurations, and the industrial taxonomies used constitute
inalienable trade and industrial secrets of the Provider, protected globally.

Art. 34 - Prohibition of Prompt Injection Attacks and Circuit Manipulation
It is strictly prohibited to insert malicious command strings or OpenQASM circuits designed to
bypass application guardrails to extract, copy, or view the platform's core system instructions.

Art. 35 - Conditional Ownership of Generated Outputs
The User acquires ownership of the data and reports resulting from their calculation sessions,
subject to the absolute prohibition of using them in ways that constitute cross-border unfair
competition against the Provider.

Art. 36 - Prohibition of Using Outputs to Train Competing Models
The User is strictly prohibited from using the generated calculations, extracted taxonomies, or
logical structures of the platform to train, optimize, test, or validate competing artificial intelligence
models or simulators.

Art. 37 - International Protection of Trademarks and Logos
The User acquires no rights to the trademarks, trade names, logos, or graphic signs of the
Provider. Any commercial or promotional use of these assets requires prior written consent.

Art. 38 - Exclusive Liability for Trade Secrets Inserted by the User
The User assumes all legal and commercial liability arising from the inclusion of confidential
company data, industrial secrets, or information protected by prior non-disclosure agreements
(NDAs) with third parties into the calculation fields.

Art. 39 - Indemnity for Involuntary Algorithmic Similarities
Given the statistical and mathematical nature of quantum calculations and simulators, the User
exempts the Provider from copyright infringement claims if the output shows partial similarities to
pre-existing scientific data on the web.

Art. 40 - Precarious and Temporary Nature of the License
The license granted is non-exclusive, revocable, non-transferable, and strictly limited to the specific
time duration of the subscription plan paid by the Tenant.

SECTION IV: MULTI-TENANCY STRUCTURE AND COOPERATIVE ACCOUNT MANAGEMENT

Art. 41 - Logical Isolation of the Multi-Tenant Architecture
The platform delivers its services via a multi-tenant structure, where the operational data and
configurations of each customer are logically segregated at the database level from those of other
users.

Art. 42 - Rights and Duties of the Tenant Administrator (Admin)
The user designated as the workspace administrator holds full operational responsibility for
invitations, role configurations, privilege assignments, and the revocation of associated
sub-accounts.

Art. 43 - Cascading Extension of Contractual Obligations to Sub-Users
The primary Tenant guarantees and is responsible for the explicit acceptance of and compliance
with these 88 articles by every operator, employee, or external consultant operating under its
licenses.

Art. 44 - Joint, Several, and Direct Liability of the Primary Tenant
The primary Tenant is jointly, severally, directly, and objectively liable for any contractual breach,
API abuse, or cyber-offense committed by its individual sub-accounts.

Art. 45 - Software Blocking for Unverified Sub-Users
The platform will systematically block operational access for any sub-user until an explicit log of
consent and acceptance of these Terms is recorded in the system database.

Art. 46 - Evidentiary Autonomy of Multi-Tenant Acceptance Logs
The system database records the IP address, user-agent string, and timestamp of each sub-user
independently, consolidating the chain of corporate indemnities.

Art. 47 - International Prohibition of Sub-Licensing or Business Transfer
The Tenant may not assign, alienate, rent, lend, or sub-license its workspace or computational
environment to third-party legal entities, external branches, or subsidiaries.

Art. 48 - Resource Limitation Logic Against Multi-Tenant Abuse
To preserve the integrity of the shared SaaS environment, the Provider may limit calculation
frequency (rate-limiting) or suspend accounts exhibiting anomalous concurrent processing
volumes.

Art. 49 - Database Isolation Clause and User Negligence
Although the Provider applies strict logical isolation of tenants within the database, it is not
responsible for data breaches resulting from the User's negligence in managing their own tokens or
passwords.

Art. 50 - Immediate Termination for Tenant Insolvency or Non-Payment
Failure to settle subscription fees within the agreed deadlines will result in the immediate
suspension and subsequent deletion of the Tenant profile and all associated sub-accounts.

SECTION V: CROSS-BORDER DATA FLOWS, PRIVACY COMPLIANCE, AND SENSITIVE DATA
EXCLUSION

Art. 51 - Global and Cross-Border Cloud Architecture
The software architecture operates using international servers and data centers distributed across
multiple continents and regions based on the Provider's logistical and computational needs.

Art. 52 - Irrevocable Authorization for Multinational Data Transfer
The User grants definitive and unconditional consent for operational data, technical logs, and
entered circuits to be transferred and processed outside their country of origin or use.

Art. 53 - Contractual Privacy Roles (Processor/Controller)
The Provider acts exclusively as a Data Processor for the entered data, while the Tenant assumes
the exclusive legal status and obligations of a Data Controller.

Art. 54 - Compliance with Global Privacy Laws
The parties agree to respect, within their respective operational boundaries, all global and
supranational regulations applicable to the protection of corporate data.

Art. 55 - Absolute Prohibition on the Insertion of Sensitive Data
The User is strictly prohibited from entering data relating to health, biometrics, judicial matters,
politics, or personal data subject to special national protections into the calculation fields.

Art. 56 - Intrinsic Security of API Communication Channels
The Provider implements transport-level encryption (TLS) but excludes any liability for attacks
perpetrated through the interception of local networks controlled by the User.

Art. 57 - Technical Retention of Contractual Tracking Logs
Logs certifying the contractual acceptance of these 88 articles will be stored indefinitely for the
Provider's legal protection, even beyond the termination of the service.

Art. 58 - Incompatibility with Physical Audits or Direct Inspections
The Provider excludes any physical or logical access by the User, their employees, auditors, or
third-party inspectors to its private global cloud infrastructure.

Art. 59 - Data Breach Management and Notification Protocol
In the event of a security breach on the servers, the Provider will inform the User within the
timelines established by applicable law, disclaiming all liability for induced damages.

Art. 60 - Post-Termination Data Deletion and Irrecoverability
Following account closure, the Provider will delete all company data from active databases,
releasing itself from any subsequent storage or recovery obligations.

SECTION VI: OPERATIONAL RESTRICTIONS, PROHIBITED USES, AND GEOPOLITICAL
PROVISIONS

Art. 61 - Universal Prohibition of Scraping and Massive Extraction
The use of bots, scrapers, automated scripts, or data extraction software designed to
systematically download reports or the SaaS knowledge base is strictly prohibited.

Art. 62 - Specificity of Calculation Caps (Qubit/Token Cap)
Monthly processing volumes and calculation minutes on physical QPUs are strictly limited by the
commercial parameters of the active subscription plan. Reaching the threshold blocks further
calculations.

Art. 63 - Fair Use Policy for Computational Resources
The Provider reserves the right to temporarily reduce processing speeds for any account whose
operational behavior saturates shared global servers or quantum bridge channels.

Art. 64 - Absolute Prohibition of Use for Military and Weapons Purposes
It is strictly prohibited worldwide to use this software to structure management procedures,
industrial calculations, or documentation intended for the production, development, trade, or
storage of weapons or military technologies.

Art. 65 - Exclusion for Critical Infrastructure and Life-Safety Systems
The software must not be used for calculations or documentation linked to nuclear plants, mass
transit networks, vital medical operations, or any system where a calculation error poses a risk to
human life.

Art. 66 - Total Exclusion of Protective Effects Toward Interposed Third Parties
This agreement does not confer any legal rights or actionable claims to third parties,
sub-contractors, or end-clients of the User, who remain entirely external to this legal relationship.

Art. 67 - Obligation of Cooperative Bug and Vulnerability Reporting
The User agrees to immediately and confidentially report any discovered bug or system
vulnerability to the Provider, refraining from any form of exploitation or disclosure thereof.

Art. 68 - Prohibition of Fraudulent Interposition in Reselling
The User may not resell generated reports under the false pretense that they are the exclusive
result of manual consulting activities led by human professionals external to the platform.

Art. 69 - Self-Certification of B2B Professional Commercial Status
The Tenant guarantees that the subscription is executed exclusively for business purposes,
formally waiving protections provided for private consumers in different nations.

Art. 70 - Contractual Synallagma Based on Risk Limitation
The User explicitly acknowledges that the commercial price of the subscription is calculated
directly on the basis of the full effectiveness of the waivers and the global liability cap of €100
established in Art. 22.

SECTION VII: TERMINATION, INTERNATIONAL JURISDICTIONAL CLAUSES, AND CLOSURE

Art. 71 - Duration, Automatic Renewal, and Billing Cycles
The contract remains valid for the chosen duration (monthly or annual) and renews automatically
unless a digital cancellation notice is sent before the expiration date.

Art. 72 - Execution of Electronic Cancellation
The User may terminate the agreement at any time by deactivating the automatic renewal feature
within the account management dashboard of the platform.

Art. 73 - Provider's Right to Terminate Ad Nutum
The Provider reserves the right to terminate the contract at any time and without cause with 30
days' notice, issuing a pro-rata refund for the unused subscription period.

Art. 74 - Express Termination Clause for Structural Violations
The contract is automatically terminated by law if the User violates clauses relating to reverse
engineering, code injections, or the obligation of human validation of circuits.

Art. 75 - Emergency Preventive Suspension for Unlawful Use
The Provider is authorized to freeze access to the Tenant's workspace immediately if technical logs
show attacks on the code or violations of use restrictions.

Art. 76 - Effects of Termination and Deactivation of API Keys
Upon termination of the contract for any reason, all calculation keys and sub-accounts associated
with the Tenant will be systematically deactivated, halting all export functions.

Art. 77 - Exclusive Jurisdictional Prevalence of the Italian Language
In the event of discrepancies, automated translations, or divergent interpretations of this
agreement in foreign markets, the original Italian version remains the sole legally and
hermeneutically binding text.

Art. 78 - International Severability Clause
The potential invalidity, nullity, or ineffectiveness of a single article ordered by a court shall not
compromise the legal effectiveness and application of the remaining contractual articles.

Art. 79 - Tracking and Secure Deletion of Temporary Data (Automatic Flush)
The User acknowledges that asymmetric cryptographic keys generated via the "NIST Key
Generator" module are subject to an immediate removal system (Automatic Flush). Temporary
data is wiped from the backend's volatile memory immediately after use, while transmission logs of
OpenQASM circuits to physical QPUs are stored internally solely for security audit purposes.

Art. 80 - Global Class Action Waiver
The User agrees to resolve any dispute against the Provider exclusively on an individual basis,
formally waiving participation in class actions or collective actions in any legal system.

Art. 81 - Universal Choice of Law Clause
This contract, along with any non-contractual obligations arising from it or connected to it, shall be
exclusively governed by and construed in accordance with the laws of the State where the Provider
has its primary registered office at the time the dispute arises.

Art. 82 - Exclusive Choice of International Forum Clause
Any international dispute arising from this contract shall be referred to the exclusive, sole, and
mandatory jurisdiction of the Court of the place where the Provider has established its primary
registered office. The User expressly and definitively waives the right to initiate proceedings in their
own country of establishment, residence, or domicile.

Art. 83 - Evidentiary Value of Digital System Logs
Technical system logs, timestamps, and database checksums maintained on the Provider's servers
constitute the sole objective and admissible evidence to reconstruct calculations and computational
interactions.

Art. 84 - Absolute Prohibition of Payment Suspensions or Offsets
The User may not suspend, delay, or offset subscription fee payments by alleging alleged defects
or generation errors arising from the quantum engine.

Art. 85 - Preservation of Rights and Non-Waiver
The failure of the Provider to exercise or enforce any right or penalty clause provided for in this
agreement does not constitute a waiver of such rights in relation to subsequent or future breaches.

Art. 86 - Entire Agreement and Merger Clause
These 88 articles constitute the complete and exclusive agreement between the parties. No
marketing material, verbal promise, or commercial communication holds contractual value.

Art. 87 - Contractual Scope Stabilization Clause
In the event of platform updates, the binding version of the contract is the one digitally accepted
and recorded in the log at the exact moment the document calculation is executed.

Art. 88 - Execution via Definitive Electronic Contractual Seal
Selecting the checkbox during login or account creation constitutes formal signature of this
contract. The User declares to have reviewed, understood, and specifically approved each of the
88 articles, accepting without reservation all liability limits, the mandatory human validation filter,
and the choice of law and forum determined by the Provider's registered office for any action
initiated from any part of the planet.`;

interface DisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  canEdit?: boolean;
}

export const DISCLAIMER_STORAGE_KEY = 'spark_quantum_disclaimer_text_v1';

export default function DisclaimerModal({ isOpen, onClose, canEdit = true }: DisclaimerModalProps) {
  const [disclaimerText, setDisclaimerText] = useState<string>(() => {
    return localStorage.getItem(DISCLAIMER_STORAGE_KEY) || DEFAULT_DISCLAIMER_TEXT;
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
    localStorage.setItem(DISCLAIMER_STORAGE_KEY, disclaimerText);
    setIsEditing(false);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  const handleReset = () => {
    if (window.confirm('Do you want to reset to the original 88 Articles Disclaimer? All unsaved modifications will be lost.')) {
      setDisclaimerText(DEFAULT_DISCLAIMER_TEXT);
      localStorage.setItem(DISCLAIMER_STORAGE_KEY, DEFAULT_DISCLAIMER_TEXT);
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 2500);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(disclaimerText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([disclaimerText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'SPARK_QUANTUM_ENGINE_GENERAL_DISCLAIMER_88_ARTICLES.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const wordCount = disclaimerText.trim() ? disclaimerText.trim().split(/\s+/).length : 0;
  const charCount = disclaimerText.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn select-none text-white">
      <div 
        className="relative w-full max-w-5xl max-h-[92vh] bg-gradient-to-b from-[#161208] via-[#0f1016] to-[#070b13] border border-amber-500/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-amber-500/20 flex items-center justify-between bg-black/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-display font-bold uppercase tracking-wider text-white">
                  General Disclaimer & Terms of Service
                </h2>
                <span className="px-2 py-0.5 text-[9px] font-mono uppercase bg-amber-500/15 text-amber-300 border border-amber-500/40 rounded-full font-bold">
                  88 Articles • B2B Scope
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-gray-400 font-mono">
                Platform: SPARK QUANTUM ENGINE • Universal Legal Framework & Risk Limitation
              </p>
            </div>
          </div>

          <button
            id="close-disclaimer-modal"
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
                    ? 'bg-amber-400 text-black border-amber-400 font-bold'
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
                    <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Edit Text (Admin)</span>
                  </>
                )}
              </button>
            )}

            {isEditing && (
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
                title="Reset to the original 88 articles"
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

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-all cursor-pointer"
              title="Download as .txt file"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download TXT</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 font-mono text-xs text-gray-300 leading-relaxed scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {savedToast && (
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-300 flex items-center gap-2 text-xs">
              <Check className="w-4 h-4 text-green-400" />
              <span>Disclaimer modifications saved successfully!</span>
            </div>
          )}

          {isEditing ? (
            <div className="h-full flex flex-col space-y-2">
              <div className="flex items-center justify-between text-[11px] text-amber-400">
                <span>DISCLAIMER EDITING MODE (88 ARTICLES) — You can modify or add clauses:</span>
                <span>Saved persistently in local storage</span>
              </div>
              <textarea
                value={disclaimerText}
                onChange={(e) => setDisclaimerText(e.target.value)}
                rows={24}
                className="w-full h-[58vh] p-4 bg-black/70 border border-amber-500/40 rounded-xl font-mono text-xs text-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/60 resize-none leading-relaxed"
                placeholder="Enter or modify Disclaimer text..."
              />
            </div>
          ) : (
            <div className="space-y-4 select-text">
              <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                <pre className="whitespace-pre-wrap font-mono text-xs text-gray-300 leading-relaxed font-normal">
                  {disclaimerText}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-black/50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono">
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>Binding B2B Contract • 88 Legal Articles</span>
          </div>

          <div className="flex items-center gap-2">
            {isEditing && (
              <button
                onClick={handleSave}
                className="px-4 py-1.5 bg-amber-400 text-black font-bold uppercase text-xs rounded-xl hover:bg-amber-300 transition-colors cursor-pointer"
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
