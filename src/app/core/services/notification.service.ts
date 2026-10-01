import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NotificationModel } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private http: HttpClient) {}

  listerParUtilisateur(utilisateurId: number): Observable<NotificationModel[]> {
    return this.http.get<NotificationModel[]>(
      `${environment.apiUrl}/notifications/utilisateur/${utilisateurId}`
    );
  }
}
