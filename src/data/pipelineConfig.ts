// CONFIGURAZIONE PIPELINE CSV PER SETTORE (armonizzata con types.ts e demoCsv.ts)
// Le chiavi corrispondono ai SectorId di types.ts.
// I nomi file corrispondono a quelli generati da demoCsv.ts.
// colonna_peso è il nome atteso, ma parseCsv1Deterministic usa anche match flessibile.

export interface PipelineConfig {
  cartella: string;
  file_anagrafica: string;
  file_matrice: string;
  colonna_id: string;
  colonna_peso: string;
}

export const PIPELINE_ROUTER: Record<string, PipelineConfig> = {
  finance: {
    cartella: "/data/finance/",
    file_anagrafica: "1_anagrafica_risorse_guida.csv",
    file_matrice: "2_matrice_connessioni_guida.csv",
    colonna_id: "id_risorsa",
    colonna_peso: "priorita_peso"
  },
  insurance: {
    cartella: "/data/insurance/",
    file_anagrafica: "1_anagrafica_risorse_guida.csv",
    file_matrice: "2_matrice_connessioni_guida.csv",
    colonna_id: "id_risorsa",
    colonna_peso: "priorita_peso"
  },
  logistics: {
    cartella: "/data/logistics/",
    file_anagrafica: "1_anagrafica_risorse_guida.csv",
    file_matrice: "2_matrice_connessioni_guida.csv",
    colonna_id: "id_risorsa",
    colonna_peso: "priorita_peso"
  },
  energy: {
    cartella: "/data/energy/",
    file_anagrafica: "1_anagrafica_risorse_guida.csv",
    file_matrice: "2_matrice_connessioni_guida.csv",
    colonna_id: "id_risorsa",
    colonna_peso: "priorita_peso"
  },
  telecom: {
    cartella: "/data/telecom/",
    file_anagrafica: "1_anagrafica_risorse_guida.csv",
    file_matrice: "2_matrice_connessioni_guida.csv",
    colonna_id: "id_risorsa",
    colonna_peso: "priorita_peso"
  },
  manufacturing: {
    cartella: "/data/manufacturing/",
    file_anagrafica: "1_anagrafica_risorse_guida.csv",
    file_matrice: "2_matrice_connessioni_guida.csv",
    colonna_id: "id_risorsa",
    colonna_peso: "priorita_peso"
  },
  mitigation: {
    cartella: "/data/mitigation/",
    file_anagrafica: "1_anagrafica_risorse_guida.csv",
    file_matrice: "2_matrice_connessioni_guida.csv",
    colonna_id: "id_risorsa",
    colonna_peso: "priorita_peso"
  }
};

// Helper: recupera la configurazione per un settore (con fallback su finance)
export function getPipelineConfig(sectorId: string): PipelineConfig {
  return PIPELINE_ROUTER[sectorId] || PIPELINE_ROUTER.finance;
}