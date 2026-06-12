# Mise en ligne du site Deutschconfort — stratégie GitHub + Netlify

Site **statique** (HTML/CSS/JS + images). Page d'accueil : `index.html`.
Deux niveaux : (1) le site en ligne, (2) ton domaine `deutsch-confort.com` qui pointe dessus.

---

## Vue d'ensemble de la stratégie retenue

```
   Code du site ──▶ GitHub (dépôt)  ──▶ Netlify (héberge + HTTPS auto)  ──▶ deutsch-confort.com
                     (source)            (redéploie à chaque push)          (DNS pointé vers Netlify)
```

- **GitHub** = l'endroit où vit le code. À chaque mise à jour, on « pousse » sur GitHub.
- **Netlify** = connecté à GitHub. Dès qu'on pousse, **il redéploie tout seul**. Il gère aussi
  le certificat **HTTPS** gratuitement.
- **Domaine** : on laisse le nom chez ton registrar actuel (Wix), on change juste où il *pointe*.

> En attendant, le **glisser-déposer** direct sur Netlify met le site en ligne immédiatement sur
> une URL `xxx.netlify.app`. On bascule ensuite ce même site sur GitHub pour les mises à jour auto.

---

## Étape 1 — Le dépôt GitHub (je le prépare pour toi)

Une fois GitHub autorisé, je crée un dépôt (ex. `deutschconfort-site`) et j'y pousse **tout le
site**, avec `index.html` à la racine. Tu n'as rien à coder.

---

## Étape 2 — Connecter Netlify à GitHub (mises à jour automatiques)

1. Netlify → **Add new site → Import an existing project → GitHub**.
2. Autorise, choisis le dépôt `deutschconfort-site`.
3. Réglages de build (site statique, **aucun build**) :
   - **Build command** : *(laisser vide)*
   - **Publish directory** : `/` (racine du dépôt)
4. **Deploy**. Site en ligne sur `xxx.netlify.app`.
   → Désormais, **chaque modification que je pousse sur GitHub se met en ligne toute seule.**

---

## Étape 3 — Brancher `deutsch-confort.com`

### A. Côté Netlify
**Site → Domain management → Add a custom domain** → `deutsch-confort.com`.
Netlify affiche les enregistrements DNS exacts (en général) :
- **A** `@` → `75.2.60.5`
- **CNAME** `www` → `ton-site.netlify.app`

### B. Côté domaine (aujourd'hui chez Wix)
Le domaine est géré par Wix. Deux cas :

**Cas 1 — Wix te laisse éditer le DNS**
Tableau de bord Wix → **Domaines → ton domaine → Avancé → Modifier les enregistrements DNS** :
- mets l'enregistrement **A** (`@`) sur l'IP Netlify,
- mets le **CNAME `www`** sur `ton-site.netlify.app`,
- **déconnecte le domaine du site Wix** (sinon Wix continue de le servir).

**Cas 2 — Wix bloque (le plus fréquent) → passer par Cloudflare (gratuit)**
1. Crée un compte **Cloudflare**, ajoute `deutsch-confort.com`. Cloudflare te donne **2 nameservers**.
2. Wix → Domaines → Avancé → **Serveurs de noms (nameservers)** → « utiliser des serveurs
   externes » → colle ceux de Cloudflare.
3. Tu gères ensuite les A/CNAME **dans Cloudflare** (vers Netlify), sans la limite Wix.

⏱️ Propagation DNS : **1 à 24 h**. Ensuite, ton domaine sert le nouveau site, en HTTPS.

> **Ordre conseillé, zéro coupure :** d'abord le site en ligne (glisser-déposer ou GitHub) et
> testé sur l'URL `.netlify.app` → **ensuite seulement** la bascule DNS du domaine.

---

## Étape 4 — Les mises à jour, après coup

- Tu me demandes un changement → je modifie le site → **je pousse sur GitHub** → Netlify
  **redéploie automatiquement** en ~1 min. Rien à refaire à la main.
- (Sans GitHub, il faudrait re-glisser le dossier sur Netlify à chaque fois.)

---

## ⚠️ Images encore hébergées sur Wix (à régler avant de résilier Wix)

Certaines pages affichent des images servies par `static.wixstatic.com`. Elles marchent **tant
que ton compte Wix existe**. Si tu fermes Wix, elles casseront.

- **100 % autonomes** (images locales) : parquet (bois naturel + stratifié), réalisations,
  visite virtuelle, simulateur, panneaux muraux.
- **Encore dépendantes de Wix** : accueil, collections, sol vinyle, sol extérieur, et quelques
  vignettes de revêtement mural.

➡️ Avant de résilier Wix, demande-moi de **rapatrier ces images en local** (tu me fournis les
fichiers) pour un site totalement indépendant.

---

## Récap des liens vérifiés
- **Instagram** → instagram.com/deutschconfort
- **WhatsApp** → +212 614 474 221
- **Catalogue PDF** → lien Dropbox (boutons « Catalogue »)
