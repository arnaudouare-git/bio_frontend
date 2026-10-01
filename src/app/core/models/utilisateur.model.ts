export interface Utilisateur {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: string;
  statutVerificationCnib: string;
  actif: boolean;
  formationSuivie: boolean | null;
}
