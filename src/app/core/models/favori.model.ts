import { Produit } from './produit.model';

/** Module Favoris (ajoute le 2026-09-29, implementation des wireframes -- icone coeur). */
export interface FavoriResponse {
  id: number;
  produit: Produit;
  dateAjout: string;
}

export interface AjouterFavoriRequest {
  produitId: number;
}
