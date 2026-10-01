export interface Statistiques {
  nombreProducteurs: number;
  nombreProducteursVerifies: number;
  nombreClients: number;
  nombreCommandes: number;
  nombreCommandesLivrees: number;
  chiffreAffairesTotal: number;
  commissionTotale: number;
  nombreProduitsPublies: number;
  nombreFormations: number;
  nombreParticipantsFormes: number;
  nombreAvis: number;
  noteMoyenne: number | null;
  nombreLitigesOuverts: number;
}

/** Module Statistiques temporelles (ajoute le 2026-09-29, implementation des wireframes -- page 9). */
export interface TendanceJour {
  date: string;
  nombreCommandes: number;
  revenus: number;
}

export interface StatistiquesTendances {
  tendances: TendanceJour[];
  commandes7Jours: number;
  revenus7Jours: number;
  variationCommandesPct: number | null;
  variationRevenusPct: number | null;
  producteursFormesCeMois: number;
  variationProducteursFormesCeMois: number | null;
}
