import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Alerte, CreerSerreRequest, Serre, SerreDashboard } from '../models/serre.model';

@Injectable({ providedIn: 'root' })
export class SerreService {
  private http = inject(HttpClient);

  creer(payload: CreerSerreRequest): Observable<Serre> {
    return this.http.post<Serre>(`${environment.apiUrl}/serres`, payload);
  }

  listerParProducteur(producteurId: number): Observable<Serre[]> {
    return this.http.get<Serre[]>(`${environment.apiUrl}/serres/producteur/${producteurId}`);
  }

  obtenir(serreId: number): Observable<Serre> {
    return this.http.get<Serre>(`${environment.apiUrl}/serres/${serreId}`);
  }

  dashboard(serreId: number): Observable<SerreDashboard> {
    return this.http.get<SerreDashboard>(`${environment.apiUrl}/serres/${serreId}/dashboard`);
  }

  listerAlertes(serreId: number): Observable<Alerte[]> {
    return this.http.get<Alerte[]>(`${environment.apiUrl}/alertes/serre/${serreId}`);
  }

  traiterAlerte(alerteId: number): Observable<Alerte> {
    return this.http.put<Alerte>(`${environment.apiUrl}/alertes/${alerteId}/traiter`, {});
  }
}
