export type MethodePaiement = 'ORANGE_MONEY' | 'CASH';

export interface CreerPaiementRequest {
  commandeId: number;
  methode: MethodePaiement;
}

export interface ConfirmerPaiementRequest {
  reussi: boolean;
}

export interface PaiementResponse {
  id: number;
  commandeId: number;
  montant: number;
  methode: string;
  statut: string;
  referenceTransaction: string | null;
  datePaiement: string;
  montantCommission: number | null;
  montantNetProducteur: number | null;
}
