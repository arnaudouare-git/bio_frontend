import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PanierService } from '../../core/services/panier.service';
import { CommandeService } from '../../core/services/commande.service';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

/**
 * Page Panier (module ajoute le 2026-09-29, implementation des wireframes --
 * page 5 "Panier") : liste des articles ajoutés depuis le Catalogue, avec
 * steppers de quantité, suppression de ligne, résumé, et bouton "Passer la
 * commande" qui envoie TOUTES les lignes en un seul appel à
 * POST /api/commandes (déjà supporté par le backend -- CreerCommandeRequest
 * accepte plusieurs lignes).
 *
 * Page publique (on peut regarder son panier sans être connecté), mais
 * passer la commande exige un compte -- redirige vers /connexion sinon,
 * sans perdre le contenu du panier (persisté en localStorage).
 */
@Component({
  selector: 'app-panier',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './panier.component.html',
})
export class PanierComponent {
  panierService = inject(PanierService);
  authService = inject(AuthService);
  private commandeService = inject(CommandeService);
  private router = inject(Router);

  serverUrl = environment.serverUrl;

  adresseLivraison = '';
  enCours = signal(false);
  erreur = signal<string | null>(null);

  modifierQuantite(produitId: number, evenement: Event): void {
    const valeur = Number((evenement.target as HTMLInputElement).value);
    this.panierService.modifierQuantite(produitId, valeur);
  }

  retirer(produitId: number): void {
    this.panierService.retirer(produitId);
  }

  passerCommande(): void {
    this.erreur.set(null);

    if (!this.authService.estConnecte()) {
      this.router.navigate(['/connexion']);
      return;
    }

    if (!this.adresseLivraison.trim()) {
      this.erreur.set('Indique une adresse de livraison.');
      return;
    }

    if (this.panierService.lignes().length === 0) {
      this.erreur.set('Ton panier est vide.');
      return;
    }

    this.enCours.set(true);

    this.commandeService
      .passerCommande({
        adresseLivraison: this.adresseLivraison,
        lignes: this.panierService.lignes().map((l) => ({
          produitId: l.produit.id,
          quantite: l.quantite,
        })),
      })
      .subscribe({
        next: (commande) => {
          this.enCours.set(false);
          this.panierService.vider();
          // Redirige vers la page Paiement dediee (module ajoute le
          // 2026-09-29, implementation des wireframes -- page 6), pas
          // directement vers la liste /commandes.
          this.router.navigate(['/commandes', commande.id, 'paiement']);
        },
        error: (err) => {
          this.enCours.set(false);
          if (err.status === 403) {
            this.erreur.set('Ton compte doit être vérifié avant de pouvoir commander.');
          } else if (err.status === 409) {
            this.erreur.set('Stock insuffisant pour un ou plusieurs articles du panier.');
          } else {
            this.erreur.set(err.error?.message ?? 'Impossible de passer la commande.');
          }
        },
      });
  }
}
