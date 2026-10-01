import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProduitService } from '../../../core/services/produit.service';
import { PanierService } from '../../../core/services/panier.service';
import { ToastService } from '../../../core/services/toast.service';
import { Produit } from '../../../core/models/produit.model';
import { environment } from '../../../../environments/environment';

type Tri = 'nom' | 'prix-asc' | 'prix-desc';

/**
 * Catalogue des produits (module revu le 2026-09-29, implementation des
 * wireframes -- page 3 "Catalogue") : recherche, filtres (état, prix
 * min/max, stock minimum), tri, et bouton "Ajouter au panier" à la place de
 * la commande directe d'origine -- la commande se passe désormais depuis la
 * page Panier (voir PanierService), qui peut regrouper plusieurs produits en
 * un seul appel à POST /api/commandes.
 *
 * Page publique (plus de authGuard sur la route 'produits', voir
 * app.routes.ts) : la navigation et la mise au panier fonctionnent sans
 * connexion, seul le passage de commande depuis le Panier l'exige.
 */
@Component({
  selector: 'app-catalogue',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './catalogue.component.html',
})
export class CatalogueComponent implements OnInit {
  private produitService = inject(ProduitService);
  private panierService = inject(PanierService);
  private toastService = inject(ToastService);

  serverUrl = environment.serverUrl;

  produits = signal<Produit[]>([]);
  chargement = signal(false);
  erreur = signal<string | null>(null);
  modeProximite = signal(false);

  recherche = signal('');
  filtreEtat = signal('');
  prixMin = signal<number | null>(null);
  prixMax = signal<number | null>(null);
  stockMin = signal<number | null>(null);
  tri = signal<Tri>('nom');

  quantites: Record<number, number> = {};

  /** Valeurs d'état distinctes trouvées dans le catalogue chargé, pour le menu déroulant du filtre. */
  etatsDisponibles = computed(() => {
    const etats = new Set(this.produits().map((p) => p.etat).filter((e): e is string => !!e));
    return Array.from(etats).sort();
  });

  produitsAffiches = computed(() => {
    const recherche = this.recherche().trim().toLowerCase();
    const etat = this.filtreEtat();
    const prixMin = this.prixMin();
    const prixMax = this.prixMax();
    const stockMin = this.stockMin();
    const tri = this.tri();

    let resultat = this.produits().filter((produit) => {
      if (recherche && !produit.nom.toLowerCase().includes(recherche)) {
        return false;
      }
      if (etat && produit.etat !== etat) {
        return false;
      }
      if (prixMin !== null && produit.prixUnitaire < prixMin) {
        return false;
      }
      if (prixMax !== null && produit.prixUnitaire > prixMax) {
        return false;
      }
      if (stockMin !== null && produit.stock < stockMin) {
        return false;
      }
      return true;
    });

    resultat = [...resultat].sort((a, b) => {
      if (tri === 'prix-asc') {
        return a.prixUnitaire - b.prixUnitaire;
      }
      if (tri === 'prix-desc') {
        return b.prixUnitaire - a.prixUnitaire;
      }
      return a.nom.localeCompare(b.nom);
    });

    return resultat;
  });

  ngOnInit(): void {
    this.chargerCatalogue();
  }

  chargerCatalogue(): void {
    this.chargement.set(true);
    this.erreur.set(null);
    this.modeProximite.set(false);
    this.produitService.listerCatalogue().subscribe({
      next: (produits) => {
        this.produits.set(produits);
        this.chargement.set(false);
      },
      error: () => {
        this.erreur.set('Impossible de charger le catalogue.');
        this.chargement.set(false);
      },
    });
  }

  rechercherPresDeMoi(): void {
    if (!navigator.geolocation) {
      this.erreur.set("La géolocalisation n'est pas disponible sur ce navigateur.");
      return;
    }

    this.chargement.set(true);
    this.erreur.set(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        this.produitService.rechercherProximite(latitude, longitude, 50).subscribe({
          next: (produits) => {
            this.produits.set(produits);
            this.modeProximite.set(true);
            this.chargement.set(false);
          },
          error: () => {
            this.erreur.set('Impossible de rechercher les produits à proximité.');
            this.chargement.set(false);
          },
        });
      },
      () => {
        this.erreur.set('Localisation refusée ou indisponible.');
        this.chargement.set(false);
      }
    );
  }

  reinitialiserFiltres(): void {
    this.recherche.set('');
    this.filtreEtat.set('');
    this.prixMin.set(null);
    this.prixMax.set(null);
    this.stockMin.set(null);
    this.tri.set('nom');
  }

  getQuantite(produitId: number): number {
    return this.quantites[produitId] ?? 1;
  }

  setQuantite(produitId: number, valeur: number): void {
    this.quantites[produitId] = valeur;
  }

  ajouterAuPanier(produit: Produit): void {
    const quantite = this.getQuantite(produit.id);
    if (!quantite || quantite < 1) {
      this.toastService.erreur('Quantité invalide.');
      return;
    }
    this.panierService.ajouter(produit, quantite);
    this.toastService.succes(`"${produit.nom}" ajouté au panier.`);
  }
}
