#!/usr/bin/env node

import { scaffold } from '../src/scaffold.js';
import path from 'path';

const projectName = process.argv[2];

if (!projectName) {
  console.error('Usage: npx create-taksh-backend <project-name>');
  process.exit(1);
}

const targetDir = path.join(process.cwd(), projectName);
scaffold(projectName, targetDir);