import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreerFormationRequest, Formation } from '../models/formation.model';
import { Utilisateur } from '../models/utilisateur.model';
import { Statistiques, StatistiquesTendances } from '../models/statistiques.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);

  creerFormation(payload: CreerFormationRequest): Observable<Formation> {
    return this.http.post<Formation>(`${environment.apiUrl}/admin/formations`, payload);
  }

  listerFormations(): Observable<Formation[]> {
    return this.http.get<Formation[]>(`${environment.apiUrl}/admin/formations`);
  }

  enregistrerParticipant(formationId: number, producteurId: number): Observable<void> {
    return this.http.post<void>(
      `${environment.apiUrl}/admin/formations/${formationId}/participants/${producteurId}`,
      {}
    );
  }

  listerUtilisateurs(): Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(`${environment.apiUrl}/admin/utilisateurs`);
  }

  activerCompte(producteurId: number): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/admin/producteurs/${producteurId}/activer`, {});
  }

  suspendreCompte(utilisateurId: number): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/admin/utilisateurs/${utilisateurId}/suspendre`, {});
  }

  reactiverCompte(utilisateurId: number): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/admin/utilisateurs/${utilisateurId}/reactiver`, {});
  }

  obtenirStatistiques(): Observable<Statistiques> {
    return this.http.get<Statistiques>(`${environment.apiUrl}/admin/statistiques`);
  }

  /** Module Statistiques temporelles (ajoute le 2026-09-29, implementation des wireframes -- page 9). */
  obtenirTendances(): Observable<StatistiquesTendances> {
    return this.http.get<StatistiquesTendances>(`${environment.apiUrl}/admin/statistiques/tendances`);
  }
}
