import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-accueil',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './accueil.component.html',
})
export class AccueilComponent {
  authService = inject(AuthService);

  seDeconnecter(): void {
    this.authService.deconnecter();
  }
}
