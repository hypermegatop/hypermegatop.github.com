---
layout: post
title: "Comment emprunter l'héritage de Backbone"
categories: backbone
author: Martin Angers
abstract: L'héritage par prototypage de Javascript n'est ni trivial, ni abominablement complexe. Il est cependant tout sauf intuitif à bien mettre en place. Heureusement, dans une application Web utilisant déjà Backbone, on peut facilement profiter de l'implémentation de cette librairie pour définir nos classes.
---

L'héritage par prototypage de Javascript n'est ni trivial, ni abominablement complexe. Il est cependant tout sauf intuitif à bien mettre en place. Heureusement, dans une application Web utilisant déjà [Backbone][bb], on peut facilement profiter de l'implémentation de cette librairie pour définir nos classes. Petit truc simplissime, mais fort utile.

### Une fonction dans une classe à part

Colin Moock résume bien le problème des "classes" avec Javascript dans [cet article][moock] découvert via [@jsgeneve][jsg] (par la suite il sombre dans de doûteuses déclarations et critiques du langage). Le fait que ce soit une `function` comme une autre qui, si utilisée avec le mot-clef `new` devient un "constructeur de classe", n'est certes pas l'idée du siècle. La convention de la lettre majuscule pour identifier un constructeur est une bien mince protection contre une mauvaise utilisation. Sans parler de la mise en place requise de la chaîne de prototypes pour un héritage "dans les règles". En attendant [l'introduction de classes comme citoyennes de première... euh... classe][classes] qui viendra peut-être avec [Harmony][], il faut vivre avec ces imperfections.

Ce qui nous amène à Backbone et son approche élégante d'héritage. On veut créer un nouveau modèle? `var MonModele = Backbone.Model.extend({/* propriétés d'instance de la nouvelle classe */}, {/* propriétés statiques de la nouvelle classe */})`. Idem pour une nouvelle classe héritant de `Backbone.View`, `Collection` et `Router` (`Backbone.Events` n'est pas une classe/fonction constructeur, c'est un objet qui peut être ajouté au prototype d'une autre classe pour bénéficier de ses fonctionnalités, ou "cloné" pour être utilisé tel quel). Le hic, pour utiliser cette approche, c'est qu'on n'a pas le choix d'hériter d'une classe de Backbone, avec tout son bagage.

### La solution: un emprunt

Ceci étant javascript, il est tout simple d'aller emprunter (poliment) la fonctionnalité voulue et l'utiliser dans une hiérarchie de classes basée sur un objet racine vierge.

    // Définir notre objet de base...
    var BaseObject = function() {
    }

    // ... et "emprunter" la méthode "extend" de Backbone
    // (c'est la même méthode sur toutes les classes Backbone)
    BaseObject.extend = Backbone.Model.extend

C'est tout! On peut maintenant hériter de `BaseObject` avec `Classe = BaseObject.extend()`, avec les mêmes possibilités de propriétés d'instance et propriétés statiques.

On aime l'idée du `initialize()` appelé automatiquement à l'instanciation d'un objet? Tout aussi simple à mettre en place dans notre classe de base:

    var BaseObject = function() {
      // Appeler "initialize()", pouvant être substitué dans les sous-classes
      this.initialize.apply(this, arguments)
    }
    // Définir le "initialize()" vide par défaut
    _.extend(BaseObject.prototype, {
      initialize: function() {}
    })
    BaseObject.extend = Backbone.Model.extend

Voilà, on peut profiter des mêmes fonctionnalités qu'avec les objets Backbone. On peut définir un `initialize()` ou un `constructor()` dans une sous-classe, substituer des méthodes et appeler la méthode de l'ancêtre via `ClasseEnfant.__super__.methodeSubstituee()`.

### _.extend et Backbone.extend

Il est important de bien comprendre la différence entre le `extend()` de Backbone et celui de [underscore][uscore]. Dans le cas d'underscore, cette méthode ne fait que copier les clefs d'un (ou de plusieurs) objets sur un objet cible. Ça ne touche pas au prototype de l'objet, les clefs sont copiées sur l'objet lui-même (c'est pourquoi pour enrichir un prototype il n'est pas rare de voir, comme dans l'exemple précédent de BaseObject, `_.extend(BaseObject.prototype, {/* propriétés à ajouter au prototype*/})`, car en passant l'objet prototype comme tel comme objet cible c'est ultimement la définition de la "classe" qu'on enrichit).

De son côté, le `extend()` de Backbone est inspiré de `goog.inherits()` de la [*closure library* de Google][closure]. Il manipule la chaîne de prototypes pour pouvoir profiter d'un héritage et permettre l'appel de l'ancêtre via la propriété `__super__`, en plus d'assigner correctement les propriétés d'instance et statiques.

Les deux méthodes ont donc des objectifs distincts, et sont souvent complémentaires. Par exemple, si on voulait créer une classe héritant de BaseObject **et** offrant les fonctionnalités de Backbone.Events, on pourrait faire ceci:

    var BaseEtEvents = BaseObject.extend( // Hériter de BaseObject
        _.extend({
          fonctionDeLaNouvelleClasse: function() {},
          clefDeLaNouvelleClasse: "valeur"
        }, 
        // Ajouter les fonctionnalités de Events aux propriétés d'instance de la classe
        Backbone.Events)
      )

    alert(BaseEtEvents instanceof BaseObject) // Affiche "true"

### Alternatives

Juste comme je terminais cet article, Isaac Schlueter rappelait sur Twitter l'existence de sa micro-librairie [inherits][izs]. Une dizaine de lignes de code pour accomplir grosso modo ce que l'on vient d'aborder. Il y a plusieurs autres implémentations semblables - `goog.inherits()` en est une autre - pour faire de l'héritage, mais lorsqu'on utilise déjà Backbone dans son projet, la solution que je présente ici est fort peu coûteuse.

### Un mot sur ce nouveau site

Comme vous pouvez le voir, le blogue est maintenant déménagé sur GitHub, puisque [le Calepin a annoncé sa fermeture imminente][tweet]. J'ai conservé l'aspect épuré que j'aimais bien, et j'ai ajouté les "boutons sociaux" pour permettre un plus grand rayonnement des articles, usez-les gaiement! Je ne voulais cependant pas polluer la page avec ceux-ci, ils sont donc discrètement placés sous le titre du billet, cachés par défaut et dévoilés lors d'un clic sur le titre. J'espère que ce nouveau design, dans la continuité et la simplicité, vous plaira et n'hésitez pas à me faire part de vos commentaires!

[moock]: http://www.moock.org/lectures/troublewithjs/
[classes]: http://wiki.ecmascript.org/doku.php?id=strawman:maximally_minimal_classes
[harmony]: http://wiki.ecmascript.org/doku.php?id=harmony:harmony
[bb]: http://backbonejs.org/
[uscore]: http://documentcloud.github.com/underscore/
[closure]: http://code.google.com/p/closure-library/
[tweet]: https://twitter.com/#!/calepinapp/status/192335906479415296
[izs]: https://github.com/isaacs/inherits
[jsg]: https://twitter.com/#!/jsgeneve
