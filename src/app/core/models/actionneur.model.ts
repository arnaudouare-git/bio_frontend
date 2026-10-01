export type EtatActionneur = 'ACTIF' | 'INACTIF';

export interface Actionneur {
  id: number;
  type: string;
  etat: string;
  dateDernierChangement: string | null;
  serreId: number;
}

export interface ChangerEtatActionneurRequest {
  etat: EtatActionneur;
}
