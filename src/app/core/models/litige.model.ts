export interface CreerLitigeRequest {
  commandeId: number;
  motif: string;
}

export interface ResoudreLitigeRequest {
  statut: 'RESOLU' | 'REJETE';
  decisionAdmin: string;
}

export interface LitigeResponse {
  id: number;
  commandeId: number;
  auteurId: number;
  auteurNom: string;
  motif: string;
  statut: string;
  decisionAdmin: string | null;
  dateCreation: string;
  dateResolution: string | null;
}
