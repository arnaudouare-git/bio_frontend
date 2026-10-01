export const environment = {
  production: true,
  apiUrl: 'http://localhost:8080/api',
  // Base du backend SANS /api -- pour construire les URLs de fichiers statiques
  // (photos produit, module ajoute le 2026-09-29, servies sous /uploads/**).
  serverUrl: 'http://localhost:8080'
};
