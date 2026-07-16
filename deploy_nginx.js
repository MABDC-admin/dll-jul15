const { Client } = require('ssh2');
const fs = require('fs');
const conn = new Client();
const config = { host: '167.233.129.213', port: 22, username: 'root', password: 'Denskie123' };

conn.on('ready', () => {
  conn.sftp((err, sftp) => {
    if (err) throw err;
    const readStream = fs.createReadStream('nginx.conf');
    const writeStream = sftp.createWriteStream('/etc/nginx/sites-available/mabdc-portal');
    writeStream.on('close', () => {
      conn.exec('nginx -t && systemctl restart nginx && cd /var/www/mabdc-portal && pm2 delete mabdc-portal && pm2 start npm --name mabdc-portal -- run start -- -H 127.0.0.1 -p 3000', (err, stream) => {
        stream.on('close', () => conn.end());
        stream.pipe(process.stdout);
        stream.stderr.pipe(process.stderr);
      });
    });
    readStream.pipe(writeStream);
  });
}).connect(config);
