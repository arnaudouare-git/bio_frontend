import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    // Page vitrine PUBLIQUE (module ajoute le 2026-09-29, implementation des
    // wireframes -- page 1 "Accueil") : plus de canActivate ici, accessible
    // sans connexion. AccueilComponent adapte son contenu selon que
    // authService.currentUser() existe ou non (voir sa javadoc TS).
    path: '',
    loadComponent: () =>
      import('./features/accueil/accueil.component').then((m) => m.AccueilComponent),
  },
  {
    // Catalogue rendu PUBLIC (module ajoute le 2026-09-29, implementation des
    // wireframes -- page 3 "Catalogue") : consultable sans connexion, seul le
    // passage de commande depuis /panier exige un compte.
    path: 'produits',
    loadComponent: () =>
      import('./features/produits/catalogue/catalogue.component').then((m) => m.CatalogueComponent),
  },
  {
    // Recherche Geolocalisee (module ajoute le 2026-09-29, implementation des
    // wireframes -- page 10) : carte interactive, publique comme le Catalogue.
    path: 'recherche',
    loadComponent: () =>
      import('./features/recherche/recherche.component').then((m) => m.RechercheComponent),
  },
  {
    // Panier (module ajoute le 2026-09-29, implementation des wireframes --
    // page 5 "Panier") : lui aussi public pour la meme raison.
    path: 'panier',
    loadComponent: () =>
      import('./features/panier/panier.component').then((m) => m.PanierComponent),
  },
  {
    // Detail Produit (module ajoute le 2026-09-29, implementation des
    // wireframes -- page 4) : public comme le Catalogue, seuls les favoris
    // exigent un compte (redirection interne vers /connexion, voir
    // ProduitDetailComponent.basculerFavori).
    path: 'produits/:id',
    loadComponent: () =>
      import('./features/produits/detail/produit-detail.component').then(
        (m) => m.ProduitDetailComponent
      ),
  },
  {
    // Profil Utilisateur (module ajoute le 2026-09-29, implementation des
    // wireframes -- page 8) : dashboard sidebar Mon compte/Mes favoris/
    // Adresses (Mes commandes reste un simple lien vers /commandes).
    path: 'profil',
    loadComponent: () =>
      import('./features/profil/profil.component').then((m) => m.ProfilComponent),
    canActivate: [authGuard],
  },
  {
    path: 'commandes',
    loadComponent: () =>
      import('./features/commandes/mes-commandes/mes-commandes.component').then(
        (m) => m.MesCommandesComponent
      ),
    canActivate: [authGuard],
  },
  {
    // Paiement Mobile Money (module ajoute le 2026-09-29, implementation des
    // wireframes -- page 6) : atteinte depuis le Panier juste apres la
    // creation de la commande.
    path: 'commandes/:id/paiement',
    loadComponent: () =>
      import('./features/commandes/paiement/paiement-commande.component').then(
        (m) => m.PaiementCommandeComponent
      ),
    canActivate: [authGuard],
  },
  {
    // Suivi de Commande (module ajoute le 2026-09-29, implementation des
    // wireframes -- page 7) : detail d'UNE commande (stepper 4 etapes +
    // facture), distinct de la liste /commandes.
    path: 'commandes/:id',
    loadComponent: () =>
      import('./features/commandes/suivi/suivi-commande.component').then(
        (m) => m.SuiviCommandeComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'producteur',
    loadComponent: () =>
      import('./features/producteur/tableau-de-bord/tableau-de-bord.component').then(
        (m) => m.TableauDeBordProducteurComponent
      ),
    canActivate: [authGuard, roleGuard(['PRODUCTEUR'])],
  },
  {
    path: 'producteur/produits',
    loadComponent: () =>
      import('./features/producteur/produits/mes-produits.component').then(
        (m) => m.MesProduitsComponent
      ),
    canActivate: [authGuard, roleGuard(['PRODUCTEUR'])],
  },
  {
    path: 'producteur/commandes',
    loadComponent: () =>
      import('./features/producteur/commandes/commandes-recues.component').then(
        (m) => m.CommandesRecuesComponent
      ),
    canActivate: [authGuard, roleGuard(['PRODUCTEUR'])],
  },
  {
    path: 'producteur/serres',
    loadComponent: () =>
      import('./features/producteur/serres/mes-serres.component').then(
        (m) => m.MesSerresComponent
      ),
    canActivate: [authGuard, roleGuard(['PRODUCTEUR'])],
  },
  {
    path: 'producteur/serres/:id',
    loadComponent: () =>
      import('./features/producteur/serres/serre-detail.component').then(
        (m) => m.SerreDetailComponent
      ),
    canActivate: [authGuard, roleGuard(['PRODUCTEUR'])],
  },
  {
    path: 'producteur/avis',
    loadComponent: () =>
      import('./features/producteur/avis/avis-recus.component').then(
        (m) => m.AvisRecusComponent
      ),
    canActivate: [authGuard, roleGuard(['PRODUCTEUR'])],
  },
  {
    path: 'producteur/paiements',
    loadComponent: () =>
      import('./features/producteur/paiements/paiements-recus.component').then(
        (m) => m.PaiementsRecusComponent
      ),
    canActivate: [authGuard, roleGuard(['PRODUCTEUR'])],
  },
  {
    // Connexion Administrateur dediee (module ajoute le 2026-09-29,
    // implementation des wireframes -- page 12) : publique, comme /connexion.
    path: 'admin/connexion',
    loadComponent: () =>
      import('./features/admin/connexion/admin-login.component').then(
        (m) => m.AdminLoginComponent
      ),
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./features/admin/tableau-de-bord/tableau-de-bord-admin.component').then(
        (m) => m.TableauDeBordAdminComponent
      ),
    canActivate: [authGuard, roleGuard(['ADMINISTRATEUR'])],
  },
  {
    path: 'admin/comptes',
    loadComponent: () =>
      import('./features/admin/comptes/comptes.component').then((m) => m.ComptesComponent),
    canActivate: [authGuard, roleGuard(['ADMINISTRATEUR'])],
  },
  {
    path: 'admin/formations',
    loadComponent: () =>
      import('./features/admin/formations/formations.component').then(
        (m) => m.FormationsComponent
      ),
    canActivate: [authGuard, roleGuard(['ADMINISTRATEUR'])],
  },
  {
    path: 'admin/litiges',
    loadComponent: () =>
      import('./features/admin/litiges/litiges.component').then((m) => m.LitigesComponent),
    canActivate: [authGuard, roleGuard(['ADMINISTRATEUR'])],
  },
  {
    path: 'admin/statistiques',
    loadComponent: () =>
      import('./features/admin/statistiques/statistiques.component').then(
        (m) => m.StatistiquesComponent
      ),
    canActivate: [authGuard, roleGuard(['ADMINISTRATEUR'])],
  },
  {
    path: 'connexion',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'inscription',
    loadComponent: () =>
      import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
  },
];
