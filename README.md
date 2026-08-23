# 🧱 NÉONOID

**Casse-briques néon — hommage à l'Amiga**

Un jeu de casse-briques (Breakout/Arkanoid) au style néon synthwave, avec starfield, effets de lueur, combos, 10 bonus, 3 difficultés, mode infini et sélecteur de niveaux. Jouable au clavier, à la souris ou au tactile sur mobile.

🎮 **Jouer :** [neonoid.lhusser.fr](https://neonoid.lhusser.fr) · [GitHub Pages](https://laurent-67370.github.io/neonoid/)

---

## ✨ Fonctionnalités

### Gameplay
- **10 niveaux** uniques avec des motifs variés : damier, pyramide, donjon, envahisseur, galaxie, cœur, escaliers, cible, noyau final…
- **Mode infini** — après les 10 niveaux, génération aléatoire de niveaux de plus en plus difficiles (damier, pyramide, vagues, colonnes, spiral, blocs dispersés)
- **10 bonus** (capsules à attraper) : palet élargi, multi-balles ×3, lasers, palet collant, balle ralentie, boule de feu, vie supplémentaire, **bouclier**, **gravité inversée**, **mégaballe**
- **2 malus** : palet rétréci, balle accélérée
- **Briques spéciales** : argentées (2-3 coups), dorées (indestructibles), explosives (chaîne)
- **Système de combos** jusqu'à ×8 pour un maximum de points
- **Bonus de fin de niveau** — points supplémentaires selon les vies restantes (×250) et la rapidité (jusqu'à ×75 par seconde économisée)
- **Sélecteur de niveau** — débloque les niveaux au fur et à mesure (sauvegarde locale), rejoue ton niveau préféré depuis le menu
- **3 difficultés** :
  - **FACILE** : balle lente, 5 vies, palet large, vie tous les 8 000 pts
  - **NORMAL** : vitesse normale, 3 vies, palet standard, vie tous les 10 000 pts
  - **DIFFICILE** : balle rapide, 2 vies, palet étroit, vie tous les 12 000 pts

### Interface
- **Indicateur de bonus actifs** — icônes colorées + barres de durée en bas du canvas, pour voir en temps réel combien de temps il reste pour chaque bonus
- **High scores** — top 5 avec nom du joueur (sauvegarde locale)
- **Effets visuels néon** : starfield animé, trail de balle, particules d'explosion, lueur bloom, screen shake
- **Audio** généré par Web Audio API (aucun fichier son requis)
- **100% vanilla JS** — aucune dépendance, aucun build, ça tourne directement dans le navigateur

---

## 🎮 Contrôles

| Action | Clavier | Souris / Tactile |
|---|---|---|
| Déplacer le palet | `←` `→` ou `A` `D` | Glisser |
| Lancer la balle / Tirer | `Espace` | Clic / Tap |
| Pause | `P` ou `Échap` | — |
| Activer/désactiver le son | `M` | — |

---

## 🧱 Types de briques

| Symbole | Type | Effet |
|---|---|---|
| Couleur | Normale | Détruite en 1 coup |
| S | Argentée | 2 coups (3 en fin de jeu) |
| G | Dorée | Indestructible |
| X | Explosive | Détruit les briques voisines en chaîne |

---

## 🎁 Bonus & Malus

| Capsule | Effet | Durée |
|---|---|---|
| **E** 🔵 | Palet élargi | 20s |
| **M** 🟣 | Multi-balles ×3 | — |
| **L** 🩷 | Lasers (Espace pour tirer) | 12s |
| **C** 🟢 | Palet collant | 15s |
| **S** 🔵 | Balle ralentie | 10s |
| **B** 🟠 | Boule de feu (traverse les briques) | 9s |
| **D** 🟡 | Bouclier : sauve une balle perdue | 12s |
| **G** 🟣 | Gravité inversée : la balle tombe vers le haut | 10s |
| **X** 🩷 | Mégaballe : triple rayon, détruit en un coup | 12s |
| **+** 🩷 | Vie supplémentaire ❤ | — |
| **!** 🔴 | Palet rétréci (malus) | 14s |
| **F** 🟡 | Balle accélérée (malus) | 8s |

---

## 📁 Structure du projet

```
neonoid/
├── index.html        # Structure HTML + écrans (titre, aide, scores, pause, fin, sélecteur niveau)
├── css/
│   └── style.css     # Styles néon, écrans, boutons, sélecteur difficulté, animations
├── js/
│   ├── audio.js      # Web Audio API — sons générés (rebonds, explosions, bonus, musique)
│   ├── levels.js     # 10 niveaux + générateur de niveaux aléatoires (mode infini)
│   ├── game.js       # Moteur du jeu (physique, collisions, briques, 10 bonus, particules, HUD)
│   ├── ui.js         # Gestion des écrans, boutons, high scores, sélecteur de niveau, bonus fin de niveau
│   └── main.js       # Point d'entrée, boucle de jeu, hooks, tracking temps par niveau
```

---

## 🚀 Déploiement

### Local
Ouvrir `index.html` dans un navigateur — c'est tout.

### GitHub Pages
Le dépôt est configuré pour GitHub Pages (branche `main` / root) :
→ https://laurent-67370.github.io/neonoid/

### VPS (nginx + Let's Encrypt)
```bash
git clone https://github.com/Laurent-67370/neonoid.git /var/www/neonoid
# Config nginx → neonoid.lhusser.fr → /var/www/neonoid
certbot --nginx -d neonoid.lhusser.fr
```
Auto-update toutes les 10 min via cron (`/opt/neonoid-update.sh`).

---

## 🛠️ Tech

- **HTML5 Canvas** 600×800
- **Vanilla JavaScript** (ES5, aucune dépendance)
- **Web Audio API** pour le son
- **localStorage** pour les high scores + progression des niveaux débloqués
- Compatible mobile (viewport, touch events)

---

## 📜 Licence

Projet personnel — Laurent Husser