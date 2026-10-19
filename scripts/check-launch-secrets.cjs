const fs = require('node:fs');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
const root = path.resolve(__dirname, '..');
const files = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], {cwd:root,encoding:'utf8'}).split('\0').filter(p=>p && !p.startsWith('.kilo/') && !p.startsWith('.playwright-cli/') && !p.startsWith('output/'));
const patterns = [/ISSecretKey_[A-Za-z0-9_-]{12,}/g, /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g, /AIza[\w-]{30,}/g];
let findings = 0;
for(const file of [...new Set(files)]) {
  if(!/\.(?:ts|tsx|js|cjs|mjs|json|md|html|ya?ml|example)$/.test(file)) continue;
  const absolute = path.join(root,file); if(!fs.existsSync(absolute))continue;
  const content = fs.readFileSync(absolute,'utf8');
  for(const pattern of patterns) { pattern.lastIndex=0; if(pattern.test(content)){console.error(`Review credential-like content in ${file} (value suppressed).`); findings++;} }
}
const assets=path.join(root,'dist/assets');
if(fs.existsSync(assets))for(const file of fs.readdirSync(assets).filter(p=>p.endsWith('.js'))){const content=fs.readFileSync(path.join(assets,file),'utf8');if(/ISSecretKey_[A-Za-z0-9_-]{12,}|admin@topheights\.test|student@topheights\.test|customer@topheights\.test|Local-[A-Za-z0-9_!-]{10,}/.test(content)){console.error(`Private or test-only content in dist/assets/${file} (value suppressed).`);findings++;}}
if(findings)process.exitCode=1;else console.log('No credential values or local test logins detected in publishable source and production bundles. Historical Git content is not covered; rotate the exposed provider key.');
