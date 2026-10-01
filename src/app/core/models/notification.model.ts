export type CanalNotification = 'APP' | 'EMAIL' | 'SMS';
export type StatutEnvoiNotification = 'EN_ATTENTE' | 'ENVOYE' | 'ECHOUE';

/** Reflète exactement NotificationResponse côté backend. */
export interface NotificationModel {
  id: number;
  canal: CanalNotification;
  message: string;
  statutEnvoi: StatutEnvoiNotification;
  dateEnvoi: string;
}
