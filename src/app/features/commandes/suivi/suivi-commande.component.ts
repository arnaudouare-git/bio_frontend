import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommandeService } from '../../../core/services/commande.service';
import { PaiementService } from '../../../core/services/paiement.service';
import { CommandeResponse } from '../../../core/models/commande.model';
import { PaiementResponse } from '../../../core/models/paiement.model';

const ORDRE_STATUTS = ['EN_ATTENTE', 'CONFIRMEE', 'EN_PREPARATION', 'EXPEDIEE', 'LIVREE'];

interface Etape {
  cle: string;
  libelle: string;
}

const ETAPES: Etape[] = [
  { cle: 'CONFIRMEE', libelle: 'Confirmee' },
  { cle: 'EN_PREPARATION', libelle: 'Preparation' },
  { cle: 'EXPEDIEE', libelle: 'A livrer' },
  { cle: 'LIVREE', libelle: 'Livree' },
];

/**
 * Page Suivi de Commande (ajoutee le 2026-09-29, implementation des
 * wireframes -- page 7) : stepper horizontal 4 etapes + telechargement de
 * facture. N'existait pas avant -- "Mes commandes" (/commandes) reste la
 * liste, cette page (/commandes/:id) est le detail d'UNE commande.
 *
 * Le stepper est calcule a partir du statut le MOINS avance parmi les
 * lignes encore actives (une commande peut porter sur plusieurs
 * Producteurs, chacun avancant sa propre ligne independamment -- voir
 * CommandeService.changerStatutLigne cote backend). Les lignes REFUSEE ou
 * ANNULEE sont ignorees dans ce calcul mais affichees a part, avec leur
 * motif le cas echeant.
 *
 * Limite connue (documentee dans le plan de suivi, pas corrigee ici -- hors
 * perimetre de cette phase) : cote backend, un paiement en especes (CASH)
 * ne fait jamais passer Commande.statut a CONFIRMEE (seule la confirmation
 * Orange Money le fait, voir PaiementService.confirmerPaiement). Cette page
 * compense cote frontend : la simple existence d'un paiement CASH est
 * traitee comme "commande acceptee" (voir paiementConfirme()).
 */
@Component({
  selector: 'app-suivi-commande',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './suivi-commande.component.html',
})
export class SuiviCommandeComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private commandeService = inject(CommandeService);
  private paiementService = inject(PaiementService);

  commande = signal<CommandeResponse | null>(null);
  paiements = signal<PaiementResponse[]>([]);
  chargement = signal(true);
  erreur = signal<string | null>(null);
  telechargementEnCours = signal(false);

  etapes = ETAPES;

  paiementReussi = computed(() => this.paiements().find((p) => p.statut === 'REUSSI'));
  paiementCash = computed(() => this.paiements().find((p) => p.methode === 'CASH'));
  paiementConfirme = computed(() => !!this.paiementReussi() || !!this.paiementCash());

  /** Lignes ni refusees ni annulees -- celles qui comptent pour le stepper. */
  lignesActives = computed(() => {
    const c = this.commande();
    if (!c) {
      return [];
    }
    return c.lignes.filter((l) => l.statut !== 'REFUSEE' && l.statut !== 'ANNULEE');
  });

  toutesLignesRefusees = computed(() => {
    const c = this.commande();
    if (!c || c.lignes.length === 0) {
      return false;
    }
    return c.lignes.every((l) => l.statut === 'REFUSEE' || l.statut === 'ANNULEE');
  });

  private indexMinimum = computed<number | null>(() => {
    const lignes = this.lignesActives();
    if (lignes.length === 0) {
      return null;
    }
    const indices = lignes.map((l) => {
      const i = ORDRE_STATUTS.indexOf(l.statut);
      return i === -1 ? 0 : i;
    });
    return Math.min(...indices);
  });

  /** Index de l'etape active dans ETAPES (-1 = pas encore payee / rien a afficher). */
  etapeActiveIndex = computed(() => {
    if (!this.paiementConfirme()) {
      return -1;
    }
    const index = this.indexMinimum();
    if (index === null) {
      return -1;
    }
    // ORDRE_STATUTS index 0/1 (EN_ATTENTE/CONFIRMEE) correspondent tous deux
    // a la premiere etape du stepper ("Confirmee").
    return Math.max(0, index - 1);
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.erreur.set('Commande introuvable.');
      this.chargement.set(false);
      return;
    }

    this.commandeService.obtenir(id).subscribe({
      next: (commande) => {
        this.commande.set(commande);
        this.paiementService.listerParCommande(id).subscribe({
          next: (paiements) => {
            this.paiements.set(paiements);
            this.chargement.set(false);
          },
          error: () => this.chargement.set(false),
        });
      },
      error: () => {
        this.erreur.set('Cette commande est introuvable.');
        this.chargement.set(false);
      },
    });
  }

  telechargerFacture(): void {
    const paye = this.paiementReussi();
    if (!paye) {
      return;
    }
    this.telechargementEnCours.set(true);
    this.paiementService.telechargerFacture(paye.id).subscribe({
      next: (blob) => {
        this.telechargementEnCours.set(false);
        const url = window.URL.createObjectURL(blob);
        const lien = document.createElement('a');
        lien.href = url;
        lien.download = `facture-commande-${this.commande()?.id}.pdf`;
        lien.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.telechargementEnCours.set(false);
        this.erreur.set('Impossible de telecharger la facture.');
      },
    });
  }
}
