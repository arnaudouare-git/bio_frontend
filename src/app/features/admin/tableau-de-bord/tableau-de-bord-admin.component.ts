import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AdminService } from '../../../core/services/admin.service';
import { CommandeService } from '../../../core/services/commande.service';
import { StatistiquesTendances } from '../../../core/models/statistiques.model';
import { CommandeResponse } from '../../../core/models/commande.model';

/**
 * Tableau de Bord Admin (module enrichi le 2026-09-29, implementation des
 * wireframes -- page 9) : KPI cards (commandes/revenus 7 jours avec
 * variation, producteurs formes ce mois) + graphique en barres du revenu
 * quotidien + table des dernieres commandes. Les 4 cartes de navigation
 * existantes (Comptes/Formations/Litiges/Statistiques) restent en bas de
 * page, inchangees.
 *
 * Graphique en barres "maison" (divs, pas de librairie) : coherent avec le
 * reste du frontend qui n'a aucune dependance de graphiques installee, et
 * evite d'ajouter une dependance non testable dans cet environnement
 * (ng build casse ici pour une raison sans rapport, voir le plan de suivi
 * -- impossible de verifier l'integration d'une nouvelle librairie).
 */
@Component({
  selector: 'app-tableau-de-bord-admin',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './tableau-de-bord-admin.component.html',
})
export class TableauDeBordAdminComponent implements OnInit {
  authService = inject(AuthService);
  private adminService = inject(AdminService);
  private commandeService = inject(CommandeService);

  tendances = signal<StatistiquesTendances | null>(null);
  chargementTendances = signal(true);

  dernieresCommandes = signal<CommandeResponse[]>([]);
  chargementCommandes = signal(true);

  /** Hauteur relative (0-100) de chaque barre du graphique, sur le max de la periode. */
  barresRevenus = computed(() => {
    const t = this.tendances();
    if (!t || t.tendances.length === 0) {
      return [];
    }
    const max = Math.max(...t.tendances.map((j) => j.revenus), 1);
    return t.tendances.map((j) => ({
      ...j,
      hauteurPct: Math.round((j.revenus / max) * 100),
    }));
  });

  ngOnInit(): void {
    this.adminService.obtenirTendances().subscribe({
      next: (tendances) => {
        this.tendances.set(tendances);
        this.chargementTendances.set(false);
      },
      error: () => this.chargementTendances.set(false),
    });

    this.commandeService.listerToutes().subscribe({
      next: (commandes) => {
        this.dernieresCommandes.set(commandes.slice(0, 8));
        this.chargementCommandes.set(false);
      },
      error: () => this.chargementCommandes.set(false),
    });
  }

  formatVariation(valeur: number | null): string {
    if (valeur === null) {
      return '';
    }
    const signe = valeur >= 0 ? '+' : '';
    return `${signe}${valeur.toFixed(1)}%`;
  }

  formatDateCourte(dateIso: string): string {
    const d = new Date(dateIso);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  }
}
