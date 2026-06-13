---
name: seo-deutschconfort
description: >-
  Génère et optimise les pages web SEO du site Deutschconfort (revêtements muraux
  décoratifs, Le Celestone, moulures, corniches, plinthes, pose/installation,
  prescription architectes). À utiliser dès qu'il faut créer, rédiger ou optimiser
  une page du site, un meta, un texte, une FAQ ou un schema. Applique des règles
  de marque OBLIGATOIRES (pas de prix, pas de mention de production, "Le Celestone",
  CTA WhatsApp). Déclencheurs : "génère une page", "crée une page SEO", "optimise
  cette page", "rédige le contenu de", "page service/pilier/produit".
---

# Skill — Génération de pages SEO Deutschconfort

## Rôle
Produire une page web complète, optimisée SEO, en français (Maroc).
Sortie : le code de la page (selon la techno du repo) + meta title + meta description
+ H1/H2/H3 + corps + FAQ + JSON-LD + alt text + liens internes suggérés.

## GARDE-FOUS NON NÉGOCIABLES (toujours actifs, vérifiés avant de rendre)
- INTERDIT : production, fabrication, usine, atelier, "made in", fabricant,
  "nous fabriquons", "notre production". Deutschconfort PROPOSE / DISTRIBUE / INSTALLE.
- Matériau : toujours « Polymère Celestone™ » ou « Le Celestone ».
  INTERDIT : PU, polyuréthane, mousse, foam, mousse PU.
- AUCUN prix, aucun montant, aucune fourchette. CTA unique de conversion :
  devis via WhatsApp +212 614 474 221.
- Seuls chiffres d'entreprise autorisés : « depuis 1999 » et « 4 800+ clients ».
  Aucun autre chiffre (CA, m², capacité, nombre de modèles, etc.).
- Humidité : NE JAMAIS promettre de supprimer / éliminer / régler l'humidité.
  Angle autorisé = préparation professionnelle du support (inspection, décapage,
  support sain et sec) réalisée par les poseurs experts.
- Classement au feu (EN 13501) : ne le mentionner QUE si l'input fournit
  explicitement « certification = confirmée ».
- Toujours intégrer le wedge : produit exclusif Le Celestone + pose garantie
  + expertise depuis 1999.

## Ton
Haut de gamme, expert, concret, rassurant. Pas de superlatifs creux, pas de remplissage.

## Input attendu
- type_page : pilier | service | produit | local | blog | faq
- mot_cle_cible : ex. « corniche LED éclairage indirect Maroc »
- sujet / modèle : ex. « Big Rock 240 », « service de pose »
- intention : transactionnelle | informationnelle | B2B prescription | locale
- faits_autorisés : liste de faits validés à utiliser (dimensions, finitions, etc.)
Si un champ manque, demander avant de générer.

## Output exigé (dans cet ordre)
1. slug d'URL — sémantique, contient le mot-clé, sans accents ni majuscules
2. meta title — ≤ 60 caractères, mot-clé en tête
3. meta description — ≤ 155 caractères, 1 bénéfice clair
4. H1 — unique, contient le mot-clé
5. Corps — H2/H3 structurés, paragraphes courts, listes, 1 tableau factuel si pertinent
   (jamais de prix), bloc « Pourquoi Deutschconfort » (wedge), CTA WhatsApp
6. FAQ — 3 à 5 Q/R, réponses nettes et autonomes (optimisées AI Overviews)
7. JSON-LD — selon type_page : Product / FAQPage / LocalBusiness / BreadcrumbList,
   + Organization sur toutes les pages
8. alt text — descriptif + mot-clé, pour chaque image attendue
9. liens internes — 3 à 5 suggestions (ancre descriptive + page cible)

## Règles on-page (appliquer systématiquement)
- Mot-clé présent en : title, H1, slug, 1er paragraphe, ≥1 H2, ≥1 alt.
- Un seul H1. Hiérarchie Hn cohérente.
- Profondeur ≥ à la page concurrente classée n°1 sur la requête.
- Phrases courtes, listes, pas de pavés.
- Canonical sur chaque page. Pas de cannibalisation entre pages proches.

## Auto-vérification finale (avant de rendre — bloquant)
- [ ] Aucun mot interdit (production / PU / prix / chiffre non autorisé)
- [ ] CTA WhatsApp +212 614 474 221 présent
- [ ] Mot-clé en title + H1 + slug + 1er paragraphe
- [ ] JSON-LD présent et valide
- [ ] Aucune promesse anti-humidité
- [ ] Wedge présent (exclusivité Celestone + pose garantie + expertise)
Si un point échoue : corriger et re-vérifier avant de rendre.
