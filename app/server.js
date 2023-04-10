const mqtt = require('mqtt');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

let currentUsername;

rl.question('Enter username:', (username) => {
    rl.question('Enter password:', (password) => {
        let client = mqtt.connect({
            port: 1883,
            host: '127.0.0.1',
            keepalive: 10000,
            username: username,
            password: password,
        });

        client.on('connect', () => {
            console.log(`Connected to Chat Server as ${username}`);
            currentUsername = username;
            rl.setPrompt(`${username}: \n`);
            client.subscribe('chat');
            client.subscribe('message');
            rl.prompt();
        });

        client.on('message', (topic, message) => {
            try {
                message = JSON.parse(message.toString())
                if (message.from !== currentUsername) {
                    console.log(
                        '\n' + message.from + ' a dit : ' + message.message + '\n' + currentUsername + ': '
                    );
                }
            } catch (err) {
                console.error(`Failed to parse message: ${err.message}`);
            }
        });

        client.on('close', () => {
            console.log('Chat Server closed');
        });

        rl.on('line', (input) => {
            try {
                client.publish('chat', JSON.stringify({
                    from: currentUsername,
                    message: input,
                    timestamp: new Date().getTime()
                }));
            } catch (err) {
                console.error(`Failed to publish message: ${err.message}`);
            }
            rl.prompt();
        });
    });
});