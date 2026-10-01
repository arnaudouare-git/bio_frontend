import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AjouterFavoriRequest, FavoriResponse } from '../models/favori.model';

/**
 * Module Favoris (ajoute le 2026-09-29, implementation des wireframes --
 * icone coeur sur la page Detail Produit et section "Mes favoris" du
 * Profil). Toutes les routes exigent un compte connecte (voir
 * FavoriController cote backend) ; pas d'appel a faire si
 * authService.estConnecte() est faux.
 */
@Injectable({ providedIn: 'root' })
export class FavoriService {
  private http = inject(HttpClient);

  ajouter(produitId: number): Observable<FavoriResponse> {
    const payload: AjouterFavoriRequest = { produitId };
    return this.http.post<FavoriResponse>(`${environment.apiUrl}/favoris`, payload);
  }

  retirer(produitId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/favoris/${produitId}`);
  }

  listerUtilisateur(utilisateurId: number): Observable<FavoriResponse[]> {
    return this.http.get<FavoriResponse[]>(`${environment.apiUrl}/favoris/utilisateur/${utilisateurId}`);
  }
}
