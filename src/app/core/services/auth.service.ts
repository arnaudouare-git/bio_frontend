import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth.model';
import { PanierService } from './panier.service';

const TOKEN_KEY = 'bioconversion_token';
const USER_KEY = 'bioconversion_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser = signal<AuthResponse | null>(this.lireUtilisateurStocke());

  constructor(private http: HttpClient, private router: Router, private panierService: PanierService) {}

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
    // Vide le panier a la deconnexion (module ajoute le 2026-09-29) : le
    // panier n'est pas rattache a un compte, mieux vaut repartir propre
    // plutot que de risquer qu'un autre utilisateur du meme navigateur
    // commande les articles laisses par le precedent.
    this.panierService.vider();
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
