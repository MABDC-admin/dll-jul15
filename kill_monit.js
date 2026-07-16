const { Client } = require('ssh2');
const conn = new Client();

conn.on('ready', () => {
  conn.exec('kill $(pgrep -f "pm2 monit") 2>/dev/null; echo "pm2 monit killed"; pm2 status', (err, stream) => {
    if (err) { console.error(err); conn.end(); return; }
    stream.on('close', () => conn.end())
      .on('data', (data) => process.stdout.write(data))
      .stderr.on('data', (data) => process.stderr.write(data));
  });
});

conn.connect({
  host: '167.233.129.213',
  port: 22,
  username: 'root',
  password: process.env.DEPLOY_PASS
});
