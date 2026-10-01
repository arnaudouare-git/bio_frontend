import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ProduitService } from '../../core/services/produit.service';
import { Produit } from '../../core/models/produit.model';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { environment } from '../../../environments/environment';

/**
 * Page d'accueil PUBLIQUE (module ajoute le 2026-09-29, implementation des
 * wireframes -- page 1 "Accueil"). Avant ce module, cette route etait
 * reservee aux connectes (canActivate: [authGuard], voir app.routes.ts) et
 * n'affichait qu'une carte de profil minimale -- ecart de fond signale dans
 * le plan d'implementation des wireframes.
 *
 * Desormais accessible sans connexion : vitrine (hero, produits en vedette,
 * section "Pourquoi BioConversion", footer), avec un bandeau de bienvenue
 * personnalise et un bouton "Mon espace" en plus quand un utilisateur EST
 * connecte -- meme page pour tout le monde, contenu adapte a la session,
 * plutot que deux pages separees.
 */
@Component({
  selector: 'app-accueil',
  standalone: true,
  imports: [CommonModule, RouterLink, FooterComponent],
  templateUrl: './accueil.component.html',
})
export class AccueilComponent implements OnInit {
  authService = inject(AuthService);
  private produitService = inject(ProduitService);

  serverUrl = environment.serverUrl;

  produitsVedette = signal<Produit[]>([]);
  chargementProduits = signal(true);

  ngOnInit(): void {
    // Reprend le meme endpoint public que le Catalogue (GET /api/produits,
    // uniquement les produits en stock) -- on en garde juste les premiers
    // pour la section "produits en vedette".
    this.produitService.listerCatalogue().subscribe({
      next: (produits) => {
        this.produitsVedette.set(produits.slice(0, 4));
        this.chargementProduits.set(false);
      },
      error: () => {
        this.chargementProduits.set(false);
      },
    });
  }

  /** Destination du bouton "Mon espace", selon le role de l'utilisateur connecte. */
  lienEspace(): string {
    const role = this.authService.currentUser()?.role;
    if (role === 'PRODUCTEUR') {
      return '/producteur';
    }
    if (role === 'ADMINISTRATEUR') {
      return '/admin';
    }
    return '/produits';
  }

  badgeStatut(statut: string): string {
    switch (statut) {
      case 'VERIFIE':
        return 'bg-bordeaux-50 text-bordeaux-700';
      case 'EN_ATTENTE':
        return 'bg-amber-50 text-amber-700';
      case 'REJETE':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  }
}
