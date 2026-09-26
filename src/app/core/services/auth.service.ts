import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth.model';

const TOKEN_KEY = 'bioconversion_token';
const USER_KEY = 'bioconversion_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser = signal<AuthResponse | null>(this.lireUtilisateurStocke());

  constructor(private http: HttpClient, private router: Router) {}

  inscrire(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/inscription`, payload)
      .pipe(tap(reponse => this.enregistrerSession(reponse)));
  }

  connecter(payload: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/connexion`, payload)
      .pipe(tap(reponse => this.enregistrerSession(reponse)));
  }

  deconnecter(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUser.set(null);
    this.router.navigate(['/connexion']);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  estConnecte(): boolean {
    return !!this.getToken();
  }

  private enregistrerSession(reponse: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, reponse.token);
    localStorage.setItem(USER_KEY, JSON.stringify(reponse));
    this.currentUser.set(reponse);
  }

  private lireUtilisateurStocke(): AuthResponse | null {
    const brut = localStorage.getItem(USER_KEY);
    return brut ? JSON.parse(brut) : null;
  }
}
