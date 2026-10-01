export interface LigneCommandeRequest {
  produitId: number;
  quantite: number;
}

export interface CreerCommandeRequest {
  adresseLivraison: string;
  lignes: LigneCommandeRequest[];
}

export interface LigneCommandeResponse {
  ligneId: number;
  produitId: number;
  produitNom: string;
  quantite: number;
  prixUnitaire: number;
  sousTotal: number;
  statut: string;
  motifRefus: string | null;
}

export interface CommandeResponse {
  id: number;
  dateCommande: string;
  statut: string;
  montantTotal: number;
  adresseLivraison: string;
  acheteurId: number;
  acheteurNom: string;
  lignes: LigneCommandeResponse[];
}

export interface ChangerStatutCommandeRequest {
  statut: string;
  motif?: string;
}
