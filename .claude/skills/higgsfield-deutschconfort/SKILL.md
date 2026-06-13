---
name: higgsfield-deutschconfort
description: >-
  Transforme une demande ("je veux une vidéo/visuel/pub de X") en prompt Higgsfield
  optimisé et 100% on-brand pour Deutschconfort (Le Celestone, revêtements muraux,
  showroom Casablanca). Couvre 3 usages : vidéos réseaux sociaux (Reels/TikTok 9:16),
  visuels produit & showroom (images), pubs Meta/TikTok orientées conversion.
  Choisit le modèle Higgsfield, écrit le prompt positif + negative prompt + réglages
  (ratio, mouvement, durée), et respecte des garde-fous de marque OBLIGATOIRES.
  Si le MCP higgsfield est connecté, peut lancer la génération directement.
  Déclencheurs : "génère une vidéo/image/pub", "prompt Higgsfield", "crée un visuel",
  "reel", "avant/après", "mur TV", "façade".
---

# Skill — Prompts Higgsfield pour Deutschconfort

## Rôle
À partir d'une idée de l'utilisateur, produire un **prompt Higgsfield prêt à coller** (ou à exécuter via le MCP `higgsfield`), on-brand. Sortie systématique :
1. **Usage** (vidéo réseaux / visuel produit / pub) et **modèle Higgsfield** recommandé
2. **Prompt positif** (anglais — Higgsfield prompte mieux en anglais)
3. **Negative prompt**
4. **Réglages** : ratio, durée (vidéo), mouvement caméra, lumière
5. 1–2 **variations** + idée de hook/texte si pertinent (en français pour les overlays)

## GARDE-FOUS DE MARQUE — NON NÉGOCIABLES (visuels ET texte incrusté)
- **Jamais** d'imagerie d'usine / atelier / chaîne de production / fabrication. Deutschconfort = distribution + pose + showroom.
- **Aucun logo ni marque tiers**, aucune autre entité que Deutschconfort.
- **Aucun prix** incrusté à l'écran.
- Matière = **Le Celestone / Polymère Celestone™**. Jamais « polyuréthane/PU/mousse » à l'écran.
- Humidité : on peut **montrer le problème** (peinture qui s'écaille, taches noires sur vieux mur, embruns sur façade) et la **solution Celestone**, mais **aucun texte ne promet de « supprimer/traiter l'humidité »** → formuler « résiste à l'humidité », « n'absorbe pas l'eau », « 100% hydrofuge ».
- Pas de visages reconnaissables si discrétion souhaitée (silhouettes, mains, de dos).
- CTA autorisé : **WhatsApp +212 614 474 221**, **@deutschconfort**, **Showroom Bd d'Anfa, Casablanca**.
- Chiffres autorisés à l'écran : **1999**, **4 800+ clients**. Aucun autre.

## IDENTITÉ VISUELLE (à injecter dans chaque prompt)
- **Mood** : éditorial, premium, chaleureux, méditerranéen. « Maison & Jardin, pas Leroy Merlin ». Élégant, jamais criard.
- **Palette** : lin/cream (#F5F1EA / #F5F2EC), charbon profond (#1A1A1A), terre cuite (#8B5A3C), ocre désertique / sable (#C9A875). **Aucun bleu/vert/violet.**
- **Lumière** : dorée, naturelle, rasante (golden hour méditerranéenne), ombres douces, contraste maîtrisé.
- **Typo overlays** : serif éditoriale (style Cormorant/Fraunces) pour les titres + sans-serif épurée (style Jost/DM Sans) pour le corps. Texte sobre, beaucoup d'air.
- **Décors** : showroom Boulevard d'Anfa (Casablanca), villas contemporaines Anfa, riads, façades bord de mer (Mohammedia, Essaouira), intérieurs chaleureux marocains haut de gamme.
- **Matières** : Le Celestone en relief — effet pierre (relief naturel), effet béton (minéral contemporain/loft), effet bois (chaleur) ; moulures & plinthes blanches prêtes à peindre ; finition mate, haute densité.

## MODÈLES HIGGSFIELD — quel modèle pour quoi
- **Image produit/showroom (photoréaliste)** : `Soul` (défaut), `Seedream`, `Flux`. Édition/retouche : `Nano Banana`.
- **Vidéo** : `Veo` (réalisme + cohérence), `Kling` (mouvement fluide, morph avant/après), `Minimax Hailuo` (rapide, social), `Cinema Studio` / `DOP` (contrôles caméra cinéma : travelling, reveal façade).
- **Méthode recommandée** : générer d'abord une **image Soul** forte, puis **image→vidéo** (Kling/Hailuo/Veo) pour garder le contrôle de la compo et de la marque.

## STRUCTURE D'UN PROMPT (image)
`[sujet/scène précise] , [décor Deutschconfort] , [matière Celestone + effet] , [lumière dorée méditerranéenne] , [objectif/cadrage : ex. 35mm, eye-level, shallow depth] , [style : editorial, premium interior photography, warm Mediterranean] , [palette lin/charbon/terre cuite] , high detail, photoreal --ar [ratio]`
**Negative** : `factory, industrial, production line, logos, brand names, text, price tags, watermark, blue/green/purple tones, oversaturated, low quality, distorted, extra fingers`

## STRUCTURE D'UN PROMPT (vidéo)
Ajouter à l'image : `[mouvement caméra : slow push-in / lateral tracking / crane reveal] , [action : ex. light sweeping across the stone wall] , [durée ~5-8s] , cinematic, smooth motion`. Ratio **9:16** pour social.

## RECETTES PAR USAGE

### A. Vidéo réseaux sociaux (Reels/TikTok 9:16, 5–10s)
Formats qui convertissent (étude marketing) :
- **Avant/Après** : plan fixe même angle ; vieux mur abîmé (peinture écaillée / taches) → reveal mur Celestone effet pierre, lumière dorée. Kling morph ou cut net.
- **POV problème→solution** : main qui gratte une peinture qui s'effrite → transition → main qui passe sur le Celestone lisse et mat.
- **ASMR pose** : macro d'un panneau qu'on encolle (cordons) et qu'on pose, mastic, règle de nivelage. Son satisfaisant implicite.
- **Façade reveal** : crane/drone reveal d'une façade ou d'un mur de jardin habillé en Celestone, bord de mer.
- **Mur TV** : push-in lent sur un mur TV effet pierre/bois rétroéclairé, salon premium.
Hook visuel fort dans la 1ʳᵉ seconde. Overlay texte court (FR), serif élégante.

### B. Visuels produit & showroom (images)
- Mur Celestone en situation (salon, hall, mur TV, façade), lumière dorée rasante qui révèle le relief.
- Macro matière (texture pierre/béton/bois, finition mate).
- Ambiance showroom Anfa : matières en présentation, échantillons en main.
- Ratios : `4:5` (feed), `1:1`, `9:16` (story). Photoréaliste, editorial.

### C. Pubs Meta/TikTok (conversion)
Structure (étude marketing) : **HOOK (1-3s) → AGITATION (douleur) → SOLUTION (Celestone) → CTA WhatsApp**.
- Douleurs visuelles autorisées : humidité/taches noires, peinture qui s'écaille, sel marin sur façade, fissures.
- Solution : reveal Celestone (résiste, n'absorbe pas l'eau, prêt à peindre).
- CTA fin : « Devis sur WhatsApp · +212 614 474 221 » + @deutschconfort, sobre et premium.
- Overlay : titres serif, mots-clés mis en valeur (sobrement, pas le jaune criard TikTok par défaut — rester premium). Jamais de prix.

## SI LE MCP `higgsfield` EST CONNECTÉ
Après avoir rédigé le prompt et l'avoir fait valider par l'utilisateur, proposer de **lancer la génération** via les outils MCP higgsfield (text-to-image / image-to-video / Soul). Toujours montrer le prompt AVANT de générer. Une génération = une validation.

## AUTO-VÉRIFICATION avant de rendre
- [ ] Zéro usine/fabrication/marque tierce dans le visuel ou le texte
- [ ] Zéro prix à l'écran
- [ ] Matière = Celestone (jamais PU)
- [ ] Aucune promesse « supprime l'humidité » dans le texte
- [ ] Palette respectée (pas de bleu/vert/violet)
- [ ] CTA WhatsApp +212 614 474 221 si pub
- [ ] Ratio adapté (9:16 social, 4:5/1:1 feed)
- [ ] Negative prompt inclus

---

## BIBLIOTHÈQUE CRÉATIVE (source : étude marketing — `Downloads/etude_marketing_avancee_revetements_muraux.md`)

> S'appuyer sur cette bibliothèque pour TOUTE génération vidéo/pub. Les formats, hooks et structures viennent de l'étude ; ils sont **réconciliés avec les garde-fous de marque** (voir section RÉCONCILIATION en bas).

### Les 7 formats (mix conseillé)
1. **Avant/Après brut** (30-40%) — reach + conversion max
2. **POV problème → solution** (20%) — convertit le mieux
3. **Process / ASMR pose** (15%) — reach
4. **Storytelling client** (10%) — preuve sociale
5. **Hot take expert** (10%) — autorité
6. **Comparatif produit** (5%) — décision finale
7. **Lifestyle aspirationnel** (10%) — branding

### Hooks orientés problème (douleur — les plus puissants pour la pub)
- « L'humidité revient ? La peinture ne réglera RIEN. »
- « Ces taches noires reviennent chaque hiver. Voici pourquoi. »
- « Tu repeins tous les 2 ans ? » *(sans montant à l'écran)*
- « Sel marin = mort lente de ta façade. Solution. »
- « Fissures sur la façade ? Ne fais SURTOUT pas ça. »
- « Ta peinture s'écaille ? Le problème n'est pas la peinture. »
- « Bord de mer + façade traditionnelle = catastrophe annoncée. »
- « Ce que l'humidité fait à ton mur en 3 ans. »

### Hooks aspirationnels (prestige — pour lifestyle/branding)
- « La finition qu'on voit dans les villas de Casa Anfa. »
- « Effet pierre naturelle. Personne ne voit la différence. »
- « Quand l'architecte dit : on met du Celestone, point. »
- « Le secret derrière les murs des plus belles maisons d'hôtes du Maroc. »

### 3 scripts pub (templates, adaptés marque)
**SCRIPT « Le test à l'eau » (15s) — ⭐ le plus on-brand :**
0-2s gros plan main + seau d'eau → 2-4s l'eau glisse sur le panneau (ne s'imprègne pas) → 4-7s split screen peinture qui boit l'eau / Celestone qui la repousse → 7-10s macro texture pierre intacte (« résiste à l'eau, à l'humidité, au sel marin ») → 10-13s villa bord de mer façade Celestone, drone latéral (« conçu pour le climat marocain ») → 13-15s CTA WhatsApp.

**SCRIPT « Avant/Après client » (30s) :** client de dos/silhouette devant son mur → photo avant (insert coin) vs après plein écran → macro texture intacte → « 3 ans après, zéro retouche » *(témoignage, PAS « 25 ans de garantie »)* → CTA « DM 'PROJET' — réponse en 24h ».

**SCRIPT « Le vrai coût » (20s) — angle économique SANS prix à l'écran :** façade abîmée → « combien de fois tu as repeint en 10 ans ? » → peinture qui s'écaille au doigt → reveal mur Celestone golden hour → « posé, livré, installé. Une seule fois. » → CTA.

### Bibliothèque de CTA (WhatsApp +212 614 474 221 / @deutschconfort)
- « Écris 'DEVIS' — réponse en 24h, posé livré installé. »
- « Catalogue PDF — écris 'CATALOGUE'. »
- « Architecte ? Décorateur ? Écris 'PRO'. »
- « MRE ? On gère ton projet pendant que tu es à l'étranger. Écris 'MRE'. »
- « Diagnostic façade — écris 'EXPERT'. »
- « Passe toucher la matière au showroom Anfa. » *(showroom, pas domicile)*
- Mots déclencheurs : **GRATUIT, SANS ENGAGEMENT, 24H/48H, POSÉ-LIVRÉ-INSTALLÉ, AU SHOWROOM.**
- À bannir : « Achetez », « Cliquez ici », « En savoir plus », « Découvrez ».

### Angles Maroc + climat (pour décors & ciblage)
- Littoral (humidité saline) : Casablanca/Anfa, Mohammedia, El Jadida, Essaouira, Tanger, Agadir → angle sel marin/façade.
- Écart thermique : Marrakech, Fès, Meknès → fissures peinture.
- Pluies : Rabat, Kénitra. Froid/gel : Ifrane/Atlas.
- Segments : villas Anfa, riads/maisons d'hôtes, hôtels (contract), MRE, prescripteurs.

---

## RÉCONCILIATION MARQUE (par défaut — prévaut sur l'étude)
L'étude marketing (avril 2026) contient des éléments qui **contredisent les garde-fous**. Par défaut, appliquer la marque :
- **Prix à l'écran : NON.** Garder l'angle économique en mots (« arrête de repeindre tous les 2 ans », « une seule fois »), sans montant DH.
- **Échantillons/diagnostic : au SHOWROOM Anfa**, pas « chez toi / on vient à toi » (logistique actée : pas d'envoi ni visite domicile).
- **Pas de « 25 ans de garantie »** ni durée chiffrée non validée → utiliser le témoignage « 3 ans après, zéro retouche ».
- Seuls chiffres à l'écran : **1999**, **4 800+ clients**.

> ⚠️ À CONFIRMER (CEO) si un jour il veut assouplir : (a) afficher des prix/économies chiffrées dans les pubs, (b) proposer échantillon/diagnostic à domicile. Tant que non confirmé → version marque ci-dessus.
