import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AvisResponse, CreerAvisRequest } from '../models/avis.model';

@Injectable({ providedIn: 'root' })
export class AvisService {
  private http = inject(HttpClient);

  laisserAvis(payload: CreerAvisRequest): Observable<AvisResponse> {
    return this.http.post<AvisResponse>(`${environment.apiUrl}/avis`, payload);
  }

  listerParProducteur(producteurId: number): Observable<AvisResponse[]> {
    return this.http.get<AvisResponse[]>(`${environment.apiUrl}/avis/producteur/${producteurId}`);
  }

  /** Avis laisses sur un produit precis (module ajoute le 2026-09-29), lecture publique. */
  listerParProduit(produitId: number): Observable<AvisResponse[]> {
    return this.http.get<AvisResponse[]>(`${environment.apiUrl}/avis/produit/${produitId}`);
  }
}
