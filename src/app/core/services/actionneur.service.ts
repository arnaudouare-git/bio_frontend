import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Actionneur, ChangerEtatActionneurRequest } from '../models/actionneur.model';

@Injectable({ providedIn: 'root' })
export class ActionneurService {
  private http = inject(HttpClient);

  listerParSerre(serreId: number): Observable<Actionneur[]> {
    return this.http.get<Actionneur[]>(`${environment.apiUrl}/actionneurs/serre/${serreId}`);
  }

  changerEtat(actionneurId: number, payload: ChangerEtatActionneurRequest): Observable<Actionneur> {
    return this.http.put<Actionneur>(`${environment.apiUrl}/actionneurs/${actionneurId}/etat`, payload);
  }
}
