import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreerProduitRequest, ModifierProduitRequest, Produit } from '../models/produit.model';

@Injectable({ providedIn: 'root' })
export class ProduitService {
  private http = inject(HttpClient);

  listerCatalogue(): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${environment.apiUrl}/produits`);
  }

  /** Detail d'un seul produit (module ajoute le 2026-09-29), lecture publique. */
  obtenirProduit(produitId: number): Observable<Produit> {
    return this.http.get<Produit>(`${environment.apiUrl}/produits/${produitId}`);
  }

  rechercherProximite(lat: number, lon: number, rayonKm = 50): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${environment.apiUrl}/produits/proximite`, {
      params: { lat, lon, rayonKm },
    });
  }

  listerParProducteur(producteurId: number): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${environment.apiUrl}/produits/producteur/${producteurId}`);
  }

  publier(payload: CreerProduitRequest): Observable<Produit> {
    return this.http.post<Produit>(`${environment.apiUrl}/produits`, payload);
  }

  modifier(produitId: number, payload: ModifierProduitRequest): Observable<Produit> {
    return this.http.put<Produit>(`${environment.apiUrl}/produits/${produitId}`, payload);
  }

  supprimer(produitId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/produits/${produitId}`);
  }

  /** Module Photo produit (ajoute le 2026-09-29). Envoi multipart/form-data, champ "fichier". */
  enregistrerPhoto(produitId: number, fichier: File): Observable<Produit> {
    const donnees = new FormData();
    donnees.append('fichier', fichier);
    return this.http.post<Produit>(`${environment.apiUrl}/produits/${produitId}/photo`, donnees);
  }
}
