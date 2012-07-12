---
layout: post
title: "Du code et de la tôle à chaudière"
categories: node librairie
author: Martin Angers
abstract: En ces deux mois et demi de silence hypermégatopien, je n'ai pas chômé. Je suis parti en guerre contre la tôle à chaudière.
---

En ces deux mois et demi de silence hypermégatopien, je n'ai pas chômé. Je suis parti en guerre contre la tôle à chaudière.

La quoi?

La tôle à chaudière. Oui bon, j'essaie habituellement de garder un certain niveau de qualité de traduction des termes techniques, mais là, franchement, je n'ai rien trouvé de mieux. Je parle bien sûr du [*boilerplate code*][boilerplate], ce mal trop souvent nécessaire qui gonfle le code des programmes de tout acabit. Dans mon cas, étant dans une merveilleuse obsession Web, c'est sur le terrain des cadres d'application (*frameworks*) Javascript que j'ai livré bataille.

### La colle et le moule

La tôle à chaudière se retrouve le plus souvent, du moins dans le monde Web, sous forme de colle et de moule. Le moule pour jeter les bases de notre application - définir des modèles de données (*models*) qui héritent de ceci, des vues (*views*) qui héritent de cela, des modèles de vue (*templates*) avec des [poignées][handlebars] ou des [moustaches][mustache] en plus du code HTML des pages, bref un paquet de code qui allonge péniblement le temps de "mise en marché", mais qui est nécessaire pour avoir notre application en bout de ligne.

La colle, elle, sert à lier tout ça. Il faut donc définir des événements qui vont réagir aux changements sur le modèle de données, attacher la vue à un contrôleur pour faire le chemin inverse, etc. Vous connaissez la chanson. Il doit y avoir moyen de faire mieux. Et comme de fait, moyen il y a.

### Le Roi absolu

Au diable le suspense, celui qui règne sans pitié sur la tôle maudite, c'est [meteor][]. D'une simplicité hallucinante, ce cadre d'application est totalement en temps réel (via des *web sockets*, [sauf que pas vraiment][nows] - il est basé sur la librairie [sockjs][sock] mais le transport par *web socket* est désactivé étant donné le peu de support par la génération actuelle des fureteurs, mais le résultat est le même, même si la technologie est différente). Meteor brouille drastiquement la frontière entre le client et le serveur, par défaut tout code Javascript dans le projet est partagé et accessible autant sur le client que sur le serveur, et les répertoires `client` et `server` permettent de définir du code spécifique à leur environnement respectif.

Ce qui est possiblement le plus impressionnant dans ce cadre d'application, c'est la facilité d'exploitation des données (pour l'instant, il ne supporte nativement que l'engin de base de données [MongoDB][mongo]). Il s'agit de définir nos collections (dans le sens de leur donner un nom qui correspond à une collection dans la BD Mongo), et automatiquement, les données se retrouvent disponibles autant sur le serveur que sur le client, avec la même syntaxe Mongo d'un bord comme de l'autre! Ceci grâce à une librairie native à Meteor qui s'appelle `minimongo` et qui offre l'API Mongo sur le client. C'est tellement simple et efficace que j'ai construit un prototype - utilisant en arrière-plan la base de données de l'Assemblée nationale du Québec que j'ai mise en place pour [cet autre projet][assnatapi] - qui permet d'afficher la liste des députés et filtrer par nom en quelque 60 lignes de code Javascript - client et serveur!

En fait, c'est un peu *plus long* dans mon prototype que ce que ça aurait pu être car j'ai choisi de ne pas autopublier les données (ce qui nécessite encore moins de code, mais est peu viable dans une application réelle) et de désactiver la modification des données (les insertions, modifications et suppressions). Ce code est tout ce que ça prend pour envoyer les données sur le client.

    //**** Fichier /common/collections.js ****
    // Dans ce code commun au client et au serveur, définir les
    // collections Mongo utilisées par l'application. Sur le serveur,
    // je désactive les méthodes de modification de données (puisque
    // mon besoin était seulement de la lecture).
    var noop = function() {}
    Deputies = new Meteor.Collection('deputies')
    Interventions = new Meteor.Collection('interventions')

    if (Meteor.is_server) {
      // Disable insert, update, delete on the server side, this is a read-only website
      ['deputies', 'interventions'].forEach(function(coll) {
        ['insert', 'update', 'remove'].forEach(function(m) {
          Meteor.default_server.method_handlers['/' + coll + '/' + m] = noop
        })
      })
    }

    //**** Fichier /server/start.js ****
    // Au démarrage de l'application côté serveur, activer la publication des
    // députés et des interventions du député demandé.
    Meteor.startup(function() {
      // Publish the list of deputies
      Meteor.publish('deputies', function() {
        return Deputies.find()
      })

      // Publish the list of interventions for a deputy
      Meteor.publish('interventions', function(depId) {
        if (!depId) {
          return null
        }
        return Interventions.find({deputyId: depId}, {sort: {time: -1}})
      })
    })

Sur le client, pour s'abonner aux publications du serveur, le code requis est:

    Meteor.autosubscribe(function() {
      Meteor.subscribe('deputies', function() {
        // Ici, la publication est complétée, donc la variable Deputies définie
        // dans /common/collections.js est prête à être utilisée, par exemple:
        // Deputies.find() retourne l'ensemble des députés - sans accès au serveur.
      })
    })

Et pour actualiser la liste des interventions selon un identifiant de député:

    Meteor.autosubscribe(function() {
      Meteor.subscribe('interventions', Session.get('deputyId'))
    })

La variable `Session` est particulière en ce sens qu'elle est "réactive". Chaque fois que 'deputyId' est modifié, le code `Meteor.subscribe(...)`, qui est dans un contexte d'exécution réactif, est réexécuté automatiquement avec la nouvelle valeur, sans intervention requise.

Meteor est donc dangereusement efficace pour réduire le *boilerplate*. J'oserais dire que c'est le roi, bien qu'il semble que [Derby][derby] soit très bien aussi (j'avoue ne pas l'avoir essayé). Considérez les étapes que je mentionnais en ouverture. Pratiquement rien de tout ça ici. Bon, bien sûr il faut encore coder le HTML des pages et des modèles de vues (*templates*) avec *Handlebars*, l'engin de vues intégré avec Meteor, mais pas de colle requise. Alors y a-t-il un revers de la médaille? Oui.

### L'espace de croissance

D'abord il y a les légères controverses. Meteor utilise des [*fibers*][fiber] pour contourner l'approche asynchrone de node et permettre l'écriture *comme si le code s'exécutait de façon synchrone*, ce qui soulève des grognements dans la communauté, en plus de compliquer un peu l'utilisation des nombreuses librairies existantes dans l'écosystème node non prévues à cet effet. Aussi, il utilise son propre gestionnaire de librairies plutôt que npm.

Mais le principal problème avec Meteor, c'est qu'il n'est pas encore prêt pour la production. Il est un peu victime de son succès, depuis [la publication de son existence sur *Hacker News*][meteorhn] sa popularité ne s'est pas démentie, et les développeurs sont impatients de l'utiliser au-delà de ses capacités actuelles. Par exemple, l'authentification d'utilisateurs est en développement et n'est pas encore disponible dans la version officielle. Le gestionnaire de librairies fait partie du cadre d'application lui-même, donc pour l'instant les librairies Meteor développées par des tiers doivent être soumises en *pull request* pour être intégrées dans Meteor, plutôt que de pouvoir les publier de façon autonome, comme on peut le faire avec npm. Nul doute que ça fait partie des plans de l'équipe d'améliorer ces points.

J'ajouterais aussi l'utilisation éhontée de variables globales. Il manque une notion d'encapsulation qui donne l'impression de faire un grand pas en arrière, alors que Javascript lui-même est sur le point d'avoir des modules de façon native dans la prochaine itération du langage.

Cependant, malgré tout ça, je crois qu'il y a de la place pour ce type de cadre d'application qui impose une façon de faire très spécifique. Le gain en temps de développement est vraiment - mais **vraiment** - majeur, et pour certains types de projets, c'est le Saint-Graal recherché. Si l'équipe - [au *curriculum* bien garni][team] - continue à greffer des fonctionnalités dans le respect de la philosophie de départ, d'immense simplicité et clairement anti-tôle à chaudière, c'est un cheval gagnant.

### Étirer la sauce

Ce billet s'étire plus que je ne l'avais prévu. Je voulais parler d'un autre champion de cette guerre au *boilerplate*, un qui est fin prêt pour la production, et qui dans mon cas a détrôné les poids lourds du développement côté client (*ahem* backbone *ahem*) - [**AngularJS**][angular]. J'ai les deux mains dedans actuellement, pour un de mes projets, et c'est un pur plaisir. Ce sera pour un prochain billet.

Et pour finir, un mot sur mes récentes publications en logiciel libre. J'ai déjà mentionné mon [API pour exploiter les données de l'Assemblée nationale du Québec][assnatapi]. Il est principalement basé sur [Restify][], qui s'imposait de lui-même, le projet étant purement un API RESTful.

Et l'autre digne de mention est [advice][], qui concrétise en une petite librairie qui fonctionne aussi bien côté node que côté fureteur [les concepts présentés ici par Angus Croll de Twitter][angus], soit les *functional mixins* (encore là, gros échec côté traduction!). En gros, elle permet d'augmenter un objet avec des méthodes `before`, `after` et `around` - semblable à `wrap()` dans la librairie [underscore.js][uscore] - auxquelles j'ai ajouté `hijackBefore` et `hijackAfter` pour supporter les méthodes asynchrones avec procédure de rappel (*callback*). Ces méthodes donnent beaucoup de flexibilité pour ensuite enrichir l'objet de différentes fonctionnalités, sans être enfermé dans une hiérarchie stricte d'héritage. C'est une façon très élégante, en harmonie avec les caractéristiques intrinsèques de Javascript, de modéliser son code.

Sur ce, à la prochaine pour parler d'Angular!

[boilerplate]: http://en.wikipedia.org/wiki/Boilerplate_code
[meteor]: http://meteor.com/
[sock]: http://sockjs.org/
[derby]: http://derbyjs.com/
[fiber]: https://github.com/laverdet/node-fibers/
[meteorhn]: http://news.ycombinator.com/item?id=3824908
[team]: http://meteor.com/about/people
[angular]: http://angularjs.org/
[restify]: http://mcavage.github.com/node-restify/
[advice]: https://github.com/PuerkitoBio/advice
[angus]: https://speakerdeck.com/u/anguscroll/p/how-we-learned-to-stop-worrying-and-love-javascript
[uscore]: http://underscorejs.org/
[handlebars]: http://handlebarsjs.com/
[mustache]: http://mustache.github.com/
[mongo]: http://www.mongodb.org/
[assnatapi]: http://puerkitobio.github.com/assnatapi/
[nows]: https://github.com/meteor/meteor/blob/master/packages/stream/stream_client.js#L299-304
