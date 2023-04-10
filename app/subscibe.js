const mqtt = require('mqtt');
let client = mqtt.connect({
    port: 1883,
    host: '127.0.0.1',
    keepalive: 10000,
    username: 'test',
    password: 'test',
});

client.on('connect', () => {
    console.log(`Connected to Chat Server`);
    client.subscribe('chat');
    client.subscribe('message');
});

client.on('message', (topic, message) => {
    try {
        console.log("Sur le topic" + topic.toString() + ":")
        console.log(message.toString());
    } catch (err) {
        console.log(`Failed to parse message: ${err.message}`);
    }
});

client.on('close', () => {
    console.log('Chat Server closed');
});
