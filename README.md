# MSN-MQTT

Ce projet a été réalisé dans le cadre des cours d'Internet des objets (IoT) pour implémenter un forum de discussion en temps réel (CHAT) similaire à MSN, en utilisant le protocole MQTT.

## Fonctionnalités

Le projet comprend un backend et un frontend avec les fonctionnalités suivantes :

### Prérequis :
- Avoir Node.js et Docker installés et fonctionnels sur votre machine.
- Développé pour fonctionner sur Windows. (Cela peut ne pas fonctionner sur d'autres systèmes d'exploitation)

### Backend

- Serveur mosquitto (Broker MQTT)
- Gestion des Usernames par mosquitto (User/Password : fichier password_file.txt)
- Gestion des canaux de discussion (topic)
- Gestion des One to One (topic privée)

### Frontend

- Gestion des Usernames (unique)
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

Pour utiliser ce projet, vous devez d'abord cloner ce projet.
```
git clone https://github.com/amaurydelassus/msn-mqtt.git
```
Puis dans un terminal situé dans le dossier cloné,
```
cd msn-mqtt
```
Lancez le serveur Mosquitto en utilisant Docker avec la commande suivante :
```
docker-compose up
```
Puis installez les dépendances avec la commande suivante :
```
npm install
```
Vous aurais besoin d'un utilisateur pour crée votre utilisateur utiliser la commande :
```
node .\app\adduser.js
```
Ou utiliser l'utilisateur de test (test/test): 

Ensuite, vous pouvez lancer l'application avec la commande suivante :
```
node .\app\serveur.js
```
Entrez vos informations d'utilisateur/mot de passe et une fenêtre de discussion s'ouvrira.
Pour ouvrir dans la meme fenetre vous pouvez utiliser la comande : 
```
node .\app\chat.js username password
```
## Fonctionnement du chat
### chat public
- Pour envoyer un message public (Dans le topic public), il suffit de taper votre message et d'apuiller sur entrer.
- L'affichage sera comme ceci :
```
public/<username> a dit : Votre message.
```
### Topic et Sous topic
- Pour envoyer un message dans un topic il faut utiliser le '#NonDeVotreTopic>' Un nom de topic et en un seul mot:

Exemple : 
```
#MonTopic Votre message
```

- Pour envoyer un message dans un sous topic il faut utiliser le '/NonDuSousTopic' pour chaque sous topic:

Exemple :
```
#MonTopic/SousTopic Votre message
```
- Pour souscrire a un Topic ou sous topic utiliser les commandes si dessus sans le message (Si vous envoyer un message la souscription ce fait automatiquement)

### One to One

- Le one to one utilise le prefix @NomDuDestinataire

Exemple : 
```
@DestinataireDuMessage Votre message
```


## TD

Ce projet a été développé dans le cadre d'un TP et utilise les outils suivants :

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

