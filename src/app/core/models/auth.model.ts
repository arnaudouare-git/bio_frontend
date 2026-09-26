export type RoleUtilisateur = 'PRODUCTEUR' | 'CLIENT';

export interface RegisterRequest {
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  telephone: string;
  role: RoleUtilisateur;
  documentIdentiteRef?: string;
  latitude?: number;
  longitude?: number;
}

export interface LoginRequest {
  email: string;
  motDePasse: string;
}

export interface AuthResponse {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: string; // 'PRODUCTEUR' | 'CLIENT' | 'ADMINISTRATEUR'
  statutVerificationCnib: string; // 'EN_ATTENTE' | 'VERIFIE' | 'REJETE'
  token: string;
}
