export interface Serre {
  id: number;
  nom: string;
  localisation: string;
  capaciteMax: number;
  producteurId: number;
  producteurNom: string;
  nombreCapteurs: number;
}

export interface CreerSerreRequest {
  producteurId: number;
  nom: string;
  localisation: string;
  capaciteMax: number;
}

export interface CapteurEtat {
  capteurId: number;
  type: string;
  derniereTemperature: number | null;
  derniereHumidite: number | null;
  dateDerniereMesure: string | null;
  silencieux: boolean;
}

export interface Alerte {
  id: number;
  type: string;
  seuil: number | null;
  dateAlerte: string;
  statut: string;
  serreId: number;
}

export interface SerreDashboard {
  serreId: number;
  nomSerre: string;
  capteurs: CapteurEtat[];
  alertesNonTraitees: Alerte[];
}
