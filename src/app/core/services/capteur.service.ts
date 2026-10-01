import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Capteur, CreerCapteurRequest, CreerMesureRequest, Mesure } from '../models/capteur.model';

@Injectable({ providedIn: 'root' })
export class CapteurService {
  private http = inject(HttpClient);

  installer(payload: CreerCapteurRequest): Observable<Capteur> {
    return this.http.post<Capteur>(`${environment.apiUrl}/capteurs`, payload);
  }

  listerParSerre(serreId: number): Observable<Capteur[]> {
    return this.http.get<Capteur[]>(`${environment.apiUrl}/capteurs/serre/${serreId}`);
  }

  enregistrerMesure(payload: CreerMesureRequest): Observable<Mesure> {
    return this.http.post<Mesure>(`${environment.apiUrl}/mesures`, payload);
  }

  historiqueMesures(capteurId: number): Observable<Mesure[]> {
    return this.http.get<Mesure[]>(`${environment.apiUrl}/mesures/capteur/${capteurId}`);
  }
}
