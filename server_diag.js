const { Client } = require('ssh2');
const fs = require('fs');
const conn = new Client();

conn.on('ready', () => {
  const cmd = [
    'echo "=== PM2 STATUS ==="',
    'pm2 status',
    'echo "=== MEMORY ==="',
    'free -m',
    'echo "=== DISK ==="',
    'df -h /',
    'echo "=== UPTIME / LOAD ==="',
    'uptime',
    'echo "=== TOP PROCESSES BY CPU ==="',
    'ps aux --sort=-%cpu | head -12',
    'echo "=== TOP PROCESSES BY MEM ==="',
    'ps aux --sort=-%mem | head -12',
    'echo "=== NODE PROCESS MEMORY ==="',
    'ps -o pid,vsz,rss,comm -p $(pgrep -d, node) 2>/dev/null || echo "No node processes"',
    'echo "=== PRISMA LOG NOISE ==="',
    'echo "Prisma query logging is ON — this floods pm2 logs and wastes CPU"',
  ].join(' && ');

  let output = '';
  conn.exec(cmd, (err, stream) => {
    if (err) { console.error(err); conn.end(); return; }
    stream.on('close', () => {
      fs.writeFileSync('server_report.txt', output);
      console.log(output);
      conn.end();
    })
    .on('data', (data) => { output += data.toString(); })
    .stderr.on('data', (data) => { output += data.toString(); });
  });
});

conn.connect({
  host: '167.233.129.213',
  port: 22,
  username: 'root',
  password: process.env.DEPLOY_PASS
});
