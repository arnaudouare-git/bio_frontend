import { Injectable, computed, signal } from '@angular/core';
import { LignePanier } from '../models/panier.model';
import { Produit } from '../models/produit.model';

const CLE_STOCKAGE = 'bioconversion_panier';

/**
 * Panier d'achat (module ajoute le 2026-09-29, implementation des wireframes
 * -- pages 3 "Catalogue" (icone panier + badge) et 5 "Panier"). État
 * volontairement 100% frontend (persisté en localStorage, par navigateur) :
 * pas d'entité backend dédiée, le panier n'est qu'une étape de préparation
 * avant l'appel à POST /api/commandes (qui accepte déjà plusieurs lignes en
 * une seule commande, voir CommandeService.passerCommande) au moment de
 * "Passer la commande" depuis la page Panier.
 */
@Injectable({ providedIn: 'root' })
export class PanierService {
  lignes = signal<LignePanier[]>(this.lireStockage());

  nombreArticles = computed(() =>
    this.lignes().reduce((total, ligne) => total + ligne.quantite, 0)
  );

  montantTotal = computed(() =>
    this.lignes().reduce((total, ligne) => total + ligne.produit.prixUnitaire * ligne.quantite, 0)
  );

  ajouter(produit: Produit, quantite: number): void {
    if (quantite < 1) {
      return;
    }
    this.lignes.update((liste) => {
      const existante = liste.find((l) => l.produit.id === produit.id);
      if (existante) {
        return liste.map((l) =>
          l.produit.id === produit.id
            ? { ...l, quantite: Math.min(l.quantite + quantite, produit.stock || l.quantite + quantite) }
            : l
        );
      }
      return [...liste, { produit, quantite }];
    });
    this.sauvegarder();
  }

  modifierQuantite(produitId: number, quantite: number): void {
    if (quantite < 1) {
      this.retirer(produitId);
      return;
    }
    this.lignes.update((liste) =>
      liste.map((l) => (l.produit.id === produitId ? { ...l, quantite } : l))
    );
    this.sauvegarder();
  }

  retirer(produitId: number): void {
    this.lignes.update((liste) => liste.filter((l) => l.produit.id !== produitId));
    this.sauvegarder();
  }

  vider(): void {
    this.lignes.set([]);
    this.sauvegarder();
  }

  private sauvegarder(): void {
    localStorage.setItem(CLE_STOCKAGE, JSON.stringify(this.lignes()));
  }

  private lireStockage(): LignePanier[] {
    try {
      const brut = localStorage.getItem(CLE_STOCKAGE);
      return brut ? JSON.parse(brut) : [];
    } catch {
      return [];
    }
  }
}
