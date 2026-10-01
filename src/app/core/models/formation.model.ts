export interface Formation {
  id: number;
  titre: string;
  dateSession: string;
  lieu: string;
  formateur: string;
  nombreParticipants: number;
}

export interface CreerFormationRequest {
  titre: string;
  dateSession: string;
  lieu: string;
  formateur: string;
}
