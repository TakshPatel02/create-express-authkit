#!/usr/bin/env node

import { scaffold } from '../src/scaffold.js';
import path from 'path';
import prompts from 'prompts';

const projectName = process.argv[2];

if (!projectName) {
  console.error('Usage: npx create-taksh-backend <project-name>');
  process.exit(1);
}

const response = await prompts({
  type: 'select',
  name: 'lang',
  message: 'Choose your language:',
  choices: [
    { title: 'JavaScript', value: 'js' },
    { title: 'TypeScript', value: 'ts' }
  ],
  initial: 1 // defaults cursor to TypeScript since that's your actively maintained version
});

if (!response.lang) {
  console.log('\n❌ Cancelled.');
  process.exit(1);
}

const targetDir = path.join(process.cwd(), projectName);
scaffold(projectName, targetDir, response.lang);