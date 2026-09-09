export const PIPELINE_ROUTER: Record<string, {
  cartella: string;
  file_anagrafica: string;
  file_matrice: string;
  colonna_id: string;
  colonna_peso: string;
}> = {
  "finanza_e_mercati": {
    cartella: "/public/data/finance/",
    file_anagrafica: "anagrafica_risorse_finance.csv",
    file_matrice: "matrice_connessioni_finance.csv",
    colonna_id: "id_risorsa",
    colonna_peso: "priorita_peso"
  },
  "sanita_e_medicina": {
    cartella: "/public/data/healthcare/",
    file_anagrafica: "anagrafica_trattamenti_sanita.csv",
    file_matrice: "matrice_incompatibilita_farmaci.csv",
    colonna_id: "id_caso",
    colonna_peso: "priorita_clinica"
  },
  "chimica_e_materiali": {
    cartella: "/public/data/chemistry/",
    file_anagrafica: "anagrafica_composti_chimici.csv",
    file_matrice: "matrice_incompatibilita_reazioni.csv",
    colonna_id: "id_composto",
    colonna_peso: "indice_stabilita"
  },
  "produzione_e_automazione": {
    cartella: "/public/data/manufacturing/",
    file_anagrafica: "anagrafica_linee_produzione.csv",
    file_matrice: "matrice_conflitti_risorse.csv",
    colonna_id: "id_linea",
    colonna_peso: "priorita_evasione_ordine"
  }
};
