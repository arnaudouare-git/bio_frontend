import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';

/**
 * Gestion centralisée des erreurs API (Phase 6, 2026-09-26).
 *
 * Beaucoup d'appels de lecture (listes de produits, commandes, notifications,
 * statistiques, etc.) ne traitent pas explicitement le cas d'erreur dans leur
 * `.subscribe()` : avant cet intercepteur, une commande backend indisponible
 * ou une erreur 500 échouait silencieusement (rien à l'écran, juste une
 * erreur dans la console). Cet intercepteur affiche systématiquement un
 * message lisible via ToastService, puis relance l'erreur intacte pour que
 * les composants qui gèrent déjà leur propre message inline (formulaires de
 * connexion, inscription, etc.) continuent de fonctionner sans changement.
 *
 * Le format d'erreur du backend est fixé par GlobalExceptionHandler :
 * { timestamp, status, message }.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((erreur: HttpErrorResponse) => {
      toastService.erreur(messageLisible(erreur));
      return throwError(() => erreur);
    })
  );
};

function messageLisible(erreur: HttpErrorResponse): string {
  const messageBackend = erreur.error?.message;

  if (erreur.status === 0) {
    return 'Impossible de contacter le serveur. Vérifiez votre connexion ou que le backend est démarré.';
  }
  if (erreur.status === 401) {
    return messageBackend ?? 'Votre session a expiré, veuillez vous reconnecter.';
  }
  if (erreur.status === 403) {
    return messageBackend ?? "Vous n'avez pas accès à cette ressource.";
  }
  if (erreur.status === 404) {
    return messageBackend ?? 'Ressource introuvable.';
  }
  if (erreur.status >= 500) {
    return 'Une erreur interne est survenue côté serveur. Réessayez plus tard.';
  }
  return messageBackend ?? 'Une erreur est survenue.';
}
