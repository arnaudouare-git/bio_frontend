import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { Formation } from '../../../core/models/formation.model';
import { Utilisateur } from '../../../core/models/utilisateur.model';

interface BrouillonFormation {
  titre: string;
  dateSession: string;
  lieu: string;
  formateur: string;
}

@Component({
  selector: 'app-formations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './formations.component.html',
})
export class FormationsComponent implements OnInit {
  private adminService = inject(AdminService);

  formations = signal<Formation[]>([]);
  chargement = signal(false);
  erreur = signal<string | null>(null);

  formulaireOuvert = signal(false);
  nouvelleFormation: BrouillonFormation = { titre: '', dateSession: '', lieu: '', formateur: '' };
  creationEnCours = signal(false);

  producteurs = signal<Utilisateur[]>([]);
  inscriptionFormulaireOuvert = signal<number | null>(null);
  producteurSelectionne: Record<number, number | null> = {};
  inscriptionEnCours = signal<number | null>(null);

  ngOnInit(): void {
    this.charger();
    this.chargerProducteurs();
  }

  charger(): void {
    this.chargement.set(true);
    this.erreur.set(null);

    this.adminService.listerFormations().subscribe({
      next: (formations) => {
        this.formations.set([...formations].sort((a, b) => b.id - a.id));
        this.chargement.set(false);
      },
      error: () => {
        this.erreur.set('Impossible de charger les formations.');
        this.chargement.set(false);
      },
    });
  }

  private chargerProducteurs(): void {
    this.adminService.listerUtilisateurs().subscribe({
      next: (utilisateurs) => {
        this.producteurs.set(utilisateurs.filter((u) => u.role === 'PRODUCTEUR'));
      },
      error: () => {
        // Pas bloquant : sans cette liste on ne peut juste pas proposer d'inscrire un participant.
      },
    });
  }

  // --- Création ---

  ouvrirFormulaire(): void {
    this.nouvelleFormation = { titre: '', dateSession: '', lieu: '', formateur: '' };
    this.formulaireOuvert.set(true);
  }

  fermerFormulaire(): void {
    this.formulaireOuvert.set(false);
  }

  creerFormation(): void {
    if (!this.nouvelleFormation.titre.trim() || !this.nouvelleFormation.dateSession) {
      this.erreur.set('Le titre et la date de session sont obligatoires.');
      return;
    }

    this.creationEnCours.set(true);
    this.erreur.set(null);

    this.adminService
      .creerFormation({
        titre: this.nouvelleFormation.titre.trim(),
        dateSession: this.nouvelleFormation.dateSession,
        lieu: this.nouvelleFormation.lieu.trim(),
        formateur: this.nouvelleFormation.formateur.trim(),
      })
      .subscribe({
        next: (formation) => {
          this.creationEnCours.set(false);
          this.formulaireOuvert.set(false);
          this.formations.update((liste) => [formation, ...liste]);
        },
        error: (err) => {
          this.creationEnCours.set(false);
          this.erreur.set(err.error?.message ?? 'Impossible de créer cette formation.');
        },
      });
  }

  // --- Inscription d'un participant ---

  ouvrirInscription(formationId: number): void {
    if (this.producteurSelectionne[formationId] === undefined) {
      this.producteurSelectionne[formationId] = null;
    }
    this.inscriptionFormulaireOuvert.set(formationId);
  }

  fermerInscription(): void {
    this.inscriptionFormulaireOuvert.set(null);
  }

  inscrire(formation: Formation): void {
    const producteurId = this.producteurSelectionne[formation.id];
    if (!producteurId) {
      this.erreur.set('Choisis un producteur à inscrire.');
      return;
    }

    this.inscriptionEnCours.set(formation.id);
    this.erreur.set(null);

    this.adminService.enregistrerParticipant(formation.id, producteurId).subscribe({
      next: () => {
        this.inscriptionEnCours.set(null);
        this.inscriptionFormulaireOuvert.set(null);
        this.formations.update((liste) =>
          liste.map((f) =>
            f.id === formation.id ? { ...f, nombreParticipants: f.nombreParticipants + 1 } : f
          )
        );
      },
      error: (err) => {
        this.inscriptionEnCours.set(null);
        this.erreur.set(err.error?.message ?? "Impossible d'inscrire ce producteur.");
      },
    });
  }
}
