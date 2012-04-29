---
layout: post
title: "Comment emprunter l'héritage de Backbone"
categories: backbone
author: Martin Angers
published: false
abstract: 
---

L'héritage par prototypage de Javascript n'est ni trivial, ni abominablement complexe. Il est cependant tout sauf intuitif à bien mettre en place. Heureusement, dans une application Web utilisant déjà Backbone, on peut facilement profiter de l'implémentation de cette librairie pour définir nos classes, utiliser `MaClasse.extend()` comme un voleur et se prendre pour Jesse James.

### Une fonction dans une classe à part

Colin Moock résume bien le problème des "classes" avec Javascript dans [cet article][moock] (avant de sombrer dans de doûteuses déclarations et critiques du langage). Le fait que ce soit une `function` comme une autre qui, si utilisée avec le mot-clef `new` devient un "constructeur de classe", n'est certes pas l'idée du siècle. La convention de la lettre majuscule est une bien mince protection contre une mauvaise utilisation. Sans parler de la mise en place requise de la chaîne de prototypes pour un héritage "dans les règles". En attendant [l'introduction de classes comme citoyennes de première... euh... classe][classes] qui viendra peut-être avec Harmony, il faut vivre avec ces imperfections.

Ce qui nous amène à Backbone et son approche élégante d'héritage. On veut créer un nouveau modèle? `var MonModele = Backbone.Model.extend({/* propriétés d'instance de la nouvelle classe */}, {/* propriétés statiques de la nouvelle classe */})`. Idem pour une nouvelle classe héritant de `Backbone.View`, `Collection` et `Router` (`Backbone.Events` n'est pas une classe/fonction constructeur, c'est un objet qui peut être ajouté au prototype d'une autre classe pour bénéficier de ses fonctionnalités, ou "cloné" pour être utilisé tel quel). Le hic, c'est qu'on n'a pas le choix d'hériter d'une classe de Backbone, avec tout son bagage.

### La solution: un emprunt

Ceci étant javascript, il est tout simple d'aller emprunter (poliment) la fonctionnalité voulue et l'utiliser dans une hiérarchie de classes basée sur un objet racine vierge.


[moock]: http://www.moock.org/lectures/troublewithjs/
[classes]: http://wiki.ecmascript.org/doku.php?id=strawman:maximally_minimal_classes
