# BioConversion — Frontend (Angular)

Application web du projet **BioConversion** (Licence 3 RIT, Groupe 1 Soir) : mise en relation de
producteurs de larves (protéines alternatives) avec des clients, avec suivi de serres connectées
(IoT), paiements, avis, litiges et administration de la plateforme.

Ce dépôt (`Bio_Frontend`) contient le frontend Angular. Le backend Spring Boot correspondant vit
dans le dépôt `Bio_Backend` (voir [Backend](#backend)).

## Prérequis

- Node.js 20+ et npm.
- Le backend `Bio_Backend` démarré et accessible sur `http://localhost:8080` (voir sa propre
  documentation pour le lancer). Sans lui, l'application affiche une notification d'erreur
  ("Impossible de contacter le serveur") sur chaque page qui charge des données.

## Installation

```bash
npm install
```

## Lancer en développement

```bash
ng serve
```

Puis ouvrir `http://localhost:4200`. L'application recharge automatiquement à chaque modification
des fichiers sources.

## Variables d'environnement

L'URL de l'API backend est définie dans `src/environments/` :

| Fichier | Utilisé pour | Valeur |
|---|---|---|
| `environment.development.ts` | `ng serve` (dev) | `apiUrl: 'http://localhost:8080/api'` |
| `environment.ts` | `ng build` (prod) | `apiUrl: 'http://localhost:8080/api'` |

Pour pointer vers un backend déployé ailleurs, modifier la valeur `apiUrl` du fichier
correspondant.

## Comptes pour tester

- **Client** / **Producteur** : à créer via la page d'inscription (`/inscription`). Un compte
  Producteur doit ensuite être validé par un administrateur (formation suivie + pièce d'identité
  vérifiée) avant de pouvoir vendre — voir `AdminService.activerCompte` côté backend.
- **Administrateur** : compte de développement créé automatiquement au premier démarrage du
  backend (`AdministrateurSeeder`) :
  - Email : `admin@bioconversion.com`
  - Mot de passe : `admin1234`

  ⚠️ Ce compte est explicitement marqué "dev only" dans le code backend (identifiants en clair) —
  à ne jamais utiliser tel quel en production.

## Structure du projet

```
src/app/
  core/
    models/         # Interfaces TypeScript alignées sur les DTO backend
    services/        # Appels HTTP vers l'API (un service par ressource)
    guards/           # authGuard, roleGuard(['ROLE', ...])
    interceptors/     # authInterceptor (JWT), errorInterceptor (erreurs API centralisées)
  shared/
    components/       # Composants réutilisables (toasts, cloche de notifications)
  features/
    auth/             # Connexion / inscription
    accueil/           # Page d'accueil (liens selon le rôle)
    produits/           # Catalogue (Client)
    commandes/          # Historique de commandes, paiement, avis, litiges (Client)
    producteur/         # Espace Producteur (produits, commandes reçues, serres/IoT, avis, paiements)
    admin/               # Espace Administrateur (comptes, formations, litiges, statistiques)
```

Chaque espace (`producteur/`, `admin/`) est protégé par `roleGuard([...])` dans `app.routes.ts` et
n'est accessible qu'au rôle concerné.

## Fonctionnement général

- **Authentification** : JWT stateless, stocké dans le `localStorage` et rejoué automatiquement par
  `authInterceptor` sur chaque requête. Une réponse `401` déconnecte l'utilisateur.
- **Erreurs API** : `errorInterceptor` affiche automatiquement un message lisible (toast en bas de
  l'écran) pour toute erreur backend non gérée localement par un composant, en réutilisant le
  message renvoyé par l'API quand il existe.
- **Notifications** : la cloche visible en haut à droite (une fois connecté) liste les
  notifications internes de l'utilisateur (bienvenue, activation/suspension de compte, nouvelle
  commande reçue pour un Producteur, etc.), consultées via `GET /api/notifications/utilisateur/{id}`.

## Tests

```bash
ng test
```

Un plan de tests manuels de bout en bout (parcours Client / Producteur / Administrateur) est
disponible dans le document de conception du projet (`TESTS_MANUELS.md` à la racine de ce dépôt) —
recommandé avant chaque démonstration.

## Backend

Dépôt `Bio_Backend` (Spring Boot 3 / Java 17 / Spring Security JWT / PostgreSQL ou H2 selon profil).
Voir sa documentation pour le lancement, les migrations et les identifiants de développement.
