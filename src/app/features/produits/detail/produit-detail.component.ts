import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProduitService } from '../../../core/services/produit.service';
import { AvisService } from '../../../core/services/avis.service';
import { FavoriService } from '../../../core/services/favori.service';
import { PanierService } from '../../../core/services/panier.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Produit } from '../../../core/models/produit.model';
import { AvisResponse } from '../../../core/models/avis.model';
import { environment } from '../../../../environments/environment';

type Onglet = 'description' | 'specifications' | 'avis';

/**
 * Page Detail Produit (ajoutee le 2026-09-29, implementation des wireframes
 * -- page 4). Galerie (une seule photo -- le backend ne stocke qu'un
 * photoUrl par produit, pas plusieurs images), onglets
 * Description/Specifications/Avis, note moyenne calculee cote frontend a
 * partir de GET /api/avis/produit/{id}, bouton favoris (backend module
 * Favoris, 2026-09-29).
 *
 * Page PUBLIQUE (route 'produits/:id', voir app.routes.ts), comme le
 * Catalogue : consultable sans connexion. Ajouter aux favoris redirige vers
 * /connexion si l'utilisateur n'est pas connecte (comme le passage de
 * commande depuis le Panier).
 */
@Component({
  selector: 'app-produit-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './produit-detail.component.html',
})
export class ProduitDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private produitService = inject(ProduitService);
  private avisService = inject(AvisService);
  private favoriService = inject(FavoriService);
  private panierService = inject(PanierService);
  private toastService = inject(ToastService);
  authService = inject(AuthService);

  serverUrl = environment.serverUrl;

  produit = signal<Produit | null>(null);
  avis = signal<AvisResponse[]>([]);
  chargement = signal(true);
  erreur = signal<string | null>(null);
  onglet = signal<Onglet>('description');
  quantite = signal(1);
  estFavori = signal(false);
  chargementFavori = signal(false);

  noteMoyenne = computed<number | null>(() => {
    const liste = this.avis();
    if (liste.length === 0) {
      return null;
    }
    const total = liste.reduce((somme, a) => somme + a.note, 0);
    return Math.round((total / liste.length) * 10) / 10;
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.erreur.set('Produit introuvable.');
      this.chargement.set(false);
      return;
    }
    this.chargerProduit(id);
    this.chargerAvis(id);
    this.chargerStatutFavori(id);
  }

  changerOnglet(onglet: Onglet): void {
    this.onglet.set(onglet);
  }

  ajouterAuPanier(): void {
    const produit = this.produit();
    if (!produit) {
      return;
    }
    const q = this.quantite();
    if (!q || q < 1) {
      this.toastService.erreur('Quantite invalide.');
      return;
    }
    this.panierService.ajouter(produit, q);
    this.toastService.succes(`"${produit.nom}" ajoute au panier.`);
  }

  basculerFavori(): void {
    const produit = this.produit();
    if (!produit) {
      return;
    }
    if (!this.authService.estConnecte()) {
      this.router.navigate(['/connexion']);
      return;
    }
    this.chargementFavori.set(true);
    if (this.estFavori()) {
      this.favoriService.retirer(produit.id).subscribe({
        next: () => {
          this.estFavori.set(false);
          this.chargementFavori.set(false);
          this.toastService.info('Retire des favoris.');
        },
        error: () => {
          this.chargementFavori.set(false);
          this.toastService.erreur("Impossible de retirer ce produit des favoris.");
        },
      });
    } else {
      this.favoriService.ajouter(produit.id).subscribe({
        next: () => {
          this.estFavori.set(true);
          this.chargementFavori.set(false);
          this.toastService.succes('Ajoute aux favoris.');
        },
        error: () => {
          this.chargementFavori.set(false);
          this.toastService.erreur("Impossible d'ajouter ce produit aux favoris.");
        },
      });
    }
  }

  private chargerProduit(id: number): void {
    this.produitService.obtenirProduit(id).subscribe({
      next: (produit) => {
        this.produit.set(produit);
        this.chargement.set(false);
      },
      error: () => {
        this.erreur.set('Ce produit est introuvable ou a ete retire.');
        this.chargement.set(false);
      },
    });
  }

  private chargerAvis(id: number): void {
    this.avisService.listerParProduit(id).subscribe({
      next: (avis) => this.avis.set(avis),
      error: () => {},
    });
  }

  private chargerStatutFavori(produitId: number): void {
    const utilisateur = this.authService.currentUser();
    if (!utilisateur) {
      return;
    }
    this.favoriService.listerUtilisateur(utilisateur.id).subscribe({
      next: (favoris) => this.estFavori.set(favoris.some((f) => f.produit.id === produitId)),
      error: () => {},
    });
  }
}
