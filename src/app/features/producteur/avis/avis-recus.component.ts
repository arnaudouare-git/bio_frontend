import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvisService } from '../../../core/services/avis.service';
import { AuthService } from '../../../core/services/auth.service';
import { AvisResponse } from '../../../core/models/avis.model';

@Component({
  selector: 'app-avis-recus',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './avis-recus.component.html',
})
export class AvisRecusComponent implements OnInit {
  private avisService = inject(AvisService);
  private authService = inject(AuthService);

  avis = signal<AvisResponse[]>([]);
  chargement = signal(false);
  erreur = signal<string | null>(null);

  noteMoyenne = computed(() => {
    const liste = this.avis();
    if (liste.length === 0) {
      return null;
    }
    const somme = liste.reduce((total, a) => total + a.note, 0);
    return Math.round((somme / liste.length) * 10) / 10;
  });

  ngOnInit(): void {
    const id = this.authService.currentUser()?.id;
    if (!id) {
      return;
    }

    this.chargement.set(true);
    this.erreur.set(null);

    this.avisService.listerParProducteur(id).subscribe({
      next: (avis) => {
        this.avis.set([...avis].sort((a, b) => b.id - a.id));
        this.chargement.set(false);
      },
      error: () => {
        this.erreur.set('Impossible de charger tes avis.');
        this.chargement.set(false);
      },
    });
  }
}
