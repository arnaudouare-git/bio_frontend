import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaiementService } from '../../../core/services/paiement.service';
import { AuthService } from '../../../core/services/auth.service';
import { PaiementRecuResponse } from '../../../core/models/paiement-recu.model';

@Component({
  selector: 'app-paiements-recus',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './paiements-recus.component.html',
})
export class PaiementsRecusComponent implements OnInit {
  private paiementService = inject(PaiementService);
  private authService = inject(AuthService);

  paiements = signal<PaiementRecuResponse[]>([]);
  chargement = signal(false);
  erreur = signal<string | null>(null);

  totalNet = computed(() =>
    this.paiements().reduce((total, p) => total + p.montantNetProducteur, 0)
  );

  ngOnInit(): void {
    const id = this.authService.currentUser()?.id;
    if (!id) {
      return;
    }

    this.chargement.set(true);
    this.erreur.set(null);

    this.paiementService.listerRecusParProducteur(id).subscribe({
      next: (paiements) => {
        this.paiements.set([...paiements].sort((a, b) => b.id - a.id));
        this.chargement.set(false);
      },
      error: () => {
        this.erreur.set('Impossible de charger tes paiements reçus.');
        this.chargement.set(false);
      },
    });
  }
}
