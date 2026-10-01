import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProduitService } from '../../../core/services/produit.service';
import { AuthService } from '../../../core/services/auth.service';
import { Produit } from '../../../core/models/produit.model';
import { environment } from '../../../../environments/environment';

interface BrouillonProduit {
  nom: string;
  etat: string;
  prixUnitaire: number;
  stock: number;
}

function brouillonVide(): BrouillonProduit {
  return { nom: '', etat: '', prixUnitaire: 0, stock: 0 };
}

@Component({
  selector: 'app-mes-produits',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mes-produits.component.html',
})
export class MesProduitsComponent implements OnInit {
  private produitService = inject(ProduitService);
  private authService = inject(AuthService);

  serverUrl = environment.serverUrl;

  produits = signal<Produit[]>([]);
  chargement = signal(false);
  erreur = signal<string | null>(null);

  formulaireCreationOuvert = signal(false);
  nouveauProduit: BrouillonProduit = brouillonVide();
  creationEnCours = signal(false);

  produitEnEdition = signal<number | null>(null);
  brouillonsEdition: Record<number, BrouillonProduit> = {};
  modificationEnCours = signal<number | null>(null);

  confirmationSuppressionId = signal<number | null>(null);
  suppressionEnCours = signal<number | null>(null);

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
        this.produits.set(produits);
        this.chargement.set(false);
      },
      error: () => {
        this.erreur.set('Impossible de charger tes produits.');
        this.chargement.set(false);
      },
    });
  }

  // --- Création ---

  ouvrirFormulaireCreation(): void {
    this.nouveauProduit = brouillonVide();
    this.formulaireCreationOuvert.set(true);
  }

  fermerFormulaireCreation(): void {
    this.formulaireCreationOuvert.set(false);
  }

  creerProduit(): void {
    const id = this.producteurId;
    if (!id) {
      return;
    }
    if (!this.nouveauProduit.nom.trim() || !this.nouveauProduit.etat.trim()) {
      this.erreur.set('Le nom et l\'état sont obligatoires.');
      return;
    }

    this.creationEnCours.set(true);
    this.erreur.set(null);

    this.produitService
      .publier({
        producteurId: id,
        nom: this.nouveauProduit.nom.trim(),
        etat: this.nouveauProduit.etat.trim(),
        prixUnitaire: Number(this.nouveauProduit.prixUnitaire),
        stock: Number(this.nouveauProduit.stock),
      })
      .subscribe({
        next: (produit) => {
          this.creationEnCours.set(false);
          this.formulaireCreationOuvert.set(false);
          this.produits.update((liste) => [produit, ...liste]);
        },
        error: (err) => {
          this.creationEnCours.set(false);
          this.erreur.set(
            err.error?.message ?? "Impossible de publier ce produit (compte vérifié requis)."
          );
        },
      });
  }

  // --- Édition ---

  commencerEdition(produit: Produit): void {
    this.brouillonsEdition[produit.id] = {
      nom: produit.nom,
      etat: produit.etat,
      prixUnitaire: produit.prixUnitaire,
      stock: produit.stock,
    };
    this.produitEnEdition.set(produit.id);
  }

  annulerEdition(): void {
    this.produitEnEdition.set(null);
  }

  enregistrerEdition(produit: Produit): void {
    const brouillon = this.brouillonsEdition[produit.id];
    if (!brouillon) {
      return;
    }

    this.modificationEnCours.set(produit.id);
    this.erreur.set(null);

    this.produitService
      .modifier(produit.id, {
        nom: brouillon.nom.trim(),
        etat: brouillon.etat.trim(),
        prixUnitaire: Number(brouillon.prixUnitaire),
        stock: Number(brouillon.stock),
      })
      .subscribe({
        next: (miseAJour) => {
          this.modificationEnCours.set(null);
          this.produitEnEdition.set(null);
          this.produits.update((liste) => liste.map((p) => (p.id === produit.id ? miseAJour : p)));
        },
        error: (err) => {
          this.modificationEnCours.set(null);
          this.erreur.set(err.error?.message ?? 'Impossible de modifier ce produit.');
        },
      });
  }

  // --- Suppression ---

  demanderSuppression(produitId: number): void {
    this.confirmationSuppressionId.set(produitId);
  }

  annulerSuppression(): void {
    this.confirmationSuppressionId.set(null);
  }

  confirmerSuppression(produitId: number): void {
    this.suppressionEnCours.set(produitId);
    this.erreur.set(null);

    this.produitService.supprimer(produitId).subscribe({
      next: () => {
        this.suppressionEnCours.set(null);
        this.confirmationSuppressionId.set(null);
        this.produits.update((liste) => liste.filter((p) => p.id !== produitId));
      },
      error: (err) => {
        this.suppressionEnCours.set(null);
        this.erreur.set(err.error?.message ?? 'Impossible de supprimer ce produit.');
      },
    });
  }
  // --- Photo (module ajoute le 2026-09-29, implementation des wireframes -- Dashboard Producteur) ---

  photoEnCours = signal<number | null>(null);

  selectionnerPhoto(produitId: number, evenement: Event): void {
    const fichier = (evenement.target as HTMLInputElement).files?.[0];
    if (!fichier) {
      return;
    }

    this.photoEnCours.set(produitId);
    this.erreur.set(null);

    this.produitService.enregistrerPhoto(produitId, fichier).subscribe({
      next: (miseAJour) => {
        this.photoEnCours.set(null);
        this.produits.update((liste) => liste.map((p) => (p.id === produitId ? miseAJour : p)));
      },
      error: (err) => {
        this.photoEnCours.set(null);
        this.erreur.set(err.error?.message ?? "Impossible d'envoyer la photo.");
      },
    });
  }
}
