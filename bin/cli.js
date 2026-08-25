#!/usr/bin/env node

import { scaffold } from '../src/scaffold.js';
import path from 'path';
import prompts from 'prompts';

const projectName = process.argv[2];

if (!projectName) {
  console.error('Usage: npx create-express-authkit <project-name>');
  process.exit(1);
}

const response = await prompts([
  {
    type: 'select',
    name: 'lang',
    message: 'Choose your language:',
    choices: [
      { title: 'JavaScript', value: 'js' },
      { title: 'TypeScript', value: 'ts' }
    ],
    initial: 0
  },
  {
    type: 'select',
    name: 'template',
    message: 'Choose authentication strategy:',
    choices: [
      { title: 'Basic Auth (Email/Password + JWT + Refresh Token)', value: 'basic' },
      { title: 'OTP Verification (Email OTP + Password Reset)', value: 'otp-verification' },
      { title: 'Role-Based Auth (User & Admin RBAC)', value: 'role-based' }
    ],
    initial: 0
  }
]);

if (!response.lang || !response.template) {
  console.log('\n❌ Cancelled.');
  process.exit(1);
}

const targetDir = path.join(process.cwd(), projectName);
scaffold(projectName, targetDir, response.lang, response.template);
