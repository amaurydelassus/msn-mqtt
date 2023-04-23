const mqtt = require('mqtt');
const readline = require('readline');
const { exec } = require('child_process');
const { spawn } = require('child_process');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
const DISCONNECT_TOPIC = 'disconnect';

rl.question('Entrez le nom d\'utilisateur :', (username) => {
    rl.question('Entrez le mot de passe :', (password) => {
        openChatPublic(username,password)
    });
});

function openChatPublic(username,password) {
    exec(`start cmd.exe /K "node ./app/chat.js ${username} ${password}"`, (err, stdout, stderr) => {
        if (err) {
            console.error(`Erreur lors de l'ouverture de la nouvelle fenêtre de console : ${err}`);
            return;
        }
        console.log('Nouvelle fenêtre de chat créée');
    });
}