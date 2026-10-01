import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommandeService } from '../../../core/services/commande.service';
import { ProduitService } from '../../../core/services/produit.service';
import { AuthService } from '../../../core/services/auth.service';
import { CommandeResponse, LigneCommandeResponse } from '../../../core/models/commande.model';

const ORDRE_STATUTS = ['EN_ATTENTE', 'CONFIRMEE', 'EN_PREPARATION', 'EXPEDIEE', 'LIVREE'];

@Component({
  selector: 'app-commandes-recues',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './commandes-recues.component.html',
})
export class CommandesRecuesComponent implements OnInit {
  private commandeService = inject(CommandeService);
  private produitService = inject(ProduitService);
  private authService = inject(AuthService);

  commandes = signal<CommandeResponse[]>([]);
  chargement = signal(false);
  erreur = signal<string | null>(null);
  mesProduitIds = signal<Set<number>>(new Set());

  ligneEnCours = signal<number | null>(null);
  refusFormulaireOuvert = signal<number | null>(null);
  motifRefusBrouillon: Record<number, string> = {};

  ngOnInit(): void {
    this.charger();
  }

  private get producteurId(): number | undefined {
    return this.authService.currentUser()?.id;
  }

  charger(): void {
    const id = this.producteurId;
    if (!id) {
      return;
    }
    this.chargement.set(true);
    this.erreur.set(null);

    this.produitService.listerParProducteur(id).subscribe({
      next: (produits) => {
        this.mesProduitIds.set(new Set(produits.map((p) => p.id)));
      },
      error: () => {
        // Pas bloquant : sans cette liste on ne peut juste pas cibler les lignes "a moi".
      },
    });

    this.commandeService.listerParProducteur(id).subscribe({
      next: (commandes) => {
        this.commandes.set([...commandes].sort((a, b) => b.id - a.id));
        this.chargement.set(false);
      },
      error: () => {
        this.erreur.set('Impossible de charger les commandes reçues.');
        this.chargement.set(false);
      },
    });
  }

  estMaLigne(ligne: LigneCommandeResponse): boolean {
    return this.mesProduitIds().has(ligne.produitId);
  }

  private remplacerCommande(commande: CommandeResponse): void {
    this.commandes.update((liste) => liste.map((c) => (c.id === commande.id ? commande : c)));
  }

  prochainStatut(statutActuel: string): string | null {
    const index = ORDRE_STATUTS.indexOf(statutActuel);
    if (index === -1 || index === ORDRE_STATUTS.length - 1) {
      return null;
    }
    return ORDRE_STATUTS[index + 1];
  }

  peutAvancer(ligne: LigneCommandeResponse): boolean {
    return this.estMaLigne(ligne) && this.prochainStatut(ligne.statut) !== null;
  }

  avancerLigne(commande: CommandeResponse, ligne: LigneCommandeResponse): void {
    const nouveauStatut = this.prochainStatut(ligne.statut);
    if (!nouveauStatut) {
      return;
    }

    this.ligneEnCours.set(ligne.ligneId);
    this.erreur.set(null);

    this.commandeService.changerStatutLigne(commande.id, ligne.ligneId, { statut: nouveauStatut }).subscribe({
      next: (miseAJour) => {
        this.ligneEnCours.set(null);
        this.remplacerCommande(miseAJour);
      },
      error: (err) => {
        this.ligneEnCours.set(null);
        this.erreur.set(err.error?.message ?? "Impossible de faire avancer cette ligne.");
      },
    });
  }

  peutRefuser(ligne: LigneCommandeResponse): boolean {
    return this.estMaLigne(ligne) && ligne.statut === 'EN_ATTENTE';
  }

  ouvrirFormulaireRefus(ligneId: number): void {
    if (this.motifRefusBrouillon[ligneId] === undefined) {
      this.motifRefusBrouillon[ligneId] = '';
    }
    this.refusFormulaireOuvert.set(ligneId);
  }

  fermerFormulaireRefus(): void {
    this.refusFormulaireOuvert.set(null);
  }

  confirmerRefus(commande: CommandeResponse, ligne: LigneCommandeResponse): void {
    const motif = (this.motifRefusBrouillon[ligne.ligneId] ?? '').trim();
    if (!motif) {
      this.erreur.set('Merci de préciser un motif de refus.');
      return;
    }

    this.ligneEnCours.set(ligne.ligneId);
    this.erreur.set(null);

    this.commandeService
      .changerStatutLigne(commande.id, ligne.ligneId, { statut: 'REFUSEE', motif })
      .subscribe({
        next: (miseAJour) => {
          this.ligneEnCours.set(null);
          this.refusFormulaireOuvert.set(null);
          this.remplacerCommande(miseAJour);
        },
        error: (err) => {
          this.ligneEnCours.set(null);
          this.erreur.set(err.error?.message ?? 'Impossible de refuser cette ligne.');
        },
      });
  }
}
