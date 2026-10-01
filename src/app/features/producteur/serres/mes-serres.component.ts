import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SerreService } from '../../../core/services/serre.service';
import { AuthService } from '../../../core/services/auth.service';
import { Serre } from '../../../core/models/serre.model';

interface BrouillonSerre {
  nom: string;
  localisation: string;
  capaciteMax: number;
}

@Component({
  selector: 'app-mes-serres',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './mes-serres.component.html',
})
export class MesSerresComponent implements OnInit {
  private serreService = inject(SerreService);
  private authService = inject(AuthService);

  serres = signal<Serre[]>([]);
  chargement = signal(false);
  erreur = signal<string | null>(null);

  formulaireOuvert = signal(false);
  nouvelleSerre: BrouillonSerre = { nom: '', localisation: '', capaciteMax: 0 };
  creationEnCours = signal(false);

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

    this.serreService.listerParProducteur(id).subscribe({
      next: (serres) => {
        this.serres.set(serres);
        this.chargement.set(false);
      },
      error: () => {
        this.erreur.set('Impossible de charger tes serres.');
        this.chargement.set(false);
      },
    });
  }

  ouvrirFormulaire(): void {
    this.nouvelleSerre = { nom: '', localisation: '', capaciteMax: 0 };
    this.formulaireOuvert.set(true);
  }

  fermerFormulaire(): void {
    this.formulaireOuvert.set(false);
  }

  creerSerre(): void {
    const id = this.producteurId;
    if (!id) {
      return;
    }
    if (!this.nouvelleSerre.nom.trim() || !this.nouvelleSerre.localisation.trim()) {
      this.erreur.set('Le nom et la localisation sont obligatoires.');
      return;
    }

    this.creationEnCours.set(true);
    this.erreur.set(null);

    this.serreService
      .creer({
        producteurId: id,
        nom: this.nouvelleSerre.nom.trim(),
        localisation: this.nouvelleSerre.localisation.trim(),
        capaciteMax: Number(this.nouvelleSerre.capaciteMax),
      })
      .subscribe({
        next: (serre) => {
          this.creationEnCours.set(false);
          this.formulaireOuvert.set(false);
          this.serres.update((liste) => [serre, ...liste]);
        },
        error: (err) => {
          this.creationEnCours.set(false);
          this.erreur.set(
            err.error?.message ?? "Impossible de créer cette serre (compte vérifié requis)."
          );
        },
      });
  }
}
