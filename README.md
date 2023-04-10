# MSN-MQTT

Ce projet a été réalisé dans le cadre des cours d'Internet des objets (IoT) pour implémenter un forum de discussion en temps réel (CHAT) similaire à MSN, en utilisant le protocole MQTT.

## Fonctionnalités

Le projet comprend un backend et un frontend avec les fonctionnalités suivantes :

### Backend

- Serveur Node JS / Broker MQTT
- Gestion des Usernames (unique)
- Gestion des canaux de discutions
- Gestion des One to One

### Frontend

- Application (msn like)
- Login avec un username (unique)
- Chat général pour discuter
- Possibilité de créer un canal de discussion avec un nom
- Inviter des utilisateurs dans un canal de discussion
- Un utilisateur peut rejoindre un canal, quitter un canal et discuter dans un canal avec les autres utilisateurs du canal.
- N’importe quel utilisateur peut créer un canal
- Possibilité de discuter en one to one avec un autre utilisateur

Il n’y a pas de mise en place de gestion de droits et de rétention (si on démarre l’application, les canaux sont vides, ainsi que les utilisateurs). Car ça n’est pas le but du TD.

## Comment utiliser

Pour utiliser ce projet, vous devez d'abord installer les dépendances en exécutant la commande suivante :

```
npm install
```

Ensuite, vous pouvez lancer l'application avec la commande suivante :

```
npm install
```

## TD

Ce projet a été développé dans le cadre d'un Travaux Dirigés et utilise les outils suivants :

- J'ai choisi Mosquitto car est un broker MQTT open source léger qui est facile à installer et à configurer. 
- Il est idéal pour les projets de petite et moyenne taille avec une faible charge de trafic MQTT.


La solution sera notée sur 15 points avec la répartition suivante :

- 3 points pour l’explication sur le fonctionnement de votre solution
- 3 points pour le chat général
- 3 points pour le fonctionnement en one to one
- 4 points pour la gestion d’un canal de discussion (création, invitation, discussion, sortie)
- 2 points pour la qualité du code

## Auteur

Ce projet a été réalisé par Amaury DELASSUS.

## Recherche et Source :

- https://www.youtube.com/watch?v=6ns4F-3N1Ms

