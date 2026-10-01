export interface CreerAvisRequest {
  commandeId: number;
  producteurId: number;
  /** Optionnel : si renseigne, l'avis note ce produit precis -- ajoute le 2026-09-29. */
  produitId?: number;
  note: number;
  commentaire?: string;
}

export interface AvisResponse {
  id: number;
  note: number;
  commentaire: string | null;
  auteurId: number;
  auteurNom: string;
  producteurId: number;
  /** null si l'avis note le producteur en general (pas un produit precis) -- ajoute le 2026-09-29. */
  produitId: number | null;
  dateCreation: string;
}
