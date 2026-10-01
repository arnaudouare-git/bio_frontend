import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { NotificationModel } from '../../../core/models/notification.model';
import { PanierService } from '../../../core/services/panier.service';

/**
 * Barre de navigation globale (Phase 6, révisée le 2026-09-28) : remplace à la
 * fois la cloche flottante d'origine et les mini-liens "← Accueil" /
 * "← Espace Producteur" répétés en haut de chaque page. Montée une seule fois
 * dans App, visible sur toutes les pages authentifiées.
 */
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent implements OnInit {
  authService = inject(AuthService);
  panierService = inject(PanierService);
  private notificationService = inject(NotificationService);

  notifications = signal<NotificationModel[]>([]);
  panneauOuvert = signal(false);
  menuMobileOuvert = signal(false);
  chargement = signal(false);

  ngOnInit(): void {
    this.charger();
  }

  basculerPanneau(): void {
    this.panneauOuvert.update(v => !v);
    this.menuMobileOuvert.set(false);
    if (this.panneauOuvert()) {
      this.charger();
    }
  }

  basculerMenuMobile(): void {
    this.menuMobileOuvert.update(v => !v);
    this.panneauOuvert.set(false);
  }

  fermerMenus(): void {
    this.panneauOuvert.set(false);
    this.menuMobileOuvert.set(false);
  }

  seDeconnecter(): void {
    this.fermerMenus();
    this.authService.deconnecter();
  }

  badgeCanal(canal: string): string {
    switch (canal) {
      case 'APP':
        return 'bg-bordeaux-50 text-bordeaux-700';
      case 'EMAIL':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  }

  private charger(): void {
    const utilisateur = this.authService.currentUser();
    if (!utilisateur) {
      return;
    }
    this.chargement.set(true);
    this.notificationService.listerParUtilisateur(utilisateur.id).subscribe({
      next: (liste) => {
        this.notifications.set(liste);
        this.chargement.set(false);
      },
      error: () => {
        this.chargement.set(false);
      },
    });
  }
}
