# Déploiement — deutsch-confort.com

## Hébergement
Le site est un site statique déployé sur **GitHub Pages** depuis la branche `main`
du dépôt `gbenn-maker/deutschconfort-site1`. Le domaine `deutsch-confort.com`
est configuré via le fichier `CNAME` à la racine.

Chaque `git push origin main` déclenche automatiquement la mise en ligne
(1 à 2 minutes).

## Structure
- Pages HTML à la racine (une page = un fichier, header/footer dupliqués).
- `css/site.css` : feuille partagée (charte 2026 — Bodoni Moda + Jost,
  palette Basalte/Chaux/Sable/Oxyde). Les couleurs et typos se changent ici.
- `js/site.js` : menu mobile, lien catalogue, tracking Pixel des clics WhatsApp/tel.
- `images/` : chaque photo existe en `.webp` (max 1600px) et `-800.webp`
  (grilles). Les originaux jpg/png restent dans le dépôt mais ne sont plus
  référencés par les pages.
- `/visualiseur/` : outil de projection (WebGL + API Insta-Pro), design propre.
- `/projet/` : brief guidé « Mon projet Celestone » (API Insta-Pro).
- `brief-*.html` : pages commerciales avec prix, en `noindex`, jamais liées.

## Ajouter une réalisation
1. Prendre la photo dans Dropbox `4 ARCHIVES/REALISATIONS/<Modèle>`.
2. La convertir : `ffmpeg -i photo.jpg -vf "scale='min(1600,iw)':-2" -c:v libwebp -q:v 80 images/realisations/nom-seo.webp`
   et une variante `-800.webp` (scale 800).
3. Ajouter la carte dans `realisations.html` (bloc `.pcell`, avec `data-cat`
   et `data-full`), légende « Le Celestone™ <Modèle> · teinte ».

## Règles de marque (obligatoires)
- Aucun prix public (ni JSON-LD `offers`/`priceRange`). Briefs uniquement.
- « Polymère Celestone™ », jamais PU/polyuréthane/mousse.
- Jamais usine/fabrication/production ; « stock de gros » autorisé.
- Chiffres autorisés : « depuis 1999 » et « +4 800 clients ».
- Un modèle ne vit jamais seul : « Le Celestone™ Big Rock 240 ».
- Pas de corniches. Cubo jamais mis en avant.
- Humidité : « n'absorbe pas l'eau / hydrofuge », jamais « traite/élimine ».
- Meta Pixel 1750427786411371 sur chaque page.
