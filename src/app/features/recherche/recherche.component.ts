import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProduitService } from '../../core/services/produit.service';
import { Produit } from '../../core/models/produit.model';

declare const L: any;

interface ProducteurGroupe {
  producteurId: number;
  producteurNom: string;
  latitude: number;
  longitude: number;
  distanceKm: number | null;
  produits: Produit[];
}

// Centre par defaut : Ouagadougou (aucune recherche n'a encore ete lancee,
// ou la geolocalisation navigateur a ete refusee/indisponible).
const CENTRE_DEFAUT: [number, number] = [12.3714, -1.5197];

/**
 * Recherche Geolocalisee (module ajoute le 2026-09-29, implementation des
 * wireframes -- page 10). Carte interactive via Leaflet/OpenStreetMap,
 * charge en CDN (voir index.html) plutot qu'en dependance npm -- ng build
 * est casse dans cet environnement (probleme de binaire natif
 * lightningcss, sans rapport avec ce code), impossible d'y verifier
 * l'integration d'une nouvelle dependance.
 *
 * Reutilise ProduitService.rechercherProximite() (deja existant depuis le
 * module Marketplace geolocalise) qui renvoie des PRODUITS, pas des
 * producteurs -- ils sont donc regroupes cote frontend par producteurId
 * (voir producteursGroupes) pour n'afficher qu'UN SEUL pin par producteur,
 * avec la liste de ses produits en popup. Necessite latitude/longitude sur
 * ProduitResponse (ajoutes cote backend le 2026-09-29 specifiquement pour
 * cette page -- jusque-la seul distanceKm etait renvoye).
 */
@Component({
  selector: 'app-recherche',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './recherche.component.html',
})
export class RechercheComponent implements AfterViewInit, OnDestroy {
  private produitService = inject(ProduitService);

  @ViewChild('carte') carteRef!: ElementRef<HTMLDivElement>;
  private carte: any = null;
  private marqueurs: any[] = [];

  latitude: number | null = null;
  longitude: number | null = null;
  rayonKm = 50;
  stockMin = 0;

  chargement = signal(false);
  erreur = signal<string | null>(null);
  rechercheLancee = signal(false);
  geolocalisationEnCours = signal(false);
  produits = signal<Produit[]>([]);

  producteursGroupes = computed<ProducteurGroupe[]>(() => {
    const groupes = new Map<number, ProducteurGroupe>();
    for (const produit of this.produits()) {
      if (produit.stock < this.stockMin) {
        continue;
      }
      if (produit.latitude == null || produit.longitude == null) {
        continue;
      }
      let groupe = groupes.get(produit.producteurId);
      if (!groupe) {
        groupe = {
          producteurId: produit.producteurId,
          producteurNom: produit.producteurNom,
          latitude: produit.latitude,
          longitude: produit.longitude,
          distanceKm: produit.distanceKm,
          produits: [],
        };
        groupes.set(produit.producteurId, groupe);
      }
      groupe.produits.push(produit);
      if (
        produit.distanceKm != null &&
        (groupe.distanceKm == null || produit.distanceKm < groupe.distanceKm)
      ) {
        groupe.distanceKm = produit.distanceKm;
      }
    }
    return Array.from(groupes.values()).sort(
      (a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity)
    );
  });

  ngAfterViewInit(): void {
    // Leaflet est charge en CDN (voir index.html) -- s'il n'a pas eu le
    // temps de se charger (connexion lente), on abandonne la carte
    // silencieusement : la liste des producteurs reste utilisable seule.
    if (typeof L === 'undefined') {
      return;
    }
    this.carte = L.map(this.carteRef.nativeElement).setView(CENTRE_DEFAUT, 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; contributeurs OpenStreetMap',
      maxZoom: 19,
    }).addTo(this.carte);

    this.tenterGeolocalisation();
  }

  ngOnDestroy(): void {
    this.carte?.remove();
  }

  tenterGeolocalisation(): void {
    if (!navigator.geolocation) {
      return;
    }
    this.geolocalisationEnCours.set(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.latitude = Math.round(position.coords.latitude * 10000) / 10000;
        this.longitude = Math.round(position.coords.longitude * 10000) / 10000;
        this.geolocalisationEnCours.set(false);
        this.carte?.setView([this.latitude, this.longitude], 12);
        this.rechercher();
      },
      () => {
        // Refuse ou indisponible : l'utilisateur peut saisir manuellement
        // sa position (champs latitude/longitude du formulaire).
        this.geolocalisationEnCours.set(false);
      },
      { timeout: 8000 }
    );
  }

  rechercher(): void {
    if (this.latitude == null || this.longitude == null) {
      this.erreur.set('Indique ta position (latitude/longitude) ou autorise la géolocalisation.');
      return;
    }
    this.chargement.set(true);
    this.erreur.set(null);
    this.rechercheLancee.set(true);

    this.produitService.rechercherProximite(this.latitude, this.longitude, this.rayonKm).subscribe({
      next: (produits) => {
        this.produits.set(produits);
        this.chargement.set(false);
        this.dessinerMarqueurs();
      },
      error: () => {
        this.chargement.set(false);
        this.erreur.set('Impossible de charger les producteurs à proximité.');
      },
    });
  }

  private dessinerMarqueurs(): void {
    if (!this.carte) {
      return;
    }
    for (const marqueur of this.marqueurs) {
      this.carte.removeLayer(marqueur);
    }
    this.marqueurs = [];

    for (const groupe of this.producteursGroupes()) {
      const popup = document.createElement('div');
      popup.className = 'text-sm';

      const titre = document.createElement('p');
      titre.className = 'font-semibold text-gray-900 mb-1';
      titre.textContent = groupe.producteurNom;
      popup.appendChild(titre);

      if (groupe.distanceKm != null) {
        const distance = document.createElement('p');
        distance.className = 'text-xs text-gray-500 mb-2';
        distance.textContent = `${groupe.distanceKm} km`;
        popup.appendChild(distance);
      }

      const liste = document.createElement('ul');
      liste.className = 'space-y-1';
      for (const produit of groupe.produits) {
        const item = document.createElement('li');
        const lien = document.createElement('a');
        lien.href = `/produits/${produit.id}`;
        lien.className = 'text-bordeaux-600 hover:underline';
        lien.textContent = `${produit.nom} — ${produit.prixUnitaire} FCFA`;
        item.appendChild(lien);
        liste.appendChild(item);
      }
      popup.appendChild(liste);

      const marqueur = L.marker([groupe.latitude, groupe.longitude]).addTo(this.carte).bindPopup(popup);
      this.marqueurs.push(marqueur);
    }

    if (this.marqueurs.length > 0) {
      const groupe = L.featureGroup(this.marqueurs);
      this.carte.fitBounds(groupe.getBounds().pad(0.2));
    }
  }

  centrerSur(groupe: ProducteurGroupe): void {
    this.carte?.setView([groupe.latitude, groupe.longitude], 14);
  }
}
