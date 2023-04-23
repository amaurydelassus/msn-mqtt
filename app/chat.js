const mqtt = require('mqtt');
const readline = require('readline');
const {spawn} = require('child_process');
const rl = readline.createInterface({
    input: process.stdin, output: process.stdout,
});
const DISCONNECT_TOPIC = 'disconnect';

const username = process.argv[2];
const password = process.argv[3];

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
        client.subscribe('public');
        console.log(`Connecté au serveur de chat en tant que ${username}`);
        client.subscribe(`${username}/+`); // subscribe to one-to-one topic
        client.subscribe(`+/${username}`); // subscribe to one-to-one topic
        client.publish('event', JSON.stringify({
            from: username, message: "Connexion", timestamp: new Date().getTime()
        }));
    });
    client.on('reconnect', () => {
        console.log(`Reconnexion en cours...`);
        client.publish('event', JSON.stringify({
            from: username, message: "Reconnexion", timestamp: new Date().getTime()
        }));
    });
    client.on('offline', () => {
        console.log('Client MQTT déconnecté du broker');
    });
    client.on('error', (err) => {
        if (err.message === 'Connection refused: Not authorized') {
            console.error(`Connection error: ${err.message}.\nClosing client connection`);
            client.end();
            rl.close();
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
                // console.log("Connexion via un autre compte. Vous allez être déconnecté.");
                // client.end();
            }
            if (topic !== DISCONNECT_TOPIC) {// Pour ne pas afficher les message de l'utilisateur && message.from !== username)#{
                console.log(topic + '/' + message.from + ' a dit : ' + message.message);
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
                client.end();
                rl.close();
                return;
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
                } else {
                    client.publish(topic, JSON.stringify({
                        from: username, message: message, timestamp: new Date().getTime()
                    }));
                }
            } catch (err) {
                console.error(`Impossible de publier le message : ${err.message}`);
            }
        } else if (input.startsWith('.')) { // Partie Topic
            const inputArr = input.split(' ');
            const cmd = inputArr[0].slice(1);
            if (cmd == 'cls') {
                console.clear()
            }
        } else {
            try {
                client.publish('public', JSON.stringify({
                    from: username, message: input, timestamp: new Date().getTime()
                }));
            } catch (err) {
                console.error(`Impossible de publier le message : ${err.message}`);
            }
        }
    });
}