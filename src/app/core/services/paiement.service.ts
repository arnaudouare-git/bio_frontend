import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ConfirmerPaiementRequest,
  CreerPaiementRequest,
  PaiementResponse,
} from '../models/paiement.model';
import { PaiementRecuResponse } from '../models/paiement-recu.model';

@Injectable({ providedIn: 'root' })
export class PaiementService {
  private http = inject(HttpClient);

  initierPaiement(payload: CreerPaiementRequest): Observable<PaiementResponse> {
    return this.http.post<PaiementResponse>(`${environment.apiUrl}/paiements`, payload);
  }

  confirmerPaiement(paiementId: number, payload: ConfirmerPaiementRequest): Observable<PaiementResponse> {
    return this.http.put<PaiementResponse>(
      `${environment.apiUrl}/paiements/${paiementId}/confirmer`,
      payload
    );
  }

  listerParCommande(commandeId: number): Observable<PaiementResponse[]> {
    return this.http.get<PaiementResponse[]>(`${environment.apiUrl}/paiements/commande/${commandeId}`);
  }

  listerRecusParProducteur(producteurId: number): Observable<PaiementRecuResponse[]> {
    return this.http.get<PaiementRecuResponse[]>(`${environment.apiUrl}/paiements/producteur/${producteurId}`);
  }

  telechargerFacture(paiementId: number): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}/paiements/${paiementId}/facture`, {
      responseType: 'blob',
    });
  }
}
