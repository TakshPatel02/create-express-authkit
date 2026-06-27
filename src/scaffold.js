import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function copyDir(src, dest, projectName) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, path.join(dest, entry.name), projectName);
    } else if (entry.name === 'package.json.template') {
      // Replace placeholder and write as package.json
      const content = fs.readFileSync(srcPath, 'utf-8')
        .replace('{{project-name}}', projectName);
      fs.writeFileSync(path.join(dest, 'package.json'), content);
    } else {
      fs.copyFileSync(srcPath, path.join(dest, entry.name));
    }
  }
}

export function scaffold(projectName, targetDir) {
  const templateDir = path.join(__dirname, '../templates');

  if (fs.existsSync(targetDir)) {
    console.error(`❌ Folder "${projectName}" already exists.`);
    process.exit(1);
  }

  console.log(`\n🚀 Creating ${projectName}...`);
  copyDir(templateDir, targetDir, projectName);

  console.log('📦 Installing dependencies...');
  execSync('npm install', { cwd: targetDir, stdio: 'inherit' });

  console.log(`
✅ Done! Get started:

  cd ${projectName}
  cp .env.example .env
  npm run dev
`);
}