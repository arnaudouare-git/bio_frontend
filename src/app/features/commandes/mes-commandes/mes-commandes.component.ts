import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommandeService } from '../../../core/services/commande.service';
import { AuthService } from '../../../core/services/auth.service';
import { PaiementService } from '../../../core/services/paiement.service';
import { AvisService } from '../../../core/services/avis.service';
import { LitigeService } from '../../../core/services/litige.service';
import { ProduitService } from '../../../core/services/produit.service';
import { CommandeResponse } from '../../../core/models/commande.model';
import { MethodePaiement, PaiementResponse } from '../../../core/models/paiement.model';
import { LitigeResponse } from '../../../core/models/litige.model';
import { Produit } from '../../../core/models/produit.model';

interface BrouillonAvis {
  note: number;
  commentaire: string;
}

@Component({
  selector: 'app-mes-commandes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './mes-commandes.component.html',
})
export class MesCommandesComponent implements OnInit {
  private commandeService = inject(CommandeService);
  private authService = inject(AuthService);
  private paiementService = inject(PaiementService);
  private avisService = inject(AvisService);
  private litigeService = inject(LitigeService);
  private produitService = inject(ProduitService);

  commandes = signal<CommandeResponse[]>([]);
  chargement = signal(false);
  erreur = signal<string | null>(null);
  annulationEnCours = signal<number | null>(null);

  // --- Paiement ---
  paiementsParCommande = signal<Record<number, PaiementResponse[]>>({});
  paiementEnCours = signal<number | null>(null);
  telechargementEnCours = signal<number | null>(null);
  methodeChoisie: Record<number, MethodePaiement> = {};

  // --- Avis ---
  produitsIndex = signal<Record<number, Produit>>({});
  avisFormulaireOuvert = signal<string | null>(null);
  avisBrouillons: Record<string, BrouillonAvis> = {};
  avisEnCours = signal<string | null>(null);
  avisEnvoyes = signal<Set<string>>(new Set());

  // --- Litige ---
  litigesUtilisateur = signal<LitigeResponse[]>([]);
  litigeFormulaireOuvert = signal<number | null>(null);
  motifLitigeBrouillon: Record<number, string> = {};
  litigeEnCours = signal<number | null>(null);

  ngOnInit(): void {
    this.chargerCatalogue();
    this.charger();
  }

  private chargerCatalogue(): void {
    this.produitService.listerCatalogue().subscribe({
      next: (produits) => {
        const index: Record<number, Produit> = {};
        produits.forEach((p) => (index[p.id] = p));
        this.produitsIndex.set(index);
      },
      error: () => {
        // Pas bloquant : sans le catalogue on ne peut juste pas proposer "laisser un avis".
      },
    });
  }

  charger(): void {
    const utilisateur = this.authService.currentUser();
    if (!utilisateur) {
      return;
    }

    this.chargement.set(true);
    this.erreur.set(null);
    this.chargerLitiges(utilisateur.id);

    this.commandeService.listerParAcheteur(utilisateur.id).subscribe({
      next: (commandes) => {
        const triees = [...commandes].sort((a, b) => b.id - a.id);
        this.commandes.set(triees);
        this.chargement.set(false);
        triees.forEach((commande) => this.chargerPaiements(commande.id));
      },
      error: () => {
        this.erreur.set('Impossible de charger tes commandes.');
        this.chargement.set(false);
      },
    });
  }

  annuler(commande: CommandeResponse): void {
    this.annulationEnCours.set(commande.id);
    this.erreur.set(null);

    this.commandeService.annuler(commande.id).subscribe({
      next: () => {
        this.annulationEnCours.set(null);
        this.charger();
      },
      error: (err) => {
        this.annulationEnCours.set(null);
        this.erreur.set(err.error?.message ?? "Impossible d'annuler cette commande.");
      },
    });
  }

  peutAnnuler(commande: CommandeResponse): boolean {
    return commande.statut !== 'ANNULEE' && commande.statut !== 'LIVREE';
  }

  // --- Paiement ---

  chargerPaiements(commandeId: number): void {
    this.paiementService.listerParCommande(commandeId).subscribe({
      next: (paiements) => {
        this.paiementsParCommande.update((map) => ({ ...map, [commandeId]: paiements }));
      },
      error: () => {
        // Pas bloquant : la commande reste affichée même si l'historique des paiements ne charge pas.
      },
    });
  }

  private rafraichirCommande(commandeId: number): void {
    this.commandeService.obtenir(commandeId).subscribe({
      next: (commande) => {
        this.commandes.update((liste) => liste.map((c) => (c.id === commandeId ? commande : c)));
      },
    });
    this.chargerPaiements(commandeId);
  }

  paiementReussi(commande: CommandeResponse): PaiementResponse | undefined {
    return (this.paiementsParCommande()[commande.id] ?? []).find((p) => p.statut === 'REUSSI');
  }

  paiementEnAttente(commande: CommandeResponse): PaiementResponse | undefined {
    return (this.paiementsParCommande()[commande.id] ?? []).find((p) => p.statut === 'EN_ATTENTE');
  }

  peutPayer(commande: CommandeResponse): boolean {
    return (
      commande.statut !== 'ANNULEE' &&
      !this.paiementReussi(commande) &&
      !this.paiementEnAttente(commande)
    );
  }

  definirMethode(commandeId: number, valeur: string): void {
    this.methodeChoisie[commandeId] = valeur as MethodePaiement;
  }

  initierPaiement(commande: CommandeResponse): void {
    const methode = this.methodeChoisie[commande.id] ?? 'ORANGE_MONEY';
    this.paiementEnCours.set(commande.id);
    this.erreur.set(null);

    this.paiementService.initierPaiement({ commandeId: commande.id, methode }).subscribe({
      next: () => {
        this.paiementEnCours.set(null);
        this.rafraichirCommande(commande.id);
      },
      error: (err) => {
        this.paiementEnCours.set(null);
        this.erreur.set(err.error?.message ?? "Impossible d'initier le paiement.");
      },
    });
  }

  simulerConfirmation(paiement: PaiementResponse, reussi: boolean): void {
    this.paiementEnCours.set(paiement.commandeId);
    this.erreur.set(null);

    this.paiementService.confirmerPaiement(paiement.id, { reussi }).subscribe({
      next: () => {
        this.paiementEnCours.set(null);
        this.rafraichirCommande(paiement.commandeId);
      },
      error: (err) => {
        this.paiementEnCours.set(null);
        this.erreur.set(err.error?.message ?? 'Impossible de confirmer le paiement.');
      },
    });
  }

  telechargerFacture(paiement: PaiementResponse): void {
    this.telechargementEnCours.set(paiement.id);
    this.erreur.set(null);

    this.paiementService.telechargerFacture(paiement.id).subscribe({
      next: (blob) => {
        this.telechargementEnCours.set(null);
        const url = window.URL.createObjectURL(blob);
        const lien = document.createElement('a');
        lien.href = url;
        lien.download = `facture-paiement-${paiement.id}.pdf`;
        lien.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.telechargementEnCours.set(null);
        this.erreur.set('Impossible de télécharger la facture (le paiement doit être réussi).');
      },
    });
  }

  // --- Avis ---

  private cleAvis(commandeId: number, producteurId: number): string {
    return `${commandeId}:${producteurId}`;
  }

  /** Producteurs distincts ayant au moins une ligne LIVREE dans cette commande. */
  producteursLivres(commande: CommandeResponse): { producteurId: number; producteurNom: string }[] {
    const index = this.produitsIndex();
    const vus = new Map<number, string>();

    for (const ligne of commande.lignes) {
      if (ligne.statut === 'LIVREE') {
        const produit = index[ligne.produitId];
        if (produit) {
          vus.set(produit.producteurId, produit.producteurNom);
        }
      }
    }

    return Array.from(vus.entries()).map(([producteurId, producteurNom]) => ({
      producteurId,
      producteurNom,
    }));
  }

  avisDejaEnvoye(commandeId: number, producteurId: number): boolean {
    return this.avisEnvoyes().has(this.cleAvis(commandeId, producteurId));
  }

  brouillonAvis(commandeId: number, producteurId: number): BrouillonAvis {
    const cle = this.cleAvis(commandeId, producteurId);
    if (!this.avisBrouillons[cle]) {
      this.avisBrouillons[cle] = { note: 5, commentaire: '' };
    }
    return this.avisBrouillons[cle];
  }

  ouvrirFormulaireAvis(commandeId: number, producteurId: number): void {
    this.brouillonAvis(commandeId, producteurId);
    this.avisFormulaireOuvert.set(this.cleAvis(commandeId, producteurId));
  }

  fermerFormulaireAvis(): void {
    this.avisFormulaireOuvert.set(null);
  }

  envoyerAvis(commande: CommandeResponse, producteurId: number): void {
    const cle = this.cleAvis(commande.id, producteurId);
    const brouillon = this.brouillonAvis(commande.id, producteurId);
    this.avisEnCours.set(cle);
    this.erreur.set(null);

    this.avisService
      .laisserAvis({
        commandeId: commande.id,
        producteurId,
        note: Number(brouillon.note),
        commentaire: brouillon.commentaire?.trim() || undefined,
      })
      .subscribe({
        next: () => {
          this.avisEnCours.set(null);
          this.avisFormulaireOuvert.set(null);
          this.avisEnvoyes.update((set) => new Set(set).add(cle));
        },
        error: (err) => {
          this.avisEnCours.set(null);
          this.erreur.set(
            err.error?.message ?? "Impossible d'envoyer cet avis (peut-être déjà envoyé)."
          );
        },
      });
  }

  // --- Litige ---

  private chargerLitiges(utilisateurId: number): void {
    this.litigeService.listerParUtilisateur(utilisateurId).subscribe({
      next: (litiges) => this.litigesUtilisateur.set(litiges),
      error: () => {
        // Pas bloquant.
      },
    });
  }

  litigeOuvert(commande: CommandeResponse): LitigeResponse | undefined {
    return this.litigesUtilisateur().find((l) => l.commandeId === commande.id && l.statut === 'OUVERT');
  }

  peutOuvrirLitige(commande: CommandeResponse): boolean {
    return !!this.paiementReussi(commande) && commande.statut !== 'LIVREE' && !this.litigeOuvert(commande);
  }

  ouvrirFormulaireLitige(commandeId: number): void {
    if (this.motifLitigeBrouillon[commandeId] === undefined) {
      this.motifLitigeBrouillon[commandeId] = '';
    }
    this.litigeFormulaireOuvert.set(commandeId);
  }

  fermerFormulaireLitige(): void {
    this.litigeFormulaireOuvert.set(null);
  }

  envoyerLitige(commande: CommandeResponse): void {
    const motif = (this.motifLitigeBrouillon[commande.id] ?? '').trim();
    if (!motif) {
      this.erreur.set('Merci de décrire le motif du litige.');
      return;
    }

    this.litigeEnCours.set(commande.id);
    this.erreur.set(null);

    this.litigeService.ouvrirLitige({ commandeId: commande.id, motif }).subscribe({
      next: (litige) => {
        this.litigeEnCours.set(null);
        this.litigeFormulaireOuvert.set(null);
        this.litigesUtilisateur.update((liste) => [...liste, litige]);
      },
      error: (err) => {
        this.litigeEnCours.set(null);
        this.erreur.set(err.error?.message ?? "Impossible d'ouvrir ce litige.");
      },
    });
  }
}
