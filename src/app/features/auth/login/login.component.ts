import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  formulaire = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    motDePasse: ['', Validators.required],
  });

  chargement = false;
  erreur: string | null = null;

  soumettre(): void {
    if (this.formulaire.invalid) {
      this.formulaire.markAllAsTouched();
      return;
    }

    this.chargement = true;
    this.erreur = null;

    this.authService.connecter({
      email: this.formulaire.value.email!,
      motDePasse: this.formulaire.value.motDePasse!,
    }).subscribe({
      next: () => {
        this.chargement = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.chargement = false;
        if (err.status === 401) {
          this.erreur = 'Email ou mot de passe incorrect.';
        } else if (err.status === 403) {
          this.erreur = 'Votre compte a été suspendu. Contactez un administrateur.';
        } else {
          this.erreur = "Une erreur est survenue, réessayez.";
        }
      },
    });
  }
}
