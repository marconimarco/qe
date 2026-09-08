export const getDemoCsvBySector = (sector: string) => {
  const isFinanza = sector.toLowerCase().includes('finanza');
  const isLogistica = sector.toLowerCase().includes('logistica');
  const isSanita = sector.toLowerCase().includes('sanit');

  const header1 = `# =========================================================================================
# GUIDA ALLA COMPILAZIONE: FILE 1 - ANAGRAFICA RISORSE (Elementi, Costi, Scorte, Pesi)
# =========================================================================================
# 1. SEPARATORE DI COLONNA: Usa SEMPRE la VIRGOLA (,)
# 2. SEPARATORE DECIMALE PER I NUMERI: Usa SEMPRE il PUNTO (.) (es. 100.50). MAI la virgola per i decimali.
# 3. NOMI ID (id_risorsa): Scrivi tutto in MINUSCOLO, usa UNDERSCORE '_' (es. asset_01).
# =========================================================================================\n`;

  const header2 = `# =========================================================================================
# GUIDA ALLA COMPILAZIONE: FILE 2 - MATRICE DELLE CONNESSIONI, CORRELAZIONI E VINCOLI
# =========================================================================================
# 1. Prima colonna deve chiamarsi esplicitamente: id_risorsa
# 2. Intestazioni di colonna successive = ID identici al File 1.
# 3. Valori da 0.00 a 1.00. 0.00 (indipendente), 0.50 (legame morbido), 1.00 (blocco rigido/conflitto).
# =========================================================================================\n`;

  if (isFinanza) {
    return {
      csv1: header1 + `id_risorsa,nome_visualizzato,categoria,costo_unitario,quantita_disponibile,priorita_peso
asset_01,Portafoglio Obbligazionario Green,titoli_reddito_fisso,100.50,1500,0.85
asset_02,Fondo Copertura Valutaria EUR_USD,forex_hedging,1.08,50000,0.95
asset_03,Future Materie Prime Energia,derivati_commodities,78.20,2400,0.70
asset_04,Liquidita Operativa Cash Overnight,liquidita,1.00,100000,1.00
asset_05,Fondo Azionario High Beta Globale,equity_growth,245.80,850,0.60`,
      csv2: header2 + `id_risorsa,asset_01,asset_02,asset_03,asset_04,asset_05
asset_01,1.00,0.00,0.30,0.50,0.00
asset_02,0.00,1.00,0.00,0.80,0.50
asset_03,0.30,0.00,1.00,0.00,0.70
asset_04,0.50,0.80,0.00,1.00,0.00
asset_05,0.00,0.50,0.70,0.00,1.00`
    };
  }
  
  if (isLogistica) {
    return {
      csv1: header1 + `id_risorsa,nome_visualizzato,categoria,costo_unitario,quantita_disponibile,priorita_peso
hub_nord,Centro Logistico Milano,magazzino_centrale,1500.00,1,0.90
flotta_a,TIR Lunga Percorrenza,veicoli_pesanti,3.50,25,0.80
forn_01,Fornitore Ricambi Auto,fornitura_b2b,120.00,500,0.75
hub_sud,Centro Distribuzione Napoli,magazzino_regionale,900.00,1,0.85
flotta_b,Furgoni Consegna Ultimo Miglio,veicoli_leggeri,1.80,50,0.95`,
      csv2: header2 + `id_risorsa,hub_nord,flotta_a,forn_01,hub_sud,flotta_b
hub_nord,1.00,0.80,0.50,0.00,0.30
flotta_a,0.80,1.00,0.00,0.70,0.00
forn_01,0.50,0.00,1.00,0.00,0.00
hub_sud,0.00,0.70,0.00,1.00,0.90
flotta_b,0.30,0.00,0.00,0.90,1.00`
    };
  }

  if (isSanita) {
    return {
      csv1: header1 + `id_risorsa,nome_visualizzato,categoria,costo_unitario,quantita_disponibile,priorita_peso
sala_op_1,Sala Operatoria Cardio,infrastruttura_critica,2500.00,1,1.00
equipe_a,Team Chirurgia Urgenza,personale_medico,850.00,3,0.95
macchinario_rm,Risonanza Magnetica 3T,diagnostica,400.00,2,0.85
reparto_ti,Posti Letto Terapia Intensiva,degenza,1200.00,15,0.90
farmaco_x,Scorta Salvavita Adrenalina,medicinali,45.00,200,0.80`,
      csv2: header2 + `id_risorsa,sala_op_1,equipe_a,macchinario_rm,reparto_ti,farmaco_x
sala_op_1,1.00,0.90,0.00,0.50,0.30
equipe_a,0.90,1.00,0.40,0.80,0.00
macchinario_rm,0.00,0.40,1.00,0.00,0.00
reparto_ti,0.50,0.80,0.00,1.00,0.60
farmaco_x,0.30,0.00,0.00,0.60,1.00`
    };
  }

  // Default / Energy
  return {
    csv1: header1 + `id_risorsa,nome_visualizzato,categoria,costo_unitario,quantita_disponibile,priorita_peso
centrale_solare,Parco Fotovoltaico Sud,rinnovabili,0.05,5000,0.90
batteria_accumulo,Storage Grid-Scale Li-Ion,stoccaggio,0.12,1000,0.95
centrale_gas,Impianto Turbogas Peaking,fossile_backup,0.18,2000,0.60
rete_trasmissione,Linea Alta Tensione Nord-Sud,distribuzione,0.02,1,0.85
utenze_industriali,Distretto Industriale Energivoro,domanda_critica,0.25,3500,1.00`,
    csv2: header2 + `id_risorsa,centrale_solare,batteria_accumulo,centrale_gas,rete_trasmissione,utenze_industriali
centrale_solare,1.00,0.80,0.00,0.60,0.40
batteria_accumulo,0.80,1.00,0.30,0.70,0.50
centrale_gas,0.00,0.30,1.00,0.50,0.80
rete_trasmissione,0.60,0.70,0.50,1.00,0.90
utenze_industriali,0.40,0.50,0.80,0.90,1.00`
  };
};