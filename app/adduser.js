const { exec } = require('child_process');
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.question('Enter username:', (username) => {
    rl.question('Enter password:', (password) => {
        exec(`docker-compose run mosquitto mosquitto_passwd -b /mosquitto/config/password_file.txt ${username} ${password}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error adding user: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`Error adding user: ${stderr}`);
                return;
            }
            console.log(`User '${username}' added successfully`);
        });
        exec(`docker-compose restart mosquitto`)
        rl.close();
    });
});