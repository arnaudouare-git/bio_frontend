import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { RoleUtilisateur } from '../../../core/models/auth.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  formulaire = this.fb.group({
    nom: ['', Validators.required],
    prenom: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telephone: ['', Validators.required],
    motDePasse: ['', [Validators.required, Validators.minLength(6)]],
    role: ['CLIENT' as RoleUtilisateur, Validators.required],
    documentIdentiteRef: [''],
  });

  chargement = false;
  erreur: string | null = null;

  constructor() {
    this.formulaire.get('role')?.valueChanges.subscribe((role) => {
      const champCnib = this.formulaire.get('documentIdentiteRef');
      if (role === 'PRODUCTEUR') {
        champCnib?.setValidators(Validators.required);
      } else {
        champCnib?.clearValidators();
      }
      champCnib?.updateValueAndValidity();
    });
  }

  get estProducteur(): boolean {
    return this.formulaire.get('role')?.value === 'PRODUCTEUR';
  }

  soumettre(): void {
    if (this.formulaire.invalid) {
      this.formulaire.markAllAsTouched();
      return;
    }

    this.chargement = true;
    this.erreur = null;

    const valeurs = this.formulaire.getRawValue();

    this.authService.inscrire({
      nom: valeurs.nom!,
      prenom: valeurs.prenom!,
      email: valeurs.email!,
      telephone: valeurs.telephone!,
      motDePasse: valeurs.motDePasse!,
      role: valeurs.role as RoleUtilisateur,
      documentIdentiteRef: valeurs.documentIdentiteRef || undefined,
    }).subscribe({
      next: () => {
        this.chargement = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.chargement = false;
        if (err.status === 409) {
          this.erreur = 'Un compte existe déjà avec cet email.';
        } else if (err.status === 400) {
          this.erreur = err.error?.message ?? 'Données invalides, vérifiez le formulaire.';
        } else {
          this.erreur = "Une erreur est survenue, réessayez.";
        }
      },
    });
  }
}
