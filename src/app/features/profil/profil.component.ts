import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { FavoriService } from '../../core/services/favori.service';
import { AdresseService } from '../../core/services/adresse.service';
import { FavoriResponse } from '../../core/models/favori.model';
import { AdresseResponse, CreerAdresseRequest } from '../../core/models/adresse.model';
import { environment } from '../../../environments/environment';

type Section = 'compte' | 'favoris' | 'adresses';

/**
 * Page Profil Utilisateur (ajoutee le 2026-09-29, implementation des
 * wireframes -- page 8). Dashboard sidebar : Mon compte (lecture seule --
 * pas d'endpoint de modification de profil cote backend actuellement),
 * Mes commandes (simple lien vers /commandes, qui reste la page complete),
 * Mes favoris (module Favoris, Phase B, jamais consomme cote UI avant
 * cette page et la page Detail Produit de la Phase E), Adresses
 * enregistrees (module Adresses, Phase B, CRUD complet -- premiere
 * consommation cote frontend).
 */
@Component({
  selector: 'app-profil',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profil.component.html',
})
export class ProfilComponent implements OnInit {
  authService = inject(AuthService);
  private favoriService = inject(FavoriService);
  private adresseService = inject(AdresseService);

  serverUrl = environment.serverUrl;
  section = signal<Section>('compte');

  favoris = signal<FavoriResponse[]>([]);
  chargementFavoris = signal(false);
  erreurFavoris = signal<string | null>(null);

  adresses = signal<AdresseResponse[]>([]);
  chargementAdresses = signal(false);
  erreurAdresses = signal<string | null>(null);
  formulaireOuvert = signal(false);
  brouillon: CreerAdresseRequest = { libelle: '', texte: '', principale: false };
  adresseEnEdition = signal<number | null>(null);
  suppressionEnCours = signal<number | null>(null);

  ngOnInit(): void {
    this.chargerFavoris();
    this.chargerAdresses();
  }

  changerSection(section: Section): void {
    this.section.set(section);
  }

  private idUtilisateur(): number | null {
    return this.authService.currentUser()?.id ?? null;
  }

  // --- Favoris ---

  chargerFavoris(): void {
    const id = this.idUtilisateur();
    if (!id) {
      return;
    }
    this.chargementFavoris.set(true);
    this.favoriService.listerUtilisateur(id).subscribe({
      next: (favoris) => {
        this.favoris.set(favoris);
        this.chargementFavoris.set(false);
      },
      error: () => {
        this.erreurFavoris.set('Impossible de charger tes favoris.');
        this.chargementFavoris.set(false);
      },
    });
  }

  retirerFavori(produitId: number): void {
    this.favoriService.retirer(produitId).subscribe({
      next: () => this.favoris.update((liste) => liste.filter((f) => f.produit.id !== produitId)),
      error: () => this.erreurFavoris.set('Impossible de retirer ce favori.'),
    });
  }

  // --- Adresses ---

  chargerAdresses(): void {
    const id = this.idUtilisateur();
    if (!id) {
      return;
    }
    this.chargementAdresses.set(true);
    this.adresseService.listerUtilisateur(id).subscribe({
      next: (adresses) => {
        this.adresses.set(adresses);
        this.chargementAdresses.set(false);
      },
      error: () => {
        this.erreurAdresses.set('Impossible de charger tes adresses.');
        this.chargementAdresses.set(false);
      },
    });
  }

  ouvrirFormulaireAjout(): void {
    this.brouillon = { libelle: '', texte: '', principale: this.adresses().length === 0 };
    this.adresseEnEdition.set(null);
    this.formulaireOuvert.set(true);
  }

  ouvrirFormulaireEdition(adresse: AdresseResponse): void {
    this.brouillon = { libelle: adresse.libelle, texte: adresse.texte, principale: !!adresse.principale };
    this.adresseEnEdition.set(adresse.id);
    this.formulaireOuvert.set(true);
  }

  fermerFormulaire(): void {
    this.formulaireOuvert.set(false);
  }

  enregistrerAdresse(): void {
    if (!this.brouillon.libelle?.trim() || !this.brouillon.texte?.trim()) {
      this.erreurAdresses.set('Le libelle et le texte sont obligatoires.');
      return;
    }
    this.erreurAdresses.set(null);
    const enEdition = this.adresseEnEdition();
    const requete = enEdition
      ? this.adresseService.modifier(enEdition, this.brouillon)
      : this.adresseService.ajouter(this.brouillon);

    requete.subscribe({
      next: () => {
        this.formulaireOuvert.set(false);
        this.chargerAdresses();
      },
      error: (err) => {
        this.erreurAdresses.set(err.error?.message ?? "Impossible d'enregistrer cette adresse.");
      },
    });
  }

  supprimerAdresse(adresse: AdresseResponse): void {
    this.suppressionEnCours.set(adresse.id);
    this.adresseService.supprimer(adresse.id).subscribe({
      next: () => {
        this.suppressionEnCours.set(null);
        this.chargerAdresses();
      },
      error: () => {
        this.suppressionEnCours.set(null);
        this.erreurAdresses.set('Impossible de supprimer cette adresse.');
      },
    });
  }
}
