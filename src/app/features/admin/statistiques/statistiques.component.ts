import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { Statistiques } from '../../../core/models/statistiques.model';

@Component({
  selector: 'app-statistiques',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './statistiques.component.html',
})
export class StatistiquesComponent implements OnInit {
  private adminService = inject(AdminService);

  statistiques = signal<Statistiques | null>(null);
  chargement = signal(false);
  erreur = signal<string | null>(null);

  ngOnInit(): void {
    this.chargement.set(true);
    this.erreur.set(null);

    this.adminService.obtenirStatistiques().subscribe({
      next: (statistiques) => {
        this.statistiques.set(statistiques);
        this.chargement.set(false);
      },
      error: () => {
        this.erreur.set('Impossible de charger les statistiques.');
        this.chargement.set(false);
      },
    });
  }
}
