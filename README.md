# Folio

**Une planche contact pour ses références visuelles.**
On y développe des images, on les numérote, on entoure celles qui comptent. Sans compte, sans serveur, sans algorithme : tout reste dans le navigateur.

**[Voir la démo](https://Eva-Mignerey.github.io/folio/)**

![Aperçu de Folio](docs/apercu.png)

## Le concept

Folio reprend les codes de la chambre noire photographique :

- chaque référence est une **vue de pellicule** au format 3:2, numérotée dans l’ordre d’ajout (`01A`, `02A`…), comme sur un négatif ;
- on **entoure au crayon gras** les vues qui comptent, puis on filtre sur cette sélection ;
- l’interface est éclairée par une **lampe inactinique** rouge, avec un grain argentique léger.

## Fonctionnalités

- Ajout d’images par **glisser-déposer**, **collage** (Ctrl+V) ou sélection de fichier, ou par URL
- **Stockage 100 % local** : images dans IndexedDB, données dans le localStorage
- **Compression automatique** des images lourdes en WebP avant stockage
- **Sélection** au crayon gras et filtre dédié
- **Tags**, filtres et **recherche** instantanée
- **Export / import JSON**, images comprises, pour sauvegarder ou changer de navigateur
- **Accessible** : navigation clavier, lecteurs d’écran, `prefers-reduced-motion`, contrastes vérifiés

## Stack

Vue 3 (Composition API) · TypeScript · Pinia · Vue Router · Vite · SCSS · IndexedDB

## Choix techniques

- **IndexedDB sans bibliothèque.** Le localStorage est limité à environ 5 Mo et ne stocke que du texte : trop peu pour des images. IndexedDB stocke les images en binaire (Blob). Les transactions sont encapsulées dans des promesses (`src/lib/imageStore.ts`).
- **Compression côté client.** Au-delà de 2000 px ou de 1,5 Mo, l’image est redimensionnée sur un `<canvas>` et convertie en WebP. La version compressée n’est gardée que si elle est plus légère.
- **Pas de fuite mémoire.** Les URL `blob:` sont mises en cache et révoquées à la suppression d’une image. Supprimer une carte supprime aussi son image.
- **Données validées.** Tout ce qui est relu (localStorage, fichier importé) passe par une fonction de validation typée. Un fichier mal formé ne peut pas casser l’application.
- **Architecture conteneur / présentation.** Seules les vues parlent au store. Les composants reçoivent des props et émettent des événements, ce qui les rend réutilisables et testables.
- **Éléments natifs.** Fenêtre d’ajout en `<dialog>` (focus piégé et Échap gérés par le navigateur), polices hébergées localement.

## Lancer le projet

```bash
npm install
npm run dev
```

| Commande | Rôle |
| --- | --- |
| `npm run dev` | Serveur de développement |
| `npm run typecheck` | Vérification TypeScript |
| `npm run build` | Vérification des types puis build de production |
| `npm run preview` | Prévisualisation du build |

Le site est déployé automatiquement sur GitHub Pages à chaque push sur `main`.

## Auteure

**Eva Mignerey**, étudiante en BUT MMI, parcours développement web et dispositifs interactifs.
[eva-mignerey.fr](https://eva-mignerey.fr) · [GitHub](https://github.com/Eva-Mignerey)