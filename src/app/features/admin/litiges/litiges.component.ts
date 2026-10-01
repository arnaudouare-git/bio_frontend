import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LitigeService } from '../../../core/services/litige.service';
import { LitigeResponse } from '../../../core/models/litige.model';

type StatutResolution = 'RESOLU' | 'REJETE';

@Component({
  selector: 'app-litiges',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './litiges.component.html',
})
export class LitigesComponent implements OnInit {
  private litigeService = inject(LitigeService);

  litiges = signal<LitigeResponse[]>([]);
  chargement = signal(false);
  erreur = signal<string | null>(null);

  formulaireOuvert = signal<number | null>(null);
  statutChoisi: Record<number, StatutResolution> = {};
  decisionBrouillon: Record<number, string> = {};
  resolutionEnCours = signal<number | null>(null);

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.chargement.set(true);
    this.erreur.set(null);

    this.litigeService.listerTous().subscribe({
      next: (litiges) => {
        this.litiges.set(
          [...litiges].sort((a, b) => {
            if (a.statut === 'OUVERT' && b.statut !== 'OUVERT') return -1;
            if (a.statut !== 'OUVERT' && b.statut === 'OUVERT') return 1;
            return b.id - a.id;
          })
        );
        this.chargement.set(false);
      },
      error: () => {
        this.erreur.set('Impossible de charger les litiges.');
        this.chargement.set(false);
      },
    });
  }

  ouvrirResolution(litigeId: number): void {
    if (this.statutChoisi[litigeId] === undefined) {
      this.statutChoisi[litigeId] = 'RESOLU';
    }
    if (this.decisionBrouillon[litigeId] === undefined) {
      this.decisionBrouillon[litigeId] = '';
    }
    this.formulaireOuvert.set(litigeId);
  }

  fermerResolution(): void {
    this.formulaireOuvert.set(null);
  }

  resoudre(litige: LitigeResponse): void {
    const decisionAdmin = (this.decisionBrouillon[litige.id] ?? '').trim();
    if (!decisionAdmin) {
      this.erreur.set('La décision est obligatoire.');
      return;
    }

    this.resolutionEnCours.set(litige.id);
    this.erreur.set(null);

    this.litigeService
      .resoudre(litige.id, { statut: this.statutChoisi[litige.id], decisionAdmin })
      .subscribe({
        next: (miseAJour) => {
          this.resolutionEnCours.set(null);
          this.formulaireOuvert.set(null);
          this.litiges.update((liste) => liste.map((l) => (l.id === litige.id ? miseAJour : l)));
        },
        error: (err) => {
          this.resolutionEnCours.set(null);
          this.erreur.set(err.error?.message ?? 'Impossible de trancher ce litige.');
        },
      });
  }
}
