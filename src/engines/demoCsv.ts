export function resolveSectorKey(sector: string, scenario: string = ''): string {
  const norm = `${sector || ''} ${scenario || ''}`.toLowerCase();
  if (
    norm.includes('sicurez') ||
    norm.includes('cyber') ||
    norm.includes('telecom') ||
    norm.includes('reti') ||
    norm.includes('sec-') ||
    norm.includes('sec_')
  ) {
    return 'sicurezza';
  }
  if (
    norm.includes('logistic') ||
    norm.includes('supply') ||
    norm.includes('flott') ||
    norm.includes('vrptw') ||
    norm.includes('log-') ||
    norm.includes('log_')
  ) {
    return 'logistica';
  }
  if (
    norm.includes('sanit') ||
    norm.includes('biomed') ||
    norm.includes('genom') ||
    norm.includes('medicin') ||
    norm.includes('san-') ||
    norm.includes('san_')
  ) {
    return 'sanita';
  }
  if (
    norm.includes('energi') ||
    norm.includes('utilit') ||
    norm.includes('grid') ||
    norm.includes('opf') ||
    norm.includes('ene-') ||
    norm.includes('ene_')
  ) {
    return 'energia';
  }
  if (
    norm.includes('produzion') ||
    norm.includes('manifattur') ||
    norm.includes('cnc') ||
    norm.includes('job-shop') ||
    norm.includes('man-') ||
    norm.includes('man_')
  ) {
    return 'manifattura';
  }
  if (
    norm.includes('chimic') ||
    norm.includes('farmaceut') ||
    norm.includes('material') ||
    norm.includes('molecol') ||
    norm.includes('vqe') ||
    norm.includes('chem-') ||
    norm.includes('chem_')
  ) {
    return 'chimica';
  }
  return 'finanza';
}

interface DemoRow {
  id: string;
  nome: string;
  pesoPrud: number;
  pesoAgg: number;
  costoUnitario: number;
  quantitaDisponibile: number;
  categoria: string;
}

const SECTOR_DEMO_ROWS: Record<string, DemoRow[]> = {
  finanza: [
    { id: 'asset_01', nome: 'Titoli_Governativi_AAA', pesoPrud: 0.85, pesoAgg: 0.45, costoUnitario: 101.20, quantitaDisponibile: 250, categoria: 'Core_Sovrano' },
    { id: 'asset_02', nome: 'Obbligazioni_Corporate_IG', pesoPrud: 0.72, pesoAgg: 0.58, costoUnitario: 98.40, quantitaDisponibile: 180, categoria: 'Reddito_Fisso' },
    { id: 'asset_03', nome: 'ETF_Azionario_Globale', pesoPrud: 0.42, pesoAgg: 0.84, costoUnitario: 114.80, quantitaDisponibile: 140, categoria: 'Equity_Core' },
    { id: 'asset_04', nome: 'Copertura_Derivati_FX', pesoPrud: 0.78, pesoAgg: 0.50, costoUnitario: 45.60, quantitaDisponibile: 320, categoria: 'Hedging_FX' },
    { id: 'asset_05', nome: 'Liquidita_Monetario_EUR', pesoPrud: 0.90, pesoAgg: 0.30, costoUnitario: 100.00, quantitaDisponibile: 400, categoria: 'Buffer_Cash' },
    { id: 'asset_06', nome: 'Fondo_Infrastrutture_ESG', pesoPrud: 0.65, pesoAgg: 0.70, costoUnitario: 76.90, quantitaDisponibile: 210, categoria: 'Real_Assets' },
    { id: 'asset_07', nome: 'Oro_Fisico_Riserva', pesoPrud: 0.82, pesoAgg: 0.48, costoUnitario: 68.50, quantitaDisponibile: 160, categoria: 'Safe_Haven' },
    { id: 'asset_08', nome: 'Equity_Tech_Growth', pesoPrud: 0.34, pesoAgg: 0.88, costoUnitario: 132.10, quantitaDisponibile: 110, categoria: 'Alpha_Growth' },
  ],
  sicurezza: [
    { id: 'node_fw_01', nome: 'Firewall_Perimetrale_Core', pesoPrud: 0.91, pesoAgg: 0.76, costoUnitario: 1200, quantitaDisponibile: 12, categoria: 'Perimeter' },
    { id: 'node_vpn_02', nome: 'Gateway_VPN_ZeroTrust', pesoPrud: 0.84, pesoAgg: 0.68, costoUnitario: 850, quantitaDisponibile: 24, categoria: 'Access' },
    { id: 'node_soc_03', nome: 'Sensore_SIEM_DDoS', pesoPrud: 0.79, pesoAgg: 0.88, costoUnitario: 640, quantitaDisponibile: 40, categoria: 'Detection' },
    { id: 'node_db_04', nome: 'Cluster_Database_Critico', pesoPrud: 0.88, pesoAgg: 0.62, costoUnitario: 2400, quantitaDisponibile: 8, categoria: 'Storage' },
    { id: 'node_5g_05', nome: 'Router_Core_5G_SliceA', pesoPrud: 0.74, pesoAgg: 0.83, costoUnitario: 1500, quantitaDisponibile: 16, categoria: 'Backbone' },
    { id: 'node_ep_06', nome: 'Endpoint_Quarantena_EDR', pesoPrud: 0.67, pesoAgg: 0.79, costoUnitario: 220, quantitaDisponibile: 150, categoria: 'Endpoint' },
    { id: 'node_hsm_07', nome: 'Modulo_Chiavi_QKD_HSM', pesoPrud: 0.94, pesoAgg: 0.71, costoUnitario: 3100, quantitaDisponibile: 6, categoria: 'Crypto' },
    { id: 'node_ant_08', nome: 'Stazione_Radio_MIMO_N1', pesoPrud: 0.62, pesoAgg: 0.81, costoUnitario: 980, quantitaDisponibile: 30, categoria: 'Radio_RAN' },
  ],
  logistica: [
    { id: 'hub_milano', nome: 'Hub_Intermodale_Nord', pesoPrud: 0.86, pesoAgg: 0.78, costoUnitario: 420, quantitaDisponibile: 45, categoria: 'Hub_Primario' },
    { id: 'flotta_ev1', nome: 'Furgoni_Ultimo_Miglio_EV', pesoPrud: 0.75, pesoAgg: 0.85, costoUnitario: 185, quantitaDisponibile: 60, categoria: 'Flotta_Urbana' },
    { id: 'cntr_3d_03', nome: 'Container_ISO_40ft_P1', pesoPrud: 0.81, pesoAgg: 0.69, costoUnitario: 310, quantitaDisponibile: 90, categoria: 'Cargo_Unit' },
    { id: 'drone_uav4', nome: 'Flotta_Droni_Autonomia_B', pesoPrud: 0.58, pesoAgg: 0.82, costoUnitario: 140, quantitaDisponibile: 28, categoria: 'Air_Delivery' },
    { id: 'rail_link5', nome: 'Corridoio_Ferroviario_Est', pesoPrud: 0.88, pesoAgg: 0.64, costoUnitario: 520, quantitaDisponibile: 20, categoria: 'Intermodale' },
    { id: 'dock_bay_6', nome: 'Baia_CrossDocking_Freschi', pesoPrud: 0.79, pesoAgg: 0.74, costoUnitario: 260, quantitaDisponibile: 32, categoria: 'Cold_Chain' },
    { id: 'gate_ap_07', nome: 'Gate_Cargo_Aeroportuale', pesoPrud: 0.72, pesoAgg: 0.86, costoUnitario: 690, quantitaDisponibile: 14, categoria: 'Air_Hub' },
    { id: 'scorta_08', nome: 'Magazzino_Buffer_Sud', pesoPrud: 0.84, pesoAgg: 0.55, costoUnitario: 230, quantitaDisponibile: 75, categoria: 'Safety_Stock' },
  ],
  energia: [
    { id: 'turb_gas_1', nome: 'Centrale_Ciclo_Combinato', pesoPrud: 0.83, pesoAgg: 0.76, costoUnitario: 78, quantitaDisponibile: 120, categoria: 'Dispacciabile' },
    { id: 'bess_bat_2', nome: 'Accumulo_Litio_BESS_02', pesoPrud: 0.89, pesoAgg: 0.68, costoUnitario: 64, quantitaDisponibile: 95, categoria: 'Storage' },
    { id: 'solar_pv_3', nome: 'Parco_Fotovoltaico_Sud', pesoPrud: 0.66, pesoAgg: 0.85, costoUnitario: 41, quantitaDisponibile: 210, categoria: 'Rinnovabile' },
    { id: 'wind_off_4', nome: 'Eolico_Offshore_Adriatico', pesoPrud: 0.71, pesoAgg: 0.87, costoUnitario: 49, quantitaDisponibile: 160, categoria: 'Rinnovabile' },
    { id: 'hydro_pm_5', nome: 'Bacino_Pompa_Turbina_Alpi', pesoPrud: 0.86, pesoAgg: 0.64, costoUnitario: 53, quantitaDisponibile: 80, categoria: 'Idroelettrico' },
    { id: 'ev_v2g_06', nome: 'Hub_Ricarica_Smart_V2G', pesoPrud: 0.74, pesoAgg: 0.79, costoUnitario: 37, quantitaDisponibile: 140, categoria: 'Demand_Flex' },
    { id: 'grid_hv_07', nome: 'Dorsale_Alta_Tensione_AT', pesoPrud: 0.91, pesoAgg: 0.59, costoUnitario: 92, quantitaDisponibile: 50, categoria: 'Trasmissione' },
    { id: 'micro_gr_8', nome: 'Microgrid_Isola_Industriale', pesoPrud: 0.78, pesoAgg: 0.72, costoUnitario: 58, quantitaDisponibile: 65, categoria: 'Resilienza' },
  ],
  chimica: [
    { id: 'mol_h2o_01', nome: 'Complesso_Catalitico_FeMo', pesoPrud: 0.84, pesoAgg: 0.77, costoUnitario: 410, quantitaDisponibile: 30, categoria: 'Catalisi' },
    { id: 'lig_inh_02', nome: 'Inibitore_Enzimatico_L2', pesoPrud: 0.76, pesoAgg: 0.86, costoUnitario: 620, quantitaDisponibile: 18, categoria: 'Drug_Screen' },
    { id: 'poly_ion_3', nome: 'Membrana_Polimerica_PEM', pesoPrud: 0.81, pesoAgg: 0.69, costoUnitario: 350, quantitaDisponibile: 42, categoria: 'Fuel_Cell' },
    { id: 'mof_co2_04', nome: 'Struttura_Porosa_MOF_74', pesoPrud: 0.88, pesoAgg: 0.73, costoUnitario: 495, quantitaDisponibile: 25, categoria: 'Carbon_Capture' },
    { id: 'el_oer_05', nome: 'Elettrodo_Idrogeno_OER', pesoPrud: 0.79, pesoAgg: 0.82, costoUnitario: 540, quantitaDisponibile: 22, categoria: 'Green_H2' },
    { id: 'pep_fld_06', nome: 'Catena_Peptidica_Alpha7', pesoPrud: 0.68, pesoAgg: 0.85, costoUnitario: 710, quantitaDisponibile: 15, categoria: 'Folding' },
    { id: 'htsc_lat_7', nome: 'Reticolo_Ossido_Cuprato', pesoPrud: 0.73, pesoAgg: 0.79, costoUnitario: 830, quantitaDisponibile: 10, categoria: 'Supercond' },
    { id: 'solv_aq_08', nome: 'Solvente_Aqueous_ZeroVOC', pesoPrud: 0.86, pesoAgg: 0.61, costoUnitario: 190, quantitaDisponibile: 85, categoria: 'Green_Chem' },
  ],
  manifattura: [
    { id: 'cnc_mill_1', nome: 'Centro_Lavoro_CNC_5Assi', pesoPrud: 0.87, pesoAgg: 0.81, costoUnitario: 320, quantitaDisponibile: 12, categoria: 'Lavorazione' },
    { id: 'robo_wld_2', nome: 'Isola_Robotica_Saldatura', pesoPrud: 0.82, pesoAgg: 0.86, costoUnitario: 275, quantitaDisponibile: 18, categoria: 'Robotica' },
    { id: 'assy_ln_03', nome: 'Linea_Assemblaggio_Core', pesoPrud: 0.85, pesoAgg: 0.74, costoUnitario: 410, quantitaDisponibile: 9, categoria: 'Assembly' },
    { id: 'laser_ct_4', nome: 'Taglio_Laser_Lamiere_2D', pesoPrud: 0.76, pesoAgg: 0.84, costoUnitario: 215, quantitaDisponibile: 15, categoria: 'Cutting_Stock' },
    { id: 'jit_buf_05', nome: 'Buffer_Componenti_JIT', pesoPrud: 0.90, pesoAgg: 0.58, costoUnitario: 145, quantitaDisponibile: 90, categoria: 'Magazzino' },
    { id: 'cnn_qc_06', nome: 'Stazione_Controllo_Ottico', pesoPrud: 0.83, pesoAgg: 0.72, costoUnitario: 190, quantitaDisponibile: 24, categoria: 'Quality_QC' },
    { id: 'press_a_07', nome: 'Pressa_Stampaggio_P12', pesoPrud: 0.71, pesoAgg: 0.79, costoUnitario: 360, quantitaDisponibile: 10, categoria: 'Stampaggio' },
    { id: 'maint_08', nome: 'Squadra_Manutenzione_H24', pesoPrud: 0.88, pesoAgg: 0.63, costoUnitario: 165, quantitaDisponibile: 20, categoria: 'Maintenance' },
  ],
  sanita: [
    { id: 'or_room_01', nome: 'Blocco_Operatorio_Chir_A', pesoPrud: 0.89, pesoAgg: 0.78, costoUnitario: 1850, quantitaDisponibile: 6, categoria: 'Sale_Op' },
    { id: 'team_md_02', nome: 'Equipe_Cardiochirurgia', pesoPrud: 0.85, pesoAgg: 0.72, costoUnitario: 1420, quantitaDisponibile: 10, categoria: 'Clinica' },
    { id: 'hla_dn_03', nome: 'Pannello_Donatori_HLA_M', pesoPrud: 0.92, pesoAgg: 0.69, costoUnitario: 960, quantitaDisponibile: 24, categoria: 'Trapianti' },
    { id: 'gwas_sq_04', nome: 'Sequenziatore_DNA_GWAS', pesoPrud: 0.77, pesoAgg: 0.86, costoUnitario: 1120, quantitaDisponibile: 14, categoria: 'Genomica' },
    { id: 'igrt_bm_05', nome: 'Acceleratore_Radioterapia', pesoPrud: 0.84, pesoAgg: 0.75, costoUnitario: 2100, quantitaDisponibile: 4, categoria: 'Oncologia' },
    { id: 'icu_vnt_06', nome: 'Modulo_Ventilazione_ICU', pesoPrud: 0.91, pesoAgg: 0.64, costoUnitario: 680, quantitaDisponibile: 32, categoria: 'Terapia_Int' },
    { id: 'cold_vc_07', nome: 'Catena_Freddo_Biologica', pesoPrud: 0.86, pesoAgg: 0.71, costoUnitario: 530, quantitaDisponibile: 18, categoria: 'Logistica_Bio' },
    { id: 'tri_er_08', nome: 'Flusso_Triage_Emergenza', pesoPrud: 0.80, pesoAgg: 0.83, costoUnitario: 490, quantitaDisponibile: 22, categoria: 'Pronto_Socc' },
  ],
};

export function getDemoCsvBySector(
  sector: string,
  scenarioId: string = '',
  vincolo: string = 'blocco_rigido',
  strategy: string = 'Prudente'
): { csv1: string; csv2: string } {
  const key = resolveSectorKey(sector, scenarioId);
  const rows = SECTOR_DEMO_ROWS[key] || SECTOR_DEMO_ROWS.finanza;

  const sLow = (strategy || '').toLowerCase();
  const isAgg =
    sLow.includes('spinta') ||
    sLow.includes('aggress') ||
    sLow.includes('alpha') ||
    sLow.includes('massim') ||
    sLow.includes('velocit') ||
    sLow.includes('picco');

  const csv1Lines = [
    'id_risorsa,nome_risorsa,priorita_peso,costo_unitario,quantita_disponibile,categoria_rischio',
  ];
  for (const r of rows) {
    const peso = isAgg ? r.pesoAgg : r.pesoPrud;
    csv1Lines.push(
      `${r.id},${r.nome},${peso.toFixed(2)},${r.costoUnitario},${r.quantitaDisponibile},${r.categoria}`
    );
  }

  const isNone =
    vincolo === 'nessun_vincolo' ||
    vincolo.includes('nessun') ||
    vincolo.includes('none');
  const isSoftOnly = vincolo === 'legame_morbido' || vincolo.includes('morbid');

  // 8x8 symmetric matrix with explicit critical (>= 0.60) and soft (< 0.60) couplings
  const basePairs: Array<[number, number, number]> = isNone
    ? []
    : isSoftOnly
    ? [
        [0, 1, 0.42],
        [1, 2, 0.35],
        [2, 3, 0.48],
        [3, 4, 0.31],
        [4, 5, 0.44],
        [5, 6, 0.29],
        [6, 7, 0.38],
      ]
    : [
        [0, 1, 0.78],
        [0, 4, 0.65],
        [1, 3, 0.71],
        [2, 7, 0.64],
        [3, 5, 0.42],
        [4, 6, 0.69],
        [5, 6, 0.36],
      ];

  const n = rows.length;
  const mat: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  for (const [i, j, w] of basePairs) {
    if (i < n && j < n && i !== j) {
      mat[i][j] = w;
      mat[j][i] = w;
    }
  }

  const header2 = ['id_risorsa', ...rows.map(r => r.id)].join(',');
  const csv2Lines = [header2];
  for (let i = 0; i < n; i++) {
    csv2Lines.push([rows[i].id, ...mat[i].map(v => v.toFixed(2))].join(','));
  }

  return {
    csv1: csv1Lines.join('\n'),
    csv2: csv2Lines.join('\n'),
  };
}
