# SEO — Récapitulatif complet (deutsch-confort.com)

> Journal de tout ce qui a été fait pour le SEO. Dernière session : **2026-06-13**.
> À lire pour reprendre le chantier. Le skill de génération est dans `.claude/skills/seo-deutschconfort/SKILL.md`.

---

## 1. Contexte technique

- **Site** : HTML statique pur (pas de framework/build), pages `.html` à la racine.
- **Repo** : `gbenn-maker/deutschconfort-site1` (local : `C:\Users\User\Downloads\deutschsite (1)\deutschconfort-site`).
- **Déploiement** : **GitHub Pages** (fichier `CNAME` = `deutsch-confort.com`). ⚠️ PAS Netlify, malgré `DEPLOIEMENT.md`. `push` sur `main` → live en ~20-90 s.
- **CSS** : unique `css/site.css`. Polices Cormorant Garamond + Jost. Tokens : `--ink #1C1C1A`, `--paper #F5F2EC`, `--sand`, `--taupe`, `--serif`, `--sans`.
- **Quirks env** : l'outil Read de Claude Code échoue (EPERM) sur `Downloads` → lire via `cat`, éditer via `node`/`perl` (Edit exige un Read préalable, impossible ici ; pour réécrire un fichier existant : `rm` puis `Write`). **Python non installé** (stub Store) ; **node v20 dispo**.

## 2. Méthode / workflow

Boucle par page (guide `Downloads/guide_pas_a_pas_seo_claude_code.md`) :
analyse concurrent → génération via skill → audit garde-fous → revue → push → demande d'indexation Search Console.
**Génération en masse** : via Workflow multi-agents (1 agent/page renvoie le `html`, écrit ensuite par le main loop avec node). Pattern réutilisable pour les prochains lots.

## 3. Décisions actées (CEO)

- **URLs `.html` plat** (pas de dossiers `/slug/`, pas de réécriture Netlify).
- **Anti-humidité = ciblage franc** : cibler agressivement « revêtement/mur anti-humidité, façade, sel marin », angle **résistance** (« n'absorbe pas l'eau », « 100 % hydrofuge », résiste intempéries) + préparation du support. **Interdit** : promesse « supprime/traite/assèche l'humidité » (risque retours/juridique). → assouplit le garde-fou du skill.
- **Terminologie** : « Polymère Celestone™ » / « Le Celestone » uniquement ; **jamais** polyuréthane/PU/mousse. **Pas de « Big Rock »** (→ « habillage effet pierre » / « habillages pierre »). **Pas de corniches** (→ moulures + plinthes, « prêtes à peindre »). **Zéro prix** (devis WhatsApp). Seuls chiffres : **1999** et **4 800+ clients**.
- **Sources contenu produit** : brief `Downloads/index (2).html` (caractéristiques + étapes de pose + FAQ ; page « bundle », contenu décodé via shell). FAQ nettoyée (prix retirés) sauvegardée dans `~/.claude/plans/faq-brief-deutschconfort.md`.

## 4. Recherche de mots-clés (juin 2026)

Demande confirmée (concurrents + Avito/Jumia/Pinterest) sur : habillage mural, effet pierre/béton/bois, **mur TV / habillage mur télé** (fort B2C), façade + anti-humidité/sel marin, **mur de jardin**, moulures, plinthes, **panneau 3D/claustra**.
Concurrents : Signature Maroc (pierre PU, Casa), Kronosol, Skymax, Orac Maroc, Revêtement Maroc, MProBond, RENOVI (revêtement mural Casa — sans FAQ/schema/preuve sociale). **Différenciateur** : Polymère Celestone™ + pose garantie + showroom + depuis 1999.
⚠️ Volumes exacts non récupérés (= Google Keyword Planner, login user). Priorisation faite sur relevance + étude marketing `Downloads/etude_marketing_avancee_revetements_muraux.md`.

## 5. Pages SEO livrées (13) — toutes EN LIGNE et conformes

| Page | Mot-clé principal |
|---|---|
| `pose-installation.html` | pose installation revêtement mural Casablanca |
| `le-celestone.html` | Le Celestone / habillage mural haute densité (pilier) |
| `habillage-effet-pierre.html` | habillage effet pierre / habillages pierre |
| `panneau-effet-beton.html` | panneau mural effet béton |
| `panneau-effet-bois.html` | panneau effet bois / lambris |
| `facade-anti-humidite.html` | revêtement façade anti-humidité (ciblage franc) |
| `habillage-mur-jardin.html` | habillage mur de jardin extérieur |
| `mur-tv-decoratif.html` | mur TV décoratif / habillage mur télé |
| `panneau-mural-3d.html` | panneau mural 3D |
| `prescription-architectes.html` | revêtement prescription architecte Maroc |
| `moulures-decoratives.html` | moulures décoratives prêtes à peindre |
| `plinthes-pretes-a-peindre.html` | plinthes prêtes à peindre |
| `faq.html` | FAQ Le Celestone (sourcée brief, prix retirés) |

Chaque page : title ≤60c, meta ≤155c, mot-clé en title/H1/slug/1er §/H2/alt, 4 blocs JSON-LD (Product/Service/FAQPage + BreadcrumbList + Organization), FAQ, ≥3 CTA WhatsApp (+212 614 474 221), liens internes.

## 6. Technique on-site

- **Maillage interne** : liens croisés entre pages du cluster + footer (Le Celestone + FAQ) sur tout le site (~33 pages). 0 lien cassé sur 36 pages.
- **Sitemap** : `sitemap.xml` = **35 URLs** (12 nouvelles ajoutées à la main, priorités 0.6-0.9).
- **Correctif conformité** : « Polyuréthane »/PU → « Polymère Celestone™ » sur 9 pages existantes (7 `panneau-*`, `index.html`, `revetement-mural.html`).

## 7. Google Search Console

- Propriété **`https://deutsch-confort.com`** (Préfixe d'URL) déjà **vérifiée**.
- **Sitemap soumis = Success** (35 URLs). *(Piège rencontré : ne jamais soumettre une page `.html` comme sitemap — uniquement `sitemap.xml`.)*
- **Indexation demandée pour les 13 URLs** (URL inspection → Request indexing).
- Compte Google : **deutschconfortgb@gmail.com**.

## 8. Commits

- `3666cf3` — page pose-installation + skill.
- `eeceb8e` — cluster 12 pages + maillage + sitemap + correctif Polyuréthane.

## 9. Reste à faire (prochaines sessions)

1. **Google Business Profile** (le plus rentable, manuel, guide Partie 7) : réclamer/optimiser la fiche showroom Casablanca + demander des avis aux 4 800+ clients.
2. **Photos uniques** : les 12 nouvelles pages réutilisent toutes `images/facade-hero.jpg`. Câbler de vraies photos par thème (alt déjà optimisés).
3. **Suivi indexation** : revérifier Search Console → Pages (indexées) sous ~5-14 jours ; Performance sous quelques semaines.
4. **Volumes réels** : export Keyword Planner → re-prioriser maillage + prochaines pages.
5. **Nouveaux clusters** possibles : parquet/sols, claustra, déco hôtel/contract, pages par ville (avec contenu réel, pas de doorway pages).

## 10. Fichiers de référence

- Plan d'exécution : `~/.claude/plans/compiled-stargazing-bengio.md`
- FAQ source (prix retirés) : `~/.claude/plans/faq-brief-deutschconfort.md`
- Skill : `.claude/skills/seo-deutschconfort/SKILL.md`
- Brief produit : `Downloads/index (2).html` · Étude marketing : `Downloads/etude_marketing_avancee_revetements_muraux.md` · Guide : `Downloads/guide_pas_a_pas_seo_claude_code.md`
- Mémoire Claude : `project-seo-deutschconfort`, `feedback-seo-deutschconfort-regles`
