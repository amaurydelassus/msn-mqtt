const mqtt = require('mqtt');
const readline = require('readline');
const {spawn} = require('child_process');

const rl = readline.createInterface({
    input: process.stdin, output: process.stdout,
});
const DISCONNECT_TOPIC = 'disconnect';
const USERS_TOPIC = 'users';

const username = process.argv[2];
const password = process.argv[3];

var connectedClients = [];

chat(username, password)

function chat(username, password) {
    const client = mqtt.connect({
        port: 8883, host: '127.0.0.1', keepalive: 10000, username: username, password: password,
    });
    client.on('connect', () => {
        // deconection des double compte
        client.publish(DISCONNECT_TOPIC, JSON.stringify({
            from: username, message: DISCONNECT_TOPIC, timestamp: new Date().getTime()
        }));
        client.subscribe(DISCONNECT_TOPIC);
        client.subscribe(USERS_TOPIC); // subscribe to users topic
        client.publish(USERS_TOPIC, JSON.stringify({
            from: username, message: "Connexion", timestamp: new Date().getTime()
        }));
        client.subscribe('Général');
        client.subscribe(`${username}/+`); // subscribe to one-to-one topic receive
        client.subscribe(`+/${username}`); // subscribe to one-to-one topic send
        client.publish('event', JSON.stringify({
            from: username, message: "Connexion", timestamp: new Date().getTime()
        }));
        console.log("*****************************************************************\n" +
            "*                 Bienvenu sur le chat                          *\n" +
            "*****************************************************************\n" +
            "*       Pour parler en public : saisissez votre message         *\n" +
            "*       Pour créer un topic : #NomDuTopic                       *\n" +
            "*       Pour créer un sous-topic : #NomDuTopic/NomDuSousTopic   *\n" +
            "*       Pour parler dans un topic ou sous-topic :               *\n" +
            "*       #NomDuTopic Votre message...                            *\n" +
            "*       Pour inviter une personne à un topic :                  *\n" +
            "*       @NomDeLaPersonne #NomDuTopic/NomDuSousTopic...          *\n" +
            "*       Pour parler en privé avec une personne :                *\n" +
            "*       @NomDeLaPersonne Votre message...                       *\n" +
            "*       Commandes disponibles :                                 *\n" +
            "*       /users : affiche la liste des utilisateurs              *\n" +
            "*       /cls : nettoie la console                               *\n" +
            "*****************************************************************\n");
        console.log(`Connecté au serveur de chat en tant que ${username}`);
    });
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
            client.end();
            rl.close();
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
                    const topic = inputArr[0].slice(1);
                    try {
                        if (username != message.from) {
                            client.subscribe(topic);
                            console.log("Bienvenue dans le topic " + topic + "\n" +
                                "Vous avez été ajouté par " + message.from + "\n" +
                                "Pour communiquer dans ce topic utiliser #" + topic + " Votre message\n" +
                                "Pour quitter le topic #" + topic + " exit")
                        } else {
                            client.subscribe(topic);
                            console.log("L'utilisateur a bien été ajouté au topic #" + topic)
                        }

                    } catch (err) {
                        console.error(`Impossible d'ajouter l'utilisateur au Topic`);
                    }
                }
            }
            if (topic !== DISCONNECT_TOPIC && topic !== USERS_TOPIC) {// Pour ne pas afficher les message de l'utilisateur && message.from !== username){
                if (message.message.startsWith('#')) {
                    const inputArr = message.message.split(' ');
                    const topic = inputArr[0].slice(1);
                    try {
                        if (username != message.from) {
                            client.subscribe(topic);
                            console.log("Bienvenue dans le topic " + topic + "\n" +
                                "Vous avez été ajouté par " + message.from + "\n" +
                                "Pour communiquer dans ce topic utiliser #" + topic + " Votre message\n" +
                                "Pour quitter le topic #" + topic + " exit")
                        } else {
                            client.subscribe(topic);
                            console.log("L'utilisateur a bien été ajouté au topic #" + topic)
                        }

                    } catch (err) {
                        console.error(`Impossible de publier le message : ${err.message}`);
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
                client.publish('Général', JSON.stringify({
                    from: username, message: input, timestamp: new Date().getTime()
                }));
            } catch (err) {
                console.error(`Impossible de publier le message : ${err.message}`);
            }
        }
    });
}

function enleverDoublons(tab) {
    return tab.filter((item, index) => tab.indexOf(item) === index);
}