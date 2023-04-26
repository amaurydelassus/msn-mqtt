const mqtt = require('mqtt');
const readline = require('readline');
const {exec} = require('child_process');
const {spawn} = require('child_process');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const username = process.argv[2];
const password = process.argv[3];
const recipient = process.argv[4];

privateChat(username, password,recipient)

const DISCONNECT_TOPIC = 'disconnect';

//Crée un salon private avec @user
function privateChat(username, password, recipient) {
    // create a new MQTT client
    const client = mqtt.connect('mqtt://localhost:1883', {
        username: username,
        password: password
    });

    client.on('connect', () => {
        console.log(`Connecté en tant que ${username} au broker MQTT`);
        // subscribe to the private topic between the recipient and the current user
        client.subscribe(`${username}/${recipient}`);
    });

    client.on('message', (topic, message) => {
        const data = JSON.parse(message.toString());
        console.log(`[${new Date(data.timestamp).toLocaleTimeString()}] ${data.from}: ${data.message}`);
    });

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.setPrompt(`${username}@${recipient}> `);
    rl.prompt();

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
        } else {
            try {
                client.publish(`${recipient}/${username}`, JSON.stringify({
                    from: username,
                    message: input,
                    timestamp: new Date().getTime()
                }));
            } catch (err) {
                console.error(`Impossible de publier le message : ${err.message}`);
            }
            rl.prompt();
        }
    });
}