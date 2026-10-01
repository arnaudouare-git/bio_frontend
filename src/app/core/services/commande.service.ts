import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ChangerStatutCommandeRequest,
  CommandeResponse,
  CreerCommandeRequest,
} from '../models/commande.model';

@Injectable({ providedIn: 'root' })
export class CommandeService {
  private http = inject(HttpClient);

  passerCommande(payload: CreerCommandeRequest): Observable<CommandeResponse> {
    return this.http.post<CommandeResponse>(`${environment.apiUrl}/commandes`, payload);
  }

  /** Toutes les commandes de la plateforme -- reserve Admin (module ajoute le 2026-09-29). */
  listerToutes(): Observable<CommandeResponse[]> {
    return this.http.get<CommandeResponse[]>(`${environment.apiUrl}/commandes`);
  }

  listerParAcheteur(acheteurId: number): Observable<CommandeResponse[]> {
    return this.http.get<CommandeResponse[]>(`${environment.apiUrl}/commandes/acheteur/${acheteurId}`);
  }

  listerParProducteur(producteurId: number): Observable<CommandeResponse[]> {
    return this.http.get<CommandeResponse[]>(`${environment.apiUrl}/commandes/producteur/${producteurId}`);
  }

  obtenir(commandeId: number): Observable<CommandeResponse> {
    return this.http.get<CommandeResponse>(`${environment.apiUrl}/commandes/${commandeId}`);
  }

  changerStatut(commandeId: number, payload: ChangerStatutCommandeRequest): Observable<CommandeResponse> {
    return this.http.put<CommandeResponse>(`${environment.apiUrl}/commandes/${commandeId}/statut`, payload);
  }

  changerStatutLigne(
    commandeId: number,
    ligneId: number,
    payload: ChangerStatutCommandeRequest
  ): Observable<CommandeResponse> {
    return this.http.put<CommandeResponse>(
      `${environment.apiUrl}/commandes/${commandeId}/lignes/${ligneId}/statut`,
      payload
    );
  }

  annuler(commandeId: number): Observable<CommandeResponse> {
    return this.changerStatut(commandeId, { statut: 'ANNULEE' });
  }
}
