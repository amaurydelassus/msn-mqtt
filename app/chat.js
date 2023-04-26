const mqtt = require('mqtt');
const readline = require('readline');
const { spawn } = require('child_process');

// création de l'interface de lecture pour l'entrée utilisateur
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// constantes
const DISCONNECT_TOPIC = 'disconnect'; // topic pour la déconnexion
const USERS_TOPIC = 'users'; // topic pour la liste des utilisateurs
const PUBLIC_TOPIC = 'Général'; // topic public

// récupération du nom d'utilisateur et du mot de passe passés en argument
const username = process.argv[2];
const password = process.argv[3];

// tableau des clients connectés
let connectedClients = [];

// appel de la fonction de chat avec les paramètres utilisateur
chat(username, password);

// fonction de chat
function chat(username, password) {
    // création du client MQTT
    const client = mqtt.connect({
        port: 8883,
        host: '127.0.0.1',
        keepalive: 10000,
        username: username,
        password: password,
    });

    // événement de connexion au broker MQTT
    client.on('connect', () => {
        // déconnexion des comptes en double
        client.publish(DISCONNECT_TOPIC, JSON.stringify({
            from: username,
            message: DISCONNECT_TOPIC,
            timestamp: new Date().getTime(),
        }));

        // abonnement aux topics
        client.subscribe(DISCONNECT_TOPIC); // déconnexion
        client.subscribe(USERS_TOPIC); // liste des utilisateurs
        client.subscribe(PUBLIC_TOPIC); // topic général
        client.subscribe(`${username}/+`); // topic privé (recevoir)
        client.subscribe(`+/${username}`); // topic privé (envoyer)

        // envoi d'un message de connexion
        client.publish(USERS_TOPIC, JSON.stringify({
            from: username,
            message: "Connexion",
            timestamp: new Date().getTime(),
        }));

        // affichage des commandes disponibles
        console.log("*****************************************************************\n" +
            "*                 Bienvenue sur le chat                          *\n" +
            "*****************************************************************\n" +
            "*       Pour parler en public : saisissez votre message         *\n" +
            "*       Pour créer un topic : #NomDuTopic                       *\n" +
            "*       Pour créer un sous-topic : #NomDuTopic/NomDuSousTopic   *\n" +
            "*       Pour parler dans un topic ou sous-topic :               *\n" +
            "*       #NomDuTopic Votre message...                            *\n" +
            "*       Pour inviter une personne à un topic :                  *\n" +
            "*       @NomDeLaPersonne #NomDuTopic/NomDuSousTopic...          *\n" +
            "*       Pour quitter un topic :                                 *\n" +
            "*       #NomDuTopic/NomDuSousTopic... exit                      *\n" +
            "*       Pour parler en privé avec une personne :                *\n" +
            "*       @NomDeLaPersonne Votre message...                       *\n" +
            "*       Commandes disponibles :                                 *\n" +
            "*       /users : affiche la liste des utilisateurs              *\n" +
            "*       /cls : nettoie la console                               *\n" +
            "*****************************************************************\n");
        console.log(`Connecté au serveur de chat en tant que ${username}`);
    });

    // événement de reconnexion au broker MQTT
    client.on('reconnect', () => {
        console.log(`Reconnexion en cours...`);
        client.unsubscribe(DISCONNECT_TOPIC)
        client.publish('event', JSON.stringify({
            from: username, message: "Reconnexion", timestamp: new Date().getTime()
        }));
    });
    client.on('offline', () => {
        console.log('Client MQTT déconnecté du broker');
    });
    client.on('error', (err) => {
        if (err.message === 'Connection refused: Not authorized') {
            console.error(`Connection error: ${err.message}.\nDéconnexion...`);
            client.end(); // fermer la connexion MQTT
            rl.close(); // fermer l'interface utilisateur
        } else if (err.message === 'Error: client disconnecting') {
            console.error('Déconnexion...');
        } else {
            console.error(`${err}`);
        }
    });
    client.on('close', () => {
        console.log('Le serveur de chat est fermé');
    });
    client.on('message', (topic, message) => {
        try {
            message = JSON.parse(message.toString())
            if (topic === DISCONNECT_TOPIC && message.from === username) {
                console.log("Connexion via un autre compte. Vous allez être déconnecté.");
                client.end();
            }
            if (topic === USERS_TOPIC) {
                connectedClients.push(message.from);
                connectedClients = enleverDoublons(connectedClients)
                if (message.message !== "PING") {
                    connectedClients = []
                    client.publish(USERS_TOPIC, JSON.stringify({
                        from: username, message: "PING", timestamp: new Date().getTime()
                    }));
                }
            }
            if (topic !== DISCONNECT_TOPIC && topic !== USERS_TOPIC) {// Pour ne pas afficher les message de l'utilisateur && message.from !== username){
                if (message.message.startsWith('#')) {
                    const inputArr = message.message.split(' ');
                    const topics = inputArr[0].slice(1);
                    try {
                        if (username != message.from) {
                            client.subscribe(topics);
                            console.log("Bienvenue dans le topic " + topics + "\n" +
                                "Vous avez été ajouté par " + message.from + "\n" +
                                "Pour communiquer dans ce topic utiliser #" + topics + " Votre message\n" +
                                "Pour quitter le topic #" + topics + " exit")
                        } else {
                            client.subscribe(topics);
                            console.log("L'utilisateur a bien été ajouté au topic #" + topics)
                        }

                    } catch (err) {
                        console.error(`Impossible d'ajouter l'utilisateur au Topic`);
                    }
                } else {
                    console.log(topic + '/' + message.from + ' a dit : ' + message.message);
                }
            }
        } catch (err) {
            console.error(`Impossible de traiter le message : ${err.message}`);
        }
    });
    rl.on('line', (input) => {
        readline.moveCursor(process.stdout, 0, -1);
        readline.clearScreenDown(process.stdout);
        if (input === 'exit') {
            try {
                // Supprimer l'utilisateur déconnecté de la liste des clients connectés
                client.publish(USERS_TOPIC, JSON.stringify({
                    from: username, message: "Déco", timestamp: new Date().getTime()
                }));
                client.end();
                rl.close();
            } catch (err) {
                console.error(`Erreur pour déconnecter ...`);
                return;
            }
        } else if (input.startsWith('@')) { // Partie 1 to 1
            const inputArr = input.split(' ');
            const receiver = inputArr[0].slice(1);
            const message = inputArr.slice(1).join(' ');
            try {
                client.publish(receiver + '/' + username, JSON.stringify({
                    from: username, message: message, timestamp: new Date().getTime()
                }));
            } catch (err) {
                console.error(`Impossible de publier le message : ${err.message}`);
            }
        } else if (input.startsWith('#')) { // Partie Topic
            const inputArr = input.split(' ');
            const topic = inputArr[0].slice(1);
            const message = inputArr.slice(1).join(' ');
            try {
                client.subscribe(topic);
                if (message == "") {
                    console.log("Bienvenue dans le topic " + topic + "\n" +
                        "Pour communiquer dans ce topic utiliser #" + topic + " Votre message pour le topic")
                } else if (message == "exit") {
                    client.unsubscribe(topic)
                } else {
                    client.publish(topic, JSON.stringify({
                        from: username, message: message, timestamp: new Date().getTime()
                    }));
                }
            } catch (err) {
                console.error(`Impossible de publier le message : ${err.message}`);
            }
        } else if (input.startsWith('/')) { // Partie Topic
            const inputArr = input.split(' ');
            const cmd = inputArr[0].slice(1);
            if (cmd == 'cls') {
                console.clear()
            }
            if (cmd == 'users') {
                console.log('Connected clients:', connectedClients);
            }
        } else {
            try {
                client.publish(PUBLIC_TOPIC, JSON.stringify({
                    from: username, message: input, timestamp: new Date().getTime()
                }));
            } catch (err) {
                console.error(`Impossible de publier le message : ${err.message}`);
            }
        }
    });
}

// fonction pour enlever les doublons dans un tableau
function enleverDoublons(tab) {
    return tab.filter((item, index) => tab.indexOf(item) === index);
}