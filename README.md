# Undercover — PWA

Jeu de déduction sociale inspiré de l'app officielle Undercover, en **pass-and-play**
(un seul téléphone qu'on se passe), 100 % hors-ligne, installable comme une app.

## Lancer le projet

```bash
npm install
npm run dev
```

Build de production (génère le service worker et le manifest PWA) :

```bash
npm run build && npm run preview
```

## Règles implémentées

- **Civils** : reçoivent tous le même mot.
- **Undercover** : reçoivent un mot proche mais différent.
- **Mr. White** (optionnel) : ne reçoit aucun mot, doit bluffer. S'il est éliminé,
  il a une dernière chance de deviner le mot des civils — s'il trouve, il gagne
  immédiatement (comparaison insensible à la casse et aux accents). Il ne prend
  **jamais la parole en premier** : sans mot ni indice préalable, ce serait
  injouable. La règle est réappliquée à chaque manche, car une élimination peut
  le faire remonter en tête de l'ordre de passage.
- À l'élimination, le rôle du joueur reste **caché derrière un bouton** : on
  annonce qui sort, puis on révèle son camp quand tout le monde est prêt. Son
  mot, lui, s'affiche **flouté** et ne se dévoile qu'au clic — l'afficher
  directement donnerait le mot des civils aux infiltrés encore en jeu, ou
  l'inverse.
- L'**ordre de passage est tiré au sort indépendamment** de l'ordre dans lequel
  les joueurs ont découvert leur mot, et il est **retiré à chaque manche**.
- **Victoire des civils** : tous les Undercover et Mr. White sont éliminés.
- **Victoire des infiltrés** : leur nombre devient supérieur ou égal à celui des civils.

Options réglables : nombre d'Undercover (borné à la moitié des joueurs), activation
de Mr. White, affichage des images, sélection multiple de thèmes (3 à 20 joueurs).

## Images des mots

Chaque mot est illustré au moment de la révélation, pour reconnaître un personnage
qu'on ne connaît pas. Les images **ne sont pas embarquées dans l'app** : elles sont
cherchées sur Wikipédia (fr, puis en) à partir du mot, puis mises en cache à deux
niveaux — l'URL dans `localStorage`, le fichier dans le service worker. Une fois un
mot vu, son image reste donc disponible hors-ligne.

Pour les thèmes livrés avec l'app, les URLs sont **déjà écrites en dur** dans
`wordPacks.ts` (champ `images`) : aucune recherche au lancement, affichage immédiat.
La recherche automatique ne sert qu'aux thèmes perso.

### Couverture des thèmes intégrés

| Thème | Paires | Mots illustrés |
|---|---|---|
| Classique | 20 | 40/40 |
| Chanteurs | 20 | 39/39 |
| Footballeurs | 20 | 38/38 |
| Sportifs | 20 | 40/40 |
| Films & Séries | 20 | 30/40 |
| Perso d'animé | 10 | 6/20 |

Les personnages de fiction sont mal couverts parce que **l'API Wikipédia exclut
délibérément les images non libres** : il n'existe donc pas de portrait de Naruto ou
de Walter White accessible par ce biais, seulement des logos de licence, des photos
de cosplay ou des figurines.

Deux règles appliquées à la génération, pour ne pas dégrader le jeu :

1. **Symétrie par paire** — les deux mots d'une paire ont une image, ou aucun des
   deux. Comme un joueur ignore son propre rôle, être le seul sans image serait un
   indice.
2. **Jamais d'image trompeuse** — les résultats qui pointaient sur un autre sujet ont
   été écartés (« Walter White » renvoyait le portrait de Walter Francis White, un
   militant des droits civiques bien réel ; « Saitama » la ville japonaise ; « L » la
   lettre de l'alphabet).

Conséquence : les 12 paires de fiction non couvertes s'affichent sans image. Pour les
compléter, il faut une source dédiée aux œuvres de fiction (TMDB pour les films et
séries, MyAnimeList pour les animés) ou des URLs saisies à la main.

Pour corriger un mot mal illustré dans un thème perso : onglet **Thèmes** → modifier
le thème → section **Images** → coller une URL d'image. Elle est enregistrée avec le
thème et remplace la recherche automatique. Le bouton **Images** dans les options
désactive complètement l'affichage.

## Ajouter tes propres thèmes

### Depuis l'app (le plus simple)

L'onglet **📚 Thèmes** en bas de l'écran permet de créer, modifier et supprimer des
catégories sans toucher au code. Les thèmes créés sont enregistrés dans le navigateur
(`localStorage`) et apparaissent aussitôt dans la grille de l'écran de jeu.

Pour injecter beaucoup de mots d'un coup, utilise le bouton **📋 Importer en masse** :
colle une paire par ligne, les deux mots séparés par `/`, `,`, `;` ou `|`.

```
Mario / Luigi
Link ; Zelda
Sonic , Tails
Kratos | Ares
```

Les lignes qui ne contiennent pas deux mots sont ignorées silencieusement.

> Le stockage est local au navigateur : vider les données du site efface les thèmes
> perso. Pour des thèmes permanents livrés avec l'app, passe par le fichier ci-dessous.

### Dans le code (thèmes livrés avec l'app)

Tout se passe dans [`src/data/wordPacks.ts`](src/data/wordPacks.ts). Un thème suit ce format :

```ts
{
  id: 'anime',              // identifiant unique, en kebab-case
  label: 'Perso d’animé',   // libellé affiché sur le bouton
  emoji: '🍥',              // icône affichée à côté du libellé
  pairs: [
    ['Naruto', 'Sasuke'],   // [mot des civils, mot des undercover]
    ['Goku', 'Vegeta'],
  ],
}
```

Points importants pour de bonnes paires :

- Les deux mots doivent être **proches mais distinguables** — assez similaires pour
  que l'undercover puisse bluffer, assez différents pour être démasqué.
- L'ordre dans la paire n'a pas d'importance : à chaque manche, le jeu tire au sort
  lequel des deux revient aux civils.
- Vise au moins une dizaine de paires par thème pour éviter les répétitions.

Les thèmes actuels (`classique`, `anime`, `films-series`, `chanteurs`,
`footballeurs`, `sportifs`) contiennent des données d'exemple à remplacer par tes
propres listes. Ajouter un thème au tableau `wordPacks` suffit : il apparaît
automatiquement dans l'écran de configuration.

## Structure

```
src/
├── App.tsx                 # routeur d'écrans + onglets Jouer/Thèmes
├── types.ts                # types du domaine (Player, Phase, WordPack…)
├── data/
│   ├── wordPacks.ts        # ← les thèmes livrés avec l'app
│   └── customPacks.ts      # thèmes perso : stockage local + import en masse
├── game/
│   ├── logic.ts            # tirage des mots, attribution des rôles, victoire
│   ├── reducer.ts          # machine à états de la partie
│   └── wordImages.ts       # recherche Wikipédia + cache des images
└── components/             # un composant par écran
```
