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
- `/projet/` : configurateur de projet en 4 étapes (Projet · Espace · Style · Coordonnées), même charte
  que le site (`css/site.css`), API Insta-Pro `/api/public/web-projects` inchangée (dossier, photos, WhatsApp).
  Paramètres d'URL : `?src=W-XXX` (page d'origine), `?type=facade|jardin|interieur|commerce` (usage présélectionné),
  `?modele=big-rock|mattoni|cubo|cemento|beton-brut|beton-decoffrage|moon|bois-cubo|travertin|brick` (modèle retenu),
  `?mesure=1` (prise de mesures présélectionnée), `?produit=<nom>` (produit retenu, ex. parquet), `?new=1` (nouveau projet), `?d=<token>` (reprise d'un dossier).
  Un projet commencé ou envoyé depuis moins de 24 h est réaffiché tel quel sur le même appareil (aucune coordonnée
  n'est gardée dans le navigateur). Événements : Meta Pixel `Lead` + `Contact`, GA4 `projet_etape` (1–5),
  `dossier_projet`, `clic_whatsapp`, `clic_tel`, `clic_itineraire`.
  Envoi (décision de Ghali du 05/10/2026) : le bouton « Envoyer ma demande » envoie le dossier dans Insta-Pro
  (PATCH `completed` ; demande pro → B2B Accounts → Demandes) ; l'écran final ne s'affiche qu'après confirmation
  d'Insta-Pro et ne propose que trois boutons : « Écrire sur WhatsApp » (wa.me sans message pré-rédigé),
  « Appeler » (tel:) et « Itinéraire du showroom » (Google Maps). Plus aucun message WhatsApp pré-rédigé sur /projet/.
- `/devis.html` : redirection vers `/projet/?src=W-DEV` (hors sitemap) depuis le 30/09/2026.
- `brief-*.html` : pages commerciales avec prix, en `noindex`, jamais liées. `brief-architecte.html` et `brief-promoteurs-construction.html` ont été supprimées le 02/10/2026 (demande de Ghali, nouvelle grille au kilo) : il ne reste que `brief-celestone.html`.

## Ajouter une réalisation
1. Prendre la photo dans Dropbox `4 ARCHIVES/REALISATIONS/<Modèle>`.
2. La convertir : `ffmpeg -i photo.jpg -vf "scale='min(1600,iw)':-2" -c:v libwebp -q:v 80 images/realisations/nom-seo.webp`
   et une variante `-800.webp` (scale 800).
3. Ajouter la carte dans `realisations.html` (bloc `.pcell`, avec `data-cat`
   et `data-full`), légende « <Modèle> · teinte · surface » (ex. « Big Rock · greige · 15 m² »).

## Règles de marque (obligatoires)
- Aucun prix public (ni JSON-LD `offers`/`priceRange`). Briefs uniquement.
- « Polymère Celestone™ », jamais PU/polyuréthane/mousse.
- Jamais usine/fabrication/production ; « stock de gros » autorisé.
- Chiffres autorisés : « depuis 1999 » et « +4 800 clients ».
- Modèles : le nom du design seul (« Big Rock », « Mattoni »), sans « Le Celestone™ » devant (décision du 29/09/2026).
- Pas de corniches. Cubo peut rester en vedette ; Moon n'est pas ajouté aux vedettes de l'accueil (29/09/2026).
- Humidité : « n'absorbe pas l'eau / hydrofuge », jamais « traite/élimine ».
- « Sur mesure » : interdit, sauf sur la page plinthes (« hauteur personnalisable sur demande »), validé par Ghali le 29/09/2026.
- « Résiste au sel marin » : laissé sur les pages où il figure (Ghali, 29/09/2026) ; pas ajouté ailleurs.
- Supports de pose : toute surface plane, en règle générale ; déjà posé sur bois, marbre, BA13, et enduit selon l'épaisseur du modèle (Ghali, 29/09/2026).
- Meta Pixel 1750427786411371 sur chaque page (sauf les pages de redirection).
- Balise Pinterest `p:domain_verify` dans le `<head>` de `index.html` (revendication du domaine, 01/10/2026) : ne pas la retirer.
- Petits libellés (sur-titres, fil d'Ariane, étiquettes, en-têtes de tableau) : Encre sur fond clair, jamais Taupe (charte §5 : 3,7:1). Taupe seulement ≥ 24 px.
- Pages comparatives (pierre de Taza, carrelage/zellige, bardage) : faits externes sourcés en bas de tableau, aucun concurrent ni enseigne nommés, aucun prix ; on dit honnêtement où l'autre matériau reste le meilleur choix (sols, douche, bassin) (décision de Ghali du 30/09/2026 : capter les recherches de substituts).
- Chaque lien WhatsApp finit par « Réf W-XXX » et chaque lien vers /projet/ porte ?src=W-XXX (code de la page, voir CODES_WHATSAPP_SITE.md). Exception : le bouton WhatsApp de l'écran final de /projet/ (sans message, la demande est déjà dans Insta-Pro).
- Conversion (décision de Ghali du 30/09/2026) : toute demande de devis / d'estimation passe par `/projet/` —
  les boutons « Demander un devis », « Estimer mon projet », « Devis », les anciens CTA WhatsApp « devis / simulation
  photo / envoyer ma photo » pointent vers `projet/?src=W-XXX` (+ `type=` sur les pages façade, jardin, intérieur ;
  + `modele=` sur les fiches modèles ; + `mesure=1` sur « Réserver une visite et un métré » ; + `produit=` sur les
  cartes produit sols / parquets et « Demander ce modèle » de la page Modèles). Depuis le 01/10/2026, cela vaut
  aussi pour les pages sols / parquets, le guide (« Être conseillé ») et la FAQ (« Parler de mon projet »).
  Seuls restent en WhatsApp direct : les liens libellés « WhatsApp » (barre du haut, pied de page, barre mobile,
  menu mobile, page contact), « Réserver un passage », « Une question sur la pose ? », « Demandez-les-nous »
  (photos), le formulaire de la page Contact, et les briefs commerciaux B2B (`brief-*.html`).
