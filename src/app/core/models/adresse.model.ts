export interface AdresseResponse {
  id: number;
  libelle: string;
  texte: string;
  principale: boolean | null;
}

export interface CreerAdresseRequest {
  libelle: string;
  texte: string;
  principale?: boolean;
}
