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
      const content = fs.readFileSync(srcPath, 'utf-8')
        .replace('{{project-name}}', projectName);
      fs.writeFileSync(path.join(dest, 'package.json'), content);
    } else {
      fs.copyFileSync(srcPath, path.join(dest, entry.name));
    }
  }
}

export function scaffold(projectName, targetDir, lang) {
  const templateDir = path.join(__dirname, '../templates', lang);

  if (!fs.existsSync(templateDir)) {
    console.error(`❌ Template for "${lang}" not found.`);
    process.exit(1);
  }

  if (fs.existsSync(targetDir)) {
    console.error(`❌ Folder "${projectName}" already exists.`);
    process.exit(1);
  }

  console.log(`\n🚀 Creating ${projectName} (${lang === 'ts' ? 'TypeScript' : 'JavaScript'})...`);
  copyDir(templateDir, targetDir, projectName);

  console.log('📦 Installing dependencies...');
  execSync('npm install', { cwd: targetDir, stdio: 'inherit' });

  console.log(getInstructions(projectName, lang));
}

function getInstructions(projectName, lang) {
  const envStep = `cp .env.example .env  (or copy .env.example .env on Windows)`;

  if (lang === 'ts') {
    return `
✅ Done! Get started:

  cd ${projectName}
  ${envStep}
  npm run build
  npm start

  💡 During development, use "npm run dev" instead of build+start
     for auto-restart on file changes.
`;
  }

  return `
✅ Done! Get started:

  cd ${projectName}
  ${envStep}
  npm run dev
`;
}