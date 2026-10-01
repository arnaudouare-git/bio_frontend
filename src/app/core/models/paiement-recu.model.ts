export interface PaiementRecuResponse {
  id: number;
  commandeId: number;
  methode: string;
  statut: string;
  referenceTransaction: string | null;
  datePaiement: string;
  montantBrutProducteur: number;
  montantCommissionProducteur: number;
  montantNetProducteur: number;
}
