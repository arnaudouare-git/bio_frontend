export interface Produit {
  id: number;
  nom: string;
  etat: string;
  prixUnitaire: number;
  stock: number;
  producteurId: number;
  producteurNom: string;
  distanceKm: number | null;
  /** Chemin relatif (ex: "/uploads/produits/xxx.jpg"), null si pas de photo -- module ajoute le 2026-09-29. */
  photoUrl: string | null;
  /**
   * Coordonnees du producteur de ce produit (module Recherche geolocalisee,
   * ajoute le 2026-09-29). Non nulles UNIQUEMENT quand ce produit vient de
   * ProduitService.rechercherProximite() -- restent null pour le catalogue
   * classique, meme regle que distanceKm.
   */
  latitude: number | null;
  longitude: number | null;
}

export interface CreerProduitRequest {
  producteurId: number;
  nom: string;
  etat: string;
  prixUnitaire: number;
  stock: number;
}

export interface ModifierProduitRequest {
  nom: string;
  etat: string;
  prixUnitaire: number;
  stock: number;
}
