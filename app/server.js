const mqtt = require('mqtt');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
const DISCONNECT_TOPIC = 'disconnect';
let currentUsername;

rl.question('Entrez le nom d\'utilisateur :', (username) => {
    rl.question('Entrez le mot de passe :', (password) => {
        const client = mqtt.connect({
            port: 8883,
            host: '127.0.0.1',
            keepalive: 10000,
            username: username,
            password: password,
        });
        client.on('connect', () => {
            console.log(`Connecté au serveur de chat en tant que ${username}`);
            currentUsername = username;
            rl.setPrompt(`${username}: \n`);
            client.subscribe('chat');
            client.publish(DISCONNECT_TOPIC, JSON.stringify({
                from: currentUsername,
                message: DISCONNECT_TOPIC,
                timestamp: new Date().getTime()
            }));
            client.subscribe(`private/${username}`); // subscribe to one-to-one topic
            client.subscribe(DISCONNECT_TOPIC);
            client.publish('event', JSON.stringify({
                from: currentUsername,
                message: "Connexion",
                timestamp: new Date().getTime()
            }));
        });
        client.on('reconnect', () => {
            console.log(`Reconnecté au serveur de chat en tant que ${username}`);
            currentUsername = username;
            rl.setPrompt(`${username}: \n`);
            client.subscribe('chat');
            client.publish('event', JSON.stringify({
                from: currentUsername,
                message: "Reconnexion",
                timestamp: new Date().getTime()
            }));
        });
        client.on('offline', () => {
            console.log('Client MQTT déconnecté du broker');
        });
        client.on('error', (err) => {
            console.error(`Erreur : ${err}`);
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
                if (topic !== DISCONNECT_TOPIC && message.from !== username) {
                    console.log(topic + '/' + message.from + ' a dit : ' + message.message);
                }
            } catch (err) {
                console.error(`Impossible de traiter le message : ${err.message}`);
            }
        });
        rl.on('line', (input) => {
            if (input === 'exit') {
                try {
                    client.end();
                    rl.close();
                    return;
                } catch (err) {
                    console.error(`Erreur pour déconnecter ...`);
                    return;
                }
            } else if (input.startsWith('@')) {
                const inputArr = input.split(' ');
                const receiver = inputArr[0].slice(1); // Remove the '@' symbol from the receiver's username
                const message = inputArr.slice(1).join(' ');
                try {
                    client.publish('private/' + receiver, JSON.stringify({
                        from: currentUsername,
                        message: message,
                        timestamp: new Date().getTime()
                    }));
                } catch (err) {
                    console.error(`Impossible de publier le message : ${err.message}`);
                }
            } else {
                try {
                    client.publish('chat', JSON.stringify({
                        from: currentUsername,
                        message: input,
                        timestamp: new Date().getTime()
                    }));
                } catch (err) {
                    console.error(`Impossible de publier le message : ${err.message}`);
                }
            }
        });
    });
});
