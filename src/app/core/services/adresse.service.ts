import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdresseResponse, CreerAdresseRequest } from '../models/adresse.model';

/** Module Adresses enregistrees (ajoute le 2026-09-29, implementation des wireframes -- page Profil). */
@Injectable({ providedIn: 'root' })
export class AdresseService {
  private http = inject(HttpClient);

  ajouter(payload: CreerAdresseRequest): Observable<AdresseResponse> {
    return this.http.post<AdresseResponse>(`${environment.apiUrl}/adresses`, payload);
  }

  modifier(adresseId: number, payload: CreerAdresseRequest): Observable<AdresseResponse> {
    return this.http.put<AdresseResponse>(`${environment.apiUrl}/adresses/${adresseId}`, payload);
  }

  supprimer(adresseId: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/adresses/${adresseId}`);
  }

  listerUtilisateur(utilisateurId: number): Observable<AdresseResponse[]> {
    return this.http.get<AdresseResponse[]>(`${environment.apiUrl}/adresses/utilisateur/${utilisateurId}`);
  }
}
