import { Injectable, signal } from '@angular/core';

export type TypeToast = 'succes' | 'erreur' | 'info';

export interface Toast {
  id: number;
  type: TypeToast;
  message: string;
}

const DUREE_AFFICHAGE_MS: Record<TypeToast, number> = {
  succes: 3500,
  info: 4000,
  erreur: 6000,
};

/**
 * Service de notifications "toast" globales (Phase 6, 2026-09-26) : point
 * d'entrée unique pour afficher un message temporaire à l'utilisateur, sans
 * dupliquer une zone d'alerte dans chaque composant. Utilisé notamment par
 * errorInterceptor pour rendre lisibles les erreurs API non traitées
 * localement par un composant.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<Toast[]>([]);
  private prochainId = 1;

  succes(message: string): void {
    this.afficher('succes', message);
  }

  erreur(message: string): void {
    this.afficher('erreur', message);
  }

  info(message: string): void {
    this.afficher('info', message);
  }

  fermer(id: number): void {
    this.toasts.update(liste => liste.filter(t => t.id !== id));
  }

  private afficher(type: TypeToast, message: string): void {
    const id = this.prochainId++;
    this.toasts.update(liste => [...liste, { id, type, message }]);
    setTimeout(() => this.fermer(id), DUREE_AFFICHAGE_MS[type]);
  }
}
