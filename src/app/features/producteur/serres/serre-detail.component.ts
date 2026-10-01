import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SerreService } from '../../../core/services/serre.service';
import { CapteurService } from '../../../core/services/capteur.service';
import { ActionneurService } from '../../../core/services/actionneur.service';
import { Serre, SerreDashboard } from '../../../core/models/serre.model';
import { Capteur, Mesure } from '../../../core/models/capteur.model';
import { Actionneur, EtatActionneur } from '../../../core/models/actionneur.model';

interface BrouillonMesure {
  temperature: number | null;
  humidite: number | null;
}

@Component({
  selector: 'app-serre-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './serre-detail.component.html',
})
export class SerreDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private serreService = inject(SerreService);
  private capteurService = inject(CapteurService);
  private actionneurService = inject(ActionneurService);

  serreId!: number;
  serre = signal<Serre | null>(null);
  dashboard = signal<SerreDashboard | null>(null);
  capteurs = signal<Capteur[]>([]);
  actionneurs = signal<Actionneur[]>([]);
  chargement = signal(false);
  erreur = signal<string | null>(null);

  formulaireCapteurOuvert = signal(false);
  nouveauTypeCapteur = '';
  creationCapteurEnCours = signal(false);

  brouillonsMesure: Record<number, BrouillonMesure> = {};
  mesureEnCours = signal<number | null>(null);

  historiqueOuvert = signal<number | null>(null);
  historiqueMesures = signal<Record<number, Mesure[]>>({});
  historiqueChargement = signal<number | null>(null);

  actionneurEnCours = signal<number | null>(null);
  alerteEnCours = signal<number | null>(null);

  ngOnInit(): void {
    this.serreId = Number(this.route.snapshot.paramMap.get('id'));
    this.charger();
  }

  charger(): void {
    this.chargement.set(true);
    this.erreur.set(null);

    this.serreService.obtenir(this.serreId).subscribe({
      next: (serre) => {
        this.serre.set(serre);
        this.chargement.set(false);
      },
      error: () => {
        this.erreur.set('Impossible de charger cette serre.');
        this.chargement.set(false);
      },
    });

    this.chargerDashboard();
    this.chargerCapteurs();
    this.chargerActionneurs();
  }

  private chargerDashboard(): void {
    this.serreService.dashboard(this.serreId).subscribe({
      next: (dashboard) => this.dashboard.set(dashboard),
      error: () => {
        // Pas bloquant.
      },
    });
  }

  private chargerCapteurs(): void {
    this.capteurService.listerParSerre(this.serreId).subscribe({
      next: (capteurs) => this.capteurs.set(capteurs),
      error: () => {
        // Pas bloquant.
      },
    });
  }

  private chargerActionneurs(): void {
    this.actionneurService.listerParSerre(this.serreId).subscribe({
      next: (actionneurs) => this.actionneurs.set(actionneurs),
      error: () => {
        // Pas bloquant.
      },
    });
  }

  // --- Capteurs ---

  ouvrirFormulaireCapteur(): void {
    this.nouveauTypeCapteur = '';
    this.formulaireCapteurOuvert.set(true);
  }

  fermerFormulaireCapteur(): void {
    this.formulaireCapteurOuvert.set(false);
  }

  installerCapteur(): void {
    if (!this.nouveauTypeCapteur.trim()) {
      this.erreur.set('Le type de capteur est obligatoire (ex : TEMPERATURE_HUMIDITE).');
      return;
    }

    this.creationCapteurEnCours.set(true);
    this.erreur.set(null);

    this.capteurService.installer({ serreId: this.serreId, type: this.nouveauTypeCapteur.trim() }).subscribe({
      next: (capteur) => {
        this.creationCapteurEnCours.set(false);
        this.formulaireCapteurOuvert.set(false);
        this.capteurs.update((liste) => [...liste, capteur]);
        this.chargerDashboard();
      },
      error: (err) => {
        this.creationCapteurEnCours.set(false);
        this.erreur.set(err.error?.message ?? "Impossible d'installer ce capteur.");
      },
    });
  }

  // --- Mesures (simulation, comme le ferait le vrai capteur physique) ---

  brouillonMesure(capteurId: number): BrouillonMesure {
    if (!this.brouillonsMesure[capteurId]) {
      this.brouillonsMesure[capteurId] = { temperature: null, humidite: null };
    }
    return this.brouillonsMesure[capteurId];
  }

  simulerMesure(capteur: Capteur): void {
    const brouillon = this.brouillonMesure(capteur.id);
    this.mesureEnCours.set(capteur.id);
    this.erreur.set(null);

    this.capteurService
      .enregistrerMesure({
        capteurId: capteur.id,
        temperature: brouillon.temperature ?? undefined,
        humidite: brouillon.humidite ?? undefined,
      })
      .subscribe({
        next: () => {
          this.mesureEnCours.set(null);
          this.chargerDashboard();
          this.chargerActionneurs();
          // Invalide l'historique en cache pour ce capteur, pour qu'il soit rechargé
          // avec la nouvelle mesure la prochaine fois qu'il est affiché.
          this.historiqueMesures.update((map) => {
            const copie = { ...map };
            delete copie[capteur.id];
            return copie;
          });
        },
        error: (err) => {
          this.mesureEnCours.set(null);
          this.erreur.set(err.error?.message ?? "Impossible d'enregistrer cette mesure.");
        },
      });
  }

  // --- Historique des mesures ---

  toggleHistorique(capteurId: number): void {
    if (this.historiqueOuvert() === capteurId) {
      this.historiqueOuvert.set(null);
      return;
    }

    this.historiqueOuvert.set(capteurId);

    if (!this.historiqueMesures()[capteurId]) {
      this.historiqueChargement.set(capteurId);
      this.capteurService.historiqueMesures(capteurId).subscribe({
        next: (mesures) => {
          this.historiqueChargement.set(null);
          this.historiqueMesures.update((map) => ({ ...map, [capteurId]: mesures }));
        },
        error: () => {
          this.historiqueChargement.set(null);
        },
      });
    }
  }

  // --- Graphiques historique 7 jours (module ajoute le 2026-09-29,
  // implementation des wireframes -- page 13 "Dashboard IoT Serre") ---
  //
  // Reutilise l'historique deja charge par toggleHistorique() (les 50
  // dernieres mesures du capteur, cote backend) plutot que d'ajouter un
  // nouvel endpoint : on filtre ici cote frontend sur les 7 derniers jours.
  // Seuils identiques a ceux de MesureService cote backend (module
  // Alertes automatiques) -- une barre "hors seuil" est coloree en rouge
  // (au lieu du vert habituel) pour repondre au "code couleur de
  // depassement de seuil" demande par le wireframe.
  private readonly SEUIL_TEMPERATURE_BASSE = 25;
  private readonly SEUIL_TEMPERATURE_ELEVEE = 39;
  private readonly SEUIL_HUMIDITE_BASSE = 50;
  private readonly SEUIL_HUMIDITE_ELEVEE = 80;

  mesures7Jours(capteurId: number): Mesure[] {
    const ilYA7Jours = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return (this.historiqueMesures()[capteurId] ?? [])
      .filter((m) => new Date(m.dateMesure).getTime() >= ilYA7Jours)
      .slice()
      .reverse();
  }

  hauteurTemperature(temperature: number | null): number {
    if (temperature === null) {
      return 0;
    }
    // Echelle fixe 0-50°C -> 0-100% (couvre largement la plage du CDC).
    return Math.max(4, Math.min(100, (temperature / 50) * 100));
  }

  hauteurHumidite(humidite: number | null): number {
    if (humidite === null) {
      return 0;
    }
    return Math.max(4, Math.min(100, humidite));
  }

  temperatureHorsSeuil(temperature: number | null): boolean {
    return (
      temperature !== null &&
      (temperature < this.SEUIL_TEMPERATURE_BASSE || temperature > this.SEUIL_TEMPERATURE_ELEVEE)
    );
  }

  humiditeHorsSeuil(humidite: number | null): boolean {
    return (
      humidite !== null && (humidite < this.SEUIL_HUMIDITE_BASSE || humidite > this.SEUIL_HUMIDITE_ELEVEE)
    );
  }

  // --- Alertes ---

  traiterAlerte(alerteId: number): void {
    this.alerteEnCours.set(alerteId);
    this.erreur.set(null);

    this.serreService.traiterAlerte(alerteId).subscribe({
      next: () => {
        this.alerteEnCours.set(null);
        this.chargerDashboard();
      },
      error: (err) => {
        this.alerteEnCours.set(null);
        this.erreur.set(err.error?.message ?? "Impossible de traiter cette alerte.");
      },
    });
  }

  // --- Actionneurs ---

  changerEtatActionneur(actionneur: Actionneur, etat: EtatActionneur): void {
    this.actionneurEnCours.set(actionneur.id);
    this.erreur.set(null);

    this.actionneurService.changerEtat(actionneur.id, { etat }).subscribe({
      next: (miseAJour) => {
        this.actionneurEnCours.set(null);
        this.actionneurs.update((liste) => liste.map((a) => (a.id === actionneur.id ? miseAJour : a)));
      },
      error: (err) => {
        this.actionneurEnCours.set(null);
        this.erreur.set(err.error?.message ?? "Impossible de changer l'état de cet actionneur.");
      },
    });
  }
}
