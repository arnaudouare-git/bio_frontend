import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Pied de page public (module ajoute le 2026-09-29, implementation des
 * wireframes -- page 1 "Accueil"). Reutilisable sur les futures pages
 * publiques (Catalogue, Detail Produit...) construites dans les phases
 * suivantes.
 */
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './footer.component.html',
})
export class FooterComponent {
  anneeCourante = new Date().getFullYear();
}
