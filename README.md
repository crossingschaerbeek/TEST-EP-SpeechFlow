# SpeechFlow — première version
Application séparée de ClubPulse. Aucun compte ni infrastructure ClubPulse utilisé.

## Démarrer
Servir ce dossier avec `python3 -m http.server 8080`, puis ouvrir http://localhost:8080. Ne pas ouvrir index.html directement via file:// (modules JS).

## GitHub et Vercel
Créer un dépôt GitHub dédié et y placer ces fichiers. Importer ce dépôt dans Vercel, choisir le preset Other, sans commande de build, output directory `.`. Aucune connexion à vos comptes n'a encore été effectuée.

## Fonctionnalités
Régie, écran public séparé dans le même navigateur, file facultative, nom facultatif, durées personnalisées et presets, pause/reprise, rouge à 10 secondes, gradient pulsant à 5 secondes, dépassement positif, clôture, historique, cumul par personne, export JSON, rapport imprimable (choisir Enregistrer en PDF dans le dialogue d'impression).
Horloge fondée sur des timestamps pour éviter la dérive des intervalles. La pause est exclue du temps utilisé. Une intervention en cours n'entre pas dans le rapport. Le prochain nom apparaît automatiquement mais son chrono attend un démarrage explicite.

## Députés
Importer un tableau JSON [{"name":"Nom complet","group":"PPE","photo":"https://..."}]. Pas de données factices. La photo importée apparaît pendant l’intervention si le nom est affiché. Source cible : annuaire officiel europarl.europa.eu ; extraction complète non réalisée à ce stade.

## Supabase : prochaine étape
schema.sql prépare les tables et les politiques RLS. Exécuter dans un projet Supabase dédié. Le frontend de cette version n'est PAS connecté à Supabase. Ajouter ensuite authentification, CRUD, synchronisation et écran distant via Realtime. Ne jamais placer une clé service_role dans le navigateur. La clé publique seule ne remplace pas l'authentification ni les politiques RLS.

## Limites
Stockage local dans le navigateur ; pas de synchronisation entre appareils, pas d'authentification, pas de sauvegarde serveur. Un seul onglet opérateur à la fois. Nom SpeechFlow provisoire. La fermeture du navigateur n'arrête pas une intervention en cours. Exporter les réunions pour conserver une sauvegarde. PDF via impression native, pas téléchargement automatique.

## Version 1.1
Fond bleu corporate, portrait plus grand sur l'écran public avec groupe politique, compteur libre démarrant à zéro sans limite et sans alerte rouge. Mode choisi avant l'ajout de chaque intervention. Les interventions libres ont une durée attribuée nulle (absence de limite) et aucun dépassement. Le schéma Supabase V1 doit être adapté avant de connecter ce mode : allowed_ms nullable, mode countdown/countup. Depuis l'écran public, bouton ⛶ pour plein écran. Remplacer les fichiers du dépôt à la même adresse pour conserver les données locales.

## Version 1.2
Rapport avec portrait et logo officiel du groupe, sur les interventions et les cumuls. Les 8 logos sont inclus dans assets/groups ; les non-inscrits sont identifiés par leur nom, sans logo de groupe. Les photos sont chargées depuis le Parlement avant ouverture du dialogue d'impression ; en cas d'échec, une note apparaît sur le rapport et les données restent disponibles. Conserver assets/ lors de la mise à jour GitHub.

## Version 1.3 — alertes finales
Orange de 10 secondes à plus de 5 secondes ; rouge dès 5 secondes ; chiffres rouges pulsants dès 3 secondes jusqu'à zéro. Fond bleu constant. Dépassement rouge sans pulsation. Compteur libre sans alerte. L'option système de réduction des animations désactive la pulsation.

## Version 1.4 — démarrage rapide
Préréglage 30 secondes. Démarrer avec une file vide lance directement le chrono avec la durée et le mode choisis, nom facultatif. Sans nom, l'écran affiche simplement Temps de parole ; le rapport indique Sans intervenant. Ajouter à la file exige toujours un nom. Si la file est active et non vide, Démarrer prend son premier intervenant.
