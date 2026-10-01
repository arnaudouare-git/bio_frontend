import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

/**
 * Connexion Administrateur dediee (ajoutee le 2026-09-29, implementation
 * des wireframes -- page 12). Charte visuelle distincte (fond sombre,
 * mention "connexion journalisee") mais fonctionnellement identique a la
 * connexion classique : meme endpoint POST /api/auth/connexion, un seul
 * login pour tous les roles cote backend -- il n'existe pas de connexion
 * "reservee" au niveau serveur. Cette page verifie donc APRES connexion
 * que le compte a bien le role ADMINISTRATEUR avant de rediriger vers
 * /admin ; sinon elle affiche une erreur et laisse la personne connectee
 * sous son propre compte (pas de deconnexion forcee -- ses identifiants
 * etaient valides, seul l'acces a CET espace lui est refuse).
 */
@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './admin-login.component.html',
})
export class AdminLoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  formulaire = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    motDePasse: ['', Validators.required],
  });

  chargement = signal(false);
  erreur = signal<string | null>(null);

  soumettre(): void {
    if (this.formulaire.invalid) {
      this.formulaire.markAllAsTouched();
      return;
    }

    this.chargement.set(true);
    this.erreur.set(null);

    this.authService
      .connecter({
        email: this.formulaire.value.email!,
        motDePasse: this.formulaire.value.motDePasse!,
      })
      .subscribe({
        next: (reponse) => {
          this.chargement.set(false);
          if (reponse.role !== 'ADMINISTRATEUR') {
            this.erreur.set("Ce compte n'a pas de droits administrateur.");
            return;
          }
          this.router.navigate(['/admin']);
        },
        error: (err) => {
          this.chargement.set(false);
          if (err.status === 401) {
            this.erreur.set('Email ou mot de passe incorrect.');
          } else if (err.status === 403) {
            this.erreur.set('Ce compte a ete suspendu.');
          } else {
            this.erreur.set('Une erreur est survenue, reessayez.');
          }
        },
      });
  }
}
