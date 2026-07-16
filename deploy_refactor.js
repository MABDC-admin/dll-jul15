const { Client } = require('ssh2');

const conn = new Client();
const config = { host: '167.233.129.213', port: 22, username: 'root', password: process.env.DEPLOY_PASS };

const commands = [
  'cd /var/www/mabdc-portal && git pull origin main',
  'cd /var/www/mabdc-portal && npm run build',
  'pm2 restart mabdc-portal'
];

async function runCommand(cmd) {
  return new Promise((resolve, reject) => {
    console.log(`Executing: ${cmd}`);
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      stream.on('close', (code) => {
        console.log(`Command closed with code ${code}`);
        resolve();
      }).on('data', (data) => process.stdout.write(data))
        .stderr.on('data', (data) => process.stderr.write(data));
    });
  });
}

conn.on('ready', async () => {
  try {
    for (const cmd of commands) await runCommand(cmd);
    console.log("Deployment Successful!");
  } catch(e) {
    console.error(e);
  }
  conn.end();
}).connect(config);
