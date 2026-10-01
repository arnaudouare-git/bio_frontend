import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreerLitigeRequest, LitigeResponse, ResoudreLitigeRequest } from '../models/litige.model';

@Injectable({ providedIn: 'root' })
export class LitigeService {
  private http = inject(HttpClient);

  ouvrirLitige(payload: CreerLitigeRequest): Observable<LitigeResponse> {
    return this.http.post<LitigeResponse>(`${environment.apiUrl}/litiges`, payload);
  }

  listerTous(): Observable<LitigeResponse[]> {
    return this.http.get<LitigeResponse[]>(`${environment.apiUrl}/litiges`);
  }

  obtenir(litigeId: number): Observable<LitigeResponse> {
    return this.http.get<LitigeResponse>(`${environment.apiUrl}/litiges/${litigeId}`);
  }

  listerParUtilisateur(utilisateurId: number): Observable<LitigeResponse[]> {
    return this.http.get<LitigeResponse[]>(`${environment.apiUrl}/litiges/utilisateur/${utilisateurId}`);
  }

  resoudre(litigeId: number, payload: ResoudreLitigeRequest): Observable<LitigeResponse> {
    return this.http.put<LitigeResponse>(`${environment.apiUrl}/litiges/${litigeId}/statut`, payload);
  }
}
