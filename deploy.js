const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();

const config = {
  host: '167.233.129.213',
  port: 22,
  username: 'root',
  password: 'Denskie123'
};

const commands = [
  // System Update & Dependencies
  'apt-get update',
  'apt-get install -y curl git nginx certbot python3-certbot-nginx',
  
  // Install Node.js (v20)
  'curl -fsSL https://deb.nodesource.com/setup_20.x | bash -',
  'apt-get install -y nodejs',
  
  // Install PM2 globally
  'npm install -g pm2',
  
  // Prepare Directory
  'mkdir -p /var/www',
  'rm -rf /var/www/mabdc-portal', // Cleanup previous if exists
  'cd /var/www && git clone https://github.com/MABDC-admin/dll-jul15.git mabdc-portal'
];

async function runCommand(cmd) {
  return new Promise((resolve, reject) => {
    console.log(`Executing: ${cmd}`);
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let output = '';
      stream.on('close', (code, signal) => {
        console.log(`Command closed with code ${code}`);
        resolve(output);
      }).on('data', (data) => {
        process.stdout.write(data);
        output += data;
      }).stderr.on('data', (data) => {
        process.stderr.write(data);
        output += data;
      });
    });
  });
}

conn.on('ready', async () => {
  console.log('SSH Client :: ready');
  try {
    for (const cmd of commands) {
      await runCommand(cmd);
    }
    
    // Copy .env file contents
    const envContents = fs.readFileSync('./.env', 'utf8');
    const escapedEnv = envContents.replace(/'/g, "'\\''");
    await runCommand(`echo '${escapedEnv}' > /var/www/mabdc-portal/.env`);
    
    // Build and Start App
    const buildCommands = [
      'cd /var/www/mabdc-portal && npm install',
      'cd /var/www/mabdc-portal && npx prisma generate',
      'cd /var/www/mabdc-portal && npm run build',
      'pm2 stop mabdc-portal || true',
      'pm2 delete mabdc-portal || true',
      'cd /var/www/mabdc-portal && pm2 start npm --name "mabdc-portal" -- run start',
      'pm2 save',
      'pm2 startup | tail -n 1 > /tmp/pm2-startup.sh && sh /tmp/pm2-startup.sh'
    ];
    
    for (const cmd of buildCommands) {
      await runCommand(cmd);
    }

    // Configure Nginx
    const nginxConfig = `
server {
    listen 80;
    server_name dll.mabdc.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}`;
    const escapedNginx = nginxConfig.replace(/'/g, "'\\''").replace(/\$/g, "\\$");
    
    await runCommand(`echo '${escapedNginx}' > /etc/nginx/sites-available/mabdc-portal`);
    await runCommand(`ln -sf /etc/nginx/sites-available/mabdc-portal /etc/nginx/sites-enabled/`);
    await runCommand(`rm -f /etc/nginx/sites-enabled/default`);
    await runCommand(`systemctl restart nginx`);

    // Run Certbot for SSL (non-interactive)
    console.log("Setting up SSL with Certbot...");
    await runCommand(`certbot --nginx -d dll.mabdc.com --non-interactive --agree-tos -m admin@mabdc.com --redirect || true`);

    console.log('Deployment completed successfully!');
  } catch (err) {
    console.error('Deployment Failed:', err);
  }
  conn.end();
}).connect(config);
