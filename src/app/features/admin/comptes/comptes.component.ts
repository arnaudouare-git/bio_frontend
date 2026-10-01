import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { Utilisateur } from '../../../core/models/utilisateur.model';

type FiltreRole = 'TOUS' | 'PRODUCTEUR' | 'CLIENT';

@Component({
  selector: 'app-comptes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comptes.component.html',
})
export class ComptesComponent implements OnInit {
  private adminService = inject(AdminService);

  utilisateurs = signal<Utilisateur[]>([]);
  chargement = signal(false);
  erreur = signal<string | null>(null);
  actionEnCours = signal<number | null>(null);

  filtreRole = signal<FiltreRole>('TOUS');

  utilisateursFiltres = computed(() => {
    const filtre = this.filtreRole();
    const liste = this.utilisateurs();
    if (filtre === 'TOUS') {
      return liste;
    }
    return liste.filter((u) => u.role === filtre);
  });

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.chargement.set(true);
    this.erreur.set(null);

    this.adminService.listerUtilisateurs().subscribe({
      next: (utilisateurs) => {
        this.utilisateurs.set([...utilisateurs].sort((a, b) => a.id - b.id));
        this.chargement.set(false);
      },
      error: () => {
        this.erreur.set('Impossible de charger les comptes.');
        this.chargement.set(false);
      },
    });
  }

  private patcher(id: number, changements: Partial<Utilisateur>): void {
    this.utilisateurs.update((liste) =>
      liste.map((u) => (u.id === id ? { ...u, ...changements } : u))
    );
  }

  peutActiver(u: Utilisateur): boolean {
    return u.role === 'PRODUCTEUR' && u.statutVerificationCnib !== 'VERIFIE' && u.formationSuivie === true;
  }

  activer(u: Utilisateur): void {
    this.actionEnCours.set(u.id);
    this.erreur.set(null);

    this.adminService.activerCompte(u.id).subscribe({
      next: () => {
        this.actionEnCours.set(null);
        this.patcher(u.id, { statutVerificationCnib: 'VERIFIE' });
      },
      error: (err) => {
        this.actionEnCours.set(null);
        this.erreur.set(err.error?.message ?? 'Impossible d\'activer ce compte.');
      },
    });
  }

  suspendre(u: Utilisateur): void {
    this.actionEnCours.set(u.id);
    this.erreur.set(null);

    this.adminService.suspendreCompte(u.id).subscribe({
      next: () => {
        this.actionEnCours.set(null);
        this.patcher(u.id, { actif: false });
      },
      error: (err) => {
        this.actionEnCours.set(null);
        this.erreur.set(err.error?.message ?? 'Impossible de suspendre ce compte.');
      },
    });
  }

  reactiver(u: Utilisateur): void {
    this.actionEnCours.set(u.id);
    this.erreur.set(null);

    this.adminService.reactiverCompte(u.id).subscribe({
      next: () => {
        this.actionEnCours.set(null);
        this.patcher(u.id, { actif: true });
      },
      error: (err) => {
        this.actionEnCours.set(null);
        this.erreur.set(err.error?.message ?? 'Impossible de réactiver ce compte.');
      },
    });
  }
}
