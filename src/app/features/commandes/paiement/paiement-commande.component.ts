import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommandeService } from '../../../core/services/commande.service';
import { PaiementService } from '../../../core/services/paiement.service';
import { CommandeResponse } from '../../../core/models/commande.model';
import { MethodePaiement, PaiementResponse } from '../../../core/models/paiement.model';

/**
 * Page Paiement Mobile Money (ajoutee le 2026-09-29, implementation des
 * wireframes -- page 6). Atteinte depuis le Panier juste apres la creation
 * de la commande (voir PanierComponent.passerCommande). Recapitulatif +
 * choix de methode (Orange Money simule / especes a la livraison) +
 * confirmation.
 *
 * Le backend n'a pas de vrai compte marchand Orange Money : la confirmation
 * (reussi/echoue) est SIMULEE (voir PaiementService cote backend). Pour un
 * paiement en especes, il n'existe PAS d'endpoint de confirmation (constate
 * manuellement a la livraison, cote backend -- PaiementService.confirmerPaiement
 * refuse explicitement les paiements CASH) : le paiement reste EN_ATTENTE
 * indefiniment en base. Cote frontend, on considere donc la commande
 * "acceptee" des l'enregistrement du choix "especes" (paiementCash()),
 * sans proposer de simulation dans ce cas (contrairement a Orange Money).
 */
@Component({
  selector: 'app-paiement-commande',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './paiement-commande.component.html',
})
export class PaiementCommandeComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private commandeService = inject(CommandeService);
  private paiementService = inject(PaiementService);

  commande = signal<CommandeResponse | null>(null);
  paiements = signal<PaiementResponse[]>([]);
  chargement = signal(true);
  erreur = signal<string | null>(null);
  enCours = signal(false);
  methode = signal<MethodePaiement>('ORANGE_MONEY');

  commandeId = 0;

  ngOnInit(): void {
    this.commandeId = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.commandeId) {
      this.erreur.set('Commande introuvable.');
      this.chargement.set(false);
      return;
    }
    this.charger();
  }

  charger(): void {
    this.commandeService.obtenir(this.commandeId).subscribe({
      next: (commande) => {
        this.commande.set(commande);
        this.chargerPaiements();
      },
      error: () => {
        this.erreur.set('Cette commande est introuvable.');
        this.chargement.set(false);
      },
    });
  }

  private chargerPaiements(): void {
    this.paiementService.listerParCommande(this.commandeId).subscribe({
      next: (paiements) => {
        this.paiements.set(paiements);
        this.chargement.set(false);
      },
      error: () => this.chargement.set(false),
    });
  }

  paiementReussi(): PaiementResponse | undefined {
    return this.paiements().find((p) => p.statut === 'REUSSI');
  }

  paiementEnAttente(): PaiementResponse | undefined {
    return this.paiements().find((p) => p.statut === 'EN_ATTENTE' && p.methode !== 'CASH');
  }

  paiementCash(): PaiementResponse | undefined {
    return this.paiements().find((p) => p.methode === 'CASH');
  }

  initierPaiement(): void {
    this.enCours.set(true);
    this.erreur.set(null);

    this.paiementService.initierPaiement({ commandeId: this.commandeId, methode: this.methode() }).subscribe({
      next: () => {
        this.enCours.set(false);
        this.chargerPaiements();
      },
      error: (err) => {
        this.enCours.set(false);
        this.erreur.set(err.error?.message ?? "Impossible d'initier le paiement.");
      },
    });
  }

  simulerConfirmation(paiement: PaiementResponse, reussi: boolean): void {
    this.enCours.set(true);
    this.erreur.set(null);

    this.paiementService.confirmerPaiement(paiement.id, { reussi }).subscribe({
      next: () => {
        this.enCours.set(false);
        this.chargerPaiements();
      },
      error: (err) => {
        this.enCours.set(false);
        this.erreur.set(err.error?.message ?? 'Impossible de confirmer le paiement.');
      },
    });
  }
}
