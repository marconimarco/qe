# Quantum Engine & Quantum BI Assistant ⚛️🛡️

Piattaforma avanzata per la simulazione quantistica aziendale, Business Intelligence quantistica assistita da Intelligenza Artificiale (Google Gemini), generazione di circuiti OpenQASM 2.0 / Qiskit 1.x, inoltro a processori IBM Quantum reali e canali di comunicazione protetti con crittografia post-quantistica (PQC ML-KEM-768).

---

## 📋 Indice
1. [Requisiti di Sistema](#1-requisiti-di-sistema)
2. [Database e Gestione della Memoria](#2-database-e-gestione-della-memoria)
3. [Elenco Librerie e API Esterne](#3-elenco-librerie-e-api-esterne)
4. [Installazione e Configurazione Locale](#4-installazione-e-configurazione-locale)
5. [Variabili di Ambiente (.env)](#5-variabili-di-ambiente-env)
6. [Comandi Disponibili](#6-comandi-disponibili)
7. [Architettura del Progetto](#7-architettura-del-progetto)

---

## 1. Requisiti di Sistema

Per eseguire l'applicazione in locale o in ambiente di produzione sono richiesti i seguenti requisiti minimi:

| Componente | Requisito Minimo | Consigliato |
| :--- | :--- | :--- |
| **Sistema Operativo** | Windows 10/11, macOS (Intel/Apple Silicon), Linux (Ubuntu 20.04+, Debian, Fedora, Arch) | Qualsiasi OS a 64 bit |
| **Node.js** | Versione `18.x` o `20.x` LTS | Versione `20.x` LTS o superiore |
| **Package Manager** | `npm` (v9+), `pnpm` (v8+), o `bun` | `npm` preinstallato con Node.js |
| **RAM** | 2 GB liberi | 4 GB+ liberi |
| **Spazio su Disco** | 500 MB per codice e `node_modules` | 1 GB+ |
| **Porta di Rete** | Porta locale `3000` libera | `3000` (configurata di default) |
| **Connessione Internet** | Richiesta per API Google Gemini, IBM Quantum e QRNG | Connessione stabile a banda larga |

---

## 2. Database e Gestione della Memoria

L'applicazione adotta un'architettura ad **alta sicurezza con Zero-Data-Retention (Zero-Trace)**:

1. **Gestione Dati Temporanei in RAM (In-Memory Data Store):**
   - Le sessioni di chat crittografate, le stanze PQC e i codici di invito temporanei sono memorizzati nella memoria volatile del server (`Map<string, Room>`).
   - Non vengono salvati log su disco né conservate copie di messaggi privati o file caricati.

2. **Scrubber di Memoria Post-Quantistica (Zero-Trace RAM Scrubber):**
   - Conforme agli standard **NIST FIPS 140-3 Zeroization** e **FIPS 203**.
   - Tutti i buffer crittografici contenenti materiale sensibile (chiavi private Kyber, segreti condivisi, IV e chiavi simmetriche AES) vengono sovrascritti con byte casuali hardware (`crypto.randomFillSync`) e azzerati (`.fill(0)`) immediatamente dopo l'uso nel blocco `finally`.

3. **Buffer Files Volatili (Multer MemoryStorage):**
   - I file e le tabelle CSV caricati dagli utenti vengono elaborati direttamente nello stream di memoria (`multer.memoryStorage()`) senza mai essere scritti sul filesystem del server.

4. **Persistenza Client-Side (Browser LocalStorage):**
   - Le tabelle elaborate, le preferenze di visualizzazione, i preset di settore e i token di accesso IBM Quantum possono essere mantenuti localmente nel browser dell'utente (`localStorage`) senza transito verso database centralizzati di terze parti.

---

## 3. Elenco Librerie e API Esterne

### 🤖 Intelligenza Artificiale & Machine Learning
- **`@google/genai` (v1.29.0+):** SDK ufficiale di Google DeepMind per l'integrazione con **Google Gemini (Gemini 3.5 Flash)**.
  - **Funzionalità:** Analisi semantica dei dataset aziendali, Business Intelligence predittiva, calcolo dei vincoli di entanglement, generazione e validazione del codice OpenQASM 2.0 e Python Qiskit 1.x, calcolo degli angoli di rotazione quantistica $2\arcsin(\sqrt{P})$.

### 🛡️ Crittografia Post-Quantistica (PQC) & Hardware Security
- **`crystals-kyber` (v5.1.0+):** Implementazione dello standard **ML-KEM-768 (CRYSTALS-Kyber)** ratificato dal NIST (**FIPS 203**).
  - **Funzionalità:** Scambio di chiavi resistente ad attacchi da computer quantistici (Algoritmo di Shor).
- **Modulo Crittografico Node.js Nativo (`crypto`):**
  - Cifratura simmetrica autenticata **AES-256-GCM** (NIST SP 800-38D).
  - Generazione di numeri casuali crittografici conformi a **NIST SP 800-90B**.
- **ANU Quantum Random Number Generator (QRNG API):**
  - Endpoint: `https://qrng.anu.edu.au/API/jsonI.php` (Australian National University).
  - Estrazione di vera entropia fisica dalle fluttuazioni quantistiche del vuoto ottico per l'iniezione nei seed crittografici.

### ⚛️ Quantum Computing & Hardware Gateway
- **IBM Quantum Platform API:**
  - Endpoint Gateway: Inoltro job e circuiti su processori quantistici reali IBM (es. *ibm_sherbrooke*, *ibm_brisbane*, *ibm_kyoto*) o simulatori cloud Statevector con autenticazione tramite IBM Quantum API Token.

### 🎨 Frontend & Interfaccia Utente
- **`react` & `react-dom` (v19.0.1):** Core per l'interfaccia reattiva a componenti.
- **`@tailwindcss/vite` & `tailwindcss` (v4.1.14):** Framework CSS atomico per il design moderno ad alto contrasto.
- **`motion` (v12.23.24):** Libreria per animazioni fluide e transizioni di stato quantistiche (Bloch sphere, radar interattivi, barre di probabilità).
- **`lucide-react` (v0.546.0):** Set completo di icone vettoriali per crittografia, quantistica e business intelligence.
- **`recharts` (v3.8.1):** Grafici di distribuzione degli stati quantistici, distribuzioni di conteggio Shots e radar multidimensionali.
- **`jspdf` (v4.2.1) & `jspdf-autotable` (v5.0.7):** Motore di generazione documentale per report esecutivi e schede tecniche PDF.

### ⚙️ Backend, Server & Networking
- **`express` (v4.21.2):** Server web HTTP e API RESTful.
- **`socket.io` & `socket.io-client` (v4.8.3):** Canale di comunicazione WebSockets bidirezionale real-time per la chat cifrata PQC.
- **`multer` (v2.1.1):** Middleware per la gestione sicura in memoria degli upload di file CSV/Excel.
- **`axios` (v1.16.0):** Client HTTP per chiamate API esterne.
- **`dotenv` (v17.2.3):** Gestione sicura delle variabili di configurazione locali.
- **`vite` (v6.2.3), `tsx` (v4.21.0), `esbuild` (v0.28.0), `typescript` (v5.8.2):** Toolchain moderna per build, transpilazione Typescript e bundling unificato.

---

## 4. Installazione e Configurazione Locale

Segui questi passaggi per avviare l'applicazione sul tuo computer:

### Passo 1: Clonazione o Download del Repository
Scarica il codice sorgente nella cartella desiderata ed entra nella directory del progetto:
```bash
git clone <URL_DEL_REPOSITORY>
cd quantum-engine
```

### Passo 2: Installazione delle Dipendenze
Esegui il comando di installazione tramite Node Package Manager:
```bash
npm install
```
*(In alternativa, puoi usare `pnpm install` o `bun install`).*

### Passo 3: Configurazione del File `.env`
Copia il file di esempio `.env.example` in un nuovo file `.env`:
```bash
cp .env.example .env
```
Apri il file `.env` con un editor di testo e inserisci la tua chiave API Google Gemini:
```env
GEMINI_API_KEY="AIzaSy..."
VITE_IBM_QUANTUM_API_KEY="tuo_token_ibm_opzionale"
```

### Passo 4: Avvio in Modalità Sviluppo
Avvia il server di sviluppo con hot-reloading:
```bash
npm run dev
```
Apri il browser all'indirizzo:
👉 **`http://localhost:3000`**

---

## 5. Variabili di Ambiente (.env)

| Variabile | Obbligatoria | Descrizione | Come ottenerla |
| :--- | :---: | :--- | :--- |
| `GEMINI_API_KEY` | **Sì** | Chiave per l'Agente AI di Business Intelligence e generazione codice quantistico. | Ottenibile gratuitamente su [Google AI Studio](https://aistudio.google.com/). |
| `VITE_IBM_QUANTUM_API_KEY` | *Opzionale* | Token per inviare circuiti su computer quantistici reali IBM. | Ottenibile creando un account su [IBM Quantum Platform](https://quantum.ibm.com/). |
| `PORT` | *Opzionale* | Porta HTTP del server (default: `3000`). | - |

---

## 6. Comandi Disponibili

| Comando | Descrizione |
| :--- | :--- |
| `npm run dev` | Avvia il server Node.js/Express + Vite in modalità sviluppo su `http://localhost:3000`. |
| `npm run build` | Compila l'interfaccia frontend Vite in `dist/` e crea il bundle CommonJS del server `dist/server.cjs` tramite `esbuild`. |
| `npm run start` | Avvia il server ottimizzato per la produzione (`node dist/server.cjs`). |
| `npm run lint` | Esegue il controllo statico dei tipi TypeScript (`tsc --noEmit`). |
| `npm run clean` | Rimuove la cartella di build `dist/`. |

---

## 7. Architettura del Progetto

```
├── package.json               # Configurazione dipendenze e script
├── tsconfig.json              # Configurazione TypeScript
├── vite.config.ts             # Configurazione Vite e plugin Tailwind CSS
├── server.ts                  # Server Express: API PQC, Gemini AI, IBM Proxy, WebSockets
├── .env.example               # Template per le variabili di ambiente
├── src/
│   ├── main.tsx               # Entrypoint React
│   ├── App.tsx                # Layout principale e navigazione tab
│   ├── index.css              # Stili globali Tailwind CSS
│   ├── types.ts               # Tipi TypeScript globali
│   ├── components/
│   │   ├── QuantumAgentsInterface.tsx # Agenti Quantistici, Calibrazione Dati e QASM
│   │   ├── IBMQuantumInterface.tsx    # Invio a IBM Q, Traduzione Stati & Confronto Classico/Q
│   │   ├── PostQuantumChat.tsx        # Chat crittografata PQC ML-KEM-768 + WebSockets
│   │   ├── PQCFileEncryptor.tsx       # Cifratura/Decifratura file quantistica
│   │   ├── ExecutiveReportGenerator.tsx # Generatore Report Esecutivi PDF
│   │   └── ...                        # Componenti grafici (Bloch Sphere, Radar, ecc.)
│   └── lib/                   # Utility crittografiche e matematiche
```

---

## 📜 Licenza & Conformità
- **Sicurezza:** Architettura conforme a **NIST FIPS 203 (ML-KEM)**, **NIST FIPS 140-3**, **NIST SP 800-38D (AES-GCM)** e **NIST SP 800-90B/C (TRNG)**.
- **Quantum Computing:** Compatibile con specifiche **OpenQASM 2.0** e **Qiskit 1.x**.
