import { Produit } from './produit.model';

/** Une ligne du panier : un produit + une quantité choisie. */
export interface LignePanier {
  produit: Produit;
  quantite: number;
}
