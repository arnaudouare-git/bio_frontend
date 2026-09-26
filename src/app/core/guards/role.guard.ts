import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard = (rolesAutorises: string[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const utilisateur = authService.currentUser();

    if (utilisateur && rolesAutorises.includes(utilisateur.role)) {
      return true;
    }
    router.navigate(['/']);
    return false;
  };
};
