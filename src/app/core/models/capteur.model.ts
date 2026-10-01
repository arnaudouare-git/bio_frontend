export interface Capteur {
  id: number;
  type: string;
  dateInstallation: string;
  serreId: number;
}

export interface CreerCapteurRequest {
  serreId: number;
  type: string;
}

export interface Mesure {
  id: number;
  temperature: number | null;
  humidite: number | null;
  dateMesure: string;
  capteurId: number;
}

export interface CreerMesureRequest {
  capteurId: number;
  temperature?: number;
  humidite?: number;
}
