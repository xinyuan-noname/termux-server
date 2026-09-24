const fs = require('fs');

function mergeDevEnv() {
  const files = ['.env.local', '.env.development.local'];
  let content = '';
  for (const file of files) {
    if (fs.existsSync(file)) {
      content += fs.readFileSync(file, 'utf8') + '\n';
    }
  }
  fs.writeFileSync('.env', content);
}

function mergeProdEnv() {
  const files = ['.env.local', '.env.production.local'];
  let content = '';
  for (const file of files) {
    if (fs.existsSync(file)) {
      content += fs.readFileSync(file, 'utf8') + '\n';
    }
  }
  fs.writeFileSync('.env', content);
}

module.exports = { mergeDevEnv, mergeProdEnv };