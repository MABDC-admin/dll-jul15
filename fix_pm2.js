const { Client } = require('ssh2');

const conn = new Client();
const config = { host: '167.233.129.213', port: 22, username: 'root', password: 'Denskie123' };

const commands = [
  'cd /var/www/mabdc-portal && pm2 delete mabdc-portal',
  'cd /var/www/mabdc-portal && pm2 start npm --name mabdc-portal -- run start',
  'pm2 save',
  'pm2 logs mabdc-portal --lines 20 --nostream'
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
  } catch(e) {
    console.error(e);
  }
  conn.end();
}).connect(config);
