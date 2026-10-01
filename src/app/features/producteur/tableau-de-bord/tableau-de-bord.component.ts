import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ProduitService } from '../../../core/services/produit.service';
import { CommandeService } from '../../../core/services/commande.service';
import { PaiementService } from '../../../core/services/paiement.service';
import { Produit } from '../../../core/models/produit.model';
import { CommandeResponse } from '../../../core/models/commande.model';

/**
 * KPI du tableau de bord Producteur (module ajoute le 2026-09-29, sur le
 * meme principe que le tableau de bord Admin) : nombre de produits publies,
 * nombre en rupture de stock, nombre de lignes de commande en attente
 * (parmi MES produits uniquement) et revenu net cumule (somme des
 * montantNetProducteur des paiements recus).
 */
@Component({
  selector: 'app-tableau-de-bord-producteur',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './tableau-de-bord.component.html',
})
export class TableauDeBordProducteurComponent implements OnInit {
  authService = inject(AuthService);
  private produitService = inject(ProduitService);
  private commandeService = inject(CommandeService);
  private paiementService = inject(PaiementService);

  chargementKpi = signal(false);

  produits = signal<Produit[]>([]);
  commandes = signal<CommandeResponse[]>([]);
  revenuNet = signal<number>(0);

  nombreProduits = computed(() => this.produits().length);

  nombreEnRupture = computed(() => this.produits().filter((p) => p.stock <= 0).length);

  nombreLignesEnAttente = computed(() => {
    const idsProduits = new Set(this.produits().map((p) => p.id));
    let total = 0;
    for (const commande of this.commandes()) {
      for (const ligne of commande.lignes) {
        if (idsProduits.has(ligne.produitId) && ligne.statut === 'EN_ATTENTE') {
          total++;
        }
      }
    }
    return total;
  });

  ngOnInit(): void {
    const producteurId = this.authService.currentUser()?.id;
    if (!producteurId) {
      return;
    }
    this.chargementKpi.set(true);
    this.produitService.listerParProducteur(producteurId).subscribe({
      next: (liste) => this.produits.set(liste),
      error: () => {},
    });
    this.commandeService.listerParProducteur(producteurId).subscribe({
      next: (liste) => this.commandes.set(liste),
      error: () => {},
    });
    this.paiementService.listerRecusParProducteur(producteurId).subscribe({
      next: (liste) => {
        const total = liste.reduce((somme, recu) => somme + recu.montantNetProducteur, 0);
        this.revenuNet.set(total);
        this.chargementKpi.set(false);
      },
      error: () => this.chargementKpi.set(false),
    });
  }
}
