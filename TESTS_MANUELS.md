# Tests manuels de bout en bout — BioConversion

À faire sur votre machine (le pont utilisé par Claude ne peut pas lancer `ng serve` à cause d'un
conflit de binaire natif Linux/Windows — voir le README). Prérequis avant de commencer :

1. Committer les 3 commits backend en attente (voir `claude/Plan_Frontend_Angular_2026-09-25.md`
   dans le projet, section "Récapitulatif des commits backend en attente").
2. Redémarrer `Bio_Backend`.
3. `npm install` puis `ng serve` sur `Bio_Frontend`, ouvrir `http://localhost:4200`.

Cochez au fur et à mesure. Notez tout écart entre le comportement observé et ce qui est décrit ici.

## Parcours Client

- [ ] Inscription d'un nouveau Client (`/inscription`) → connexion automatique.
- [ ] La cloche (haut à droite) affiche une notification "Bienvenue sur BioConversion !".
- [ ] Catalogue (`/produits`) : liste des produits, recherche "près de moi" avec une adresse.
- [ ] Passer une commande avec plusieurs produits (idéalement de producteurs différents, pour
      tester le cas multi-vendeurs plus tard).
- [ ] Historique (`/commandes`) : la commande apparaît avec le bon statut et le bon total.
- [ ] Paiement : simuler Orange Money puis Cash sur deux commandes différentes → statut REUSSI,
      téléchargement de la facture PDF.
- [ ] Laisser un avis sur un producteur après passage d'une ligne à LIVREE (le formulaire ne doit
      apparaître que dans ce cas).
- [ ] Ouvrir un litige sur une commande payée mais non livrée.
- [ ] Se déconnecter puis retenter une connexion avec un mauvais mot de passe → message d'erreur
      clair sous le formulaire (pas seulement un toast).
- [ ] Backend arrêté puis rechargement d'une page de données → un toast rouge
      "Impossible de contacter le serveur..." doit apparaître en bas de l'écran.

## Parcours Producteur

- [ ] Inscription d'un Producteur (avec une référence de pièce d'identité) → la cloche affiche la
      notification de bienvenue mentionnant que le compte doit encore être validé.
- [ ] Un Producteur non encore activé peut se connecter mais ne doit pas pouvoir vendre/publier
      tant que l'admin n'a pas validé son compte.
- [ ] Une fois activé par un admin (voir plus bas) : nouvelle notification "compte activé" dans
      la cloche.
- [ ] Mes produits (`/producteur/produits`) : créer, modifier, supprimer un produit.
- [ ] Commandes reçues (`/producteur/commandes`) : sur une commande multi-vendeurs, seules les
      lignes de ce producteur sont actionnables (les autres apparaissent grisées) ; faire avancer
      une ligne jusqu'à LIVREE, puis tester le refus sur une autre.
- [ ] La cloche affiche une notification "Nouvelle commande #… reçue" après qu'un Client ait
      commandé un de ses produits.
- [ ] Mes serres (`/producteur/serres`) : créer une serre, y installer un capteur, simuler une
      mesure, vérifier une alerte et actionner un actionneur (Activer/Désactiver).
- [ ] Mes avis reçus : la note moyenne se met à jour après le nouvel avis laissé plus haut.
- [ ] Mes paiements reçus : le montant net affiché correspond bien à SA part (au prorata) et pas
      au total payé par le client sur une commande multi-vendeurs.

## Parcours Administrateur

- [ ] Connexion avec `admin@bioconversion.com` / `admin1234`.
- [ ] Comptes (`/admin/comptes`) : filtrer Tous / Producteurs / Clients.
- [ ] Activer un compte Producteur (bouton visible seulement s'il a suivi une formation ET n'est
      pas déjà vérifié).
- [ ] Suspendre un compte → vérifier que ce compte ne peut plus se connecter (message "compte
      suspendu") et qu'il reçoit une notification de suspension. Le réactiver → nouvelle
      notification, reconnexion possible.
- [ ] Formations (`/admin/formations`) : créer une session, inscrire un producteur non encore
      formé, puis vérifier qu'il devient éligible à l'activation.
- [ ] Litiges (`/admin/litiges`) : trancher le litige ouvert plus haut (RESOLU ou REJETE + motif
      de décision obligatoire).
- [ ] Statistiques (`/admin/statistiques`) : les chiffres reflètent les actions faites pendant les
      tests (nombre de commandes, chiffre d'affaires, litiges ouverts, etc.).

## Finitions transverses (Phase 6)

- [ ] Réduire la largeur de la fenêtre (~375px, ou mode mobile des DevTools) sur chaque espace
      (Client / Producteur / Admin) : pas de défilement horizontal, aucun bouton ne passe sous la
      cloche de notifications, les formulaires restent utilisables.
- [ ] La cloche affiche le bon nombre de notifications (badge) et le panneau liste bien les plus
      récentes en premier.
- [ ] Un toast d'erreur ne bloque jamais l'interface (il disparaît seul après quelques secondes et
      peut être fermé avec la croix).

## Limites connues

- Pas de notion de notification "lue / non lue" côté backend : le badge de la cloche affiche le
  nombre total de notifications, pas un compteur de non-lues.
- Les notifications EMAIL/SMS sont uniquement enregistrées en base (aucun envoi réel) — c'est
  voulu, voir le Javadoc de `Notification.java` côté backend.
