/**
 * Copyright (c) 2026 The xterm.js authors. All rights reserved.
 * @license MIT
 */

const fs = require('fs');
const path = require('path');
const Module = require('module');
const Mocha = require('mocha');

const argv = process.argv.slice(2);
const files = [];
let grep;
let fgrep;

for (let i = 0; i < argv.length; i++) {
  const arg = argv[i];
  if (arg === '--grep' && argv[i + 1]) {
    grep = argv[++i];
    continue;
  }
  if (arg.startsWith('--grep=')) {
    grep = arg.slice('--grep='.length);
    continue;
  }
  if (arg === '--fgrep' && argv[i + 1]) {
    fgrep = argv[++i];
    continue;
  }
  if (arg.startsWith('--fgrep=')) {
    fgrep = arg.slice('--fgrep='.length);
    continue;
  }
  files.push(arg);
}

process.env.NODE_PATH = [path.resolve(__dirname, '../out'), process.env.NODE_PATH]
  .filter(Boolean)
  .join(path.delimiter);
Module._initPaths();

const testFiles = files.length > 0 ? files : ['./out/browser/Terminal.test.js'];
const options = {};
if (fgrep) {
  options.fgrep = fgrep;
} else if (grep) {
  options.grep = new RegExp(grep);
}

const mocha = new Mocha(options);
for (const file of testFiles) {
  const resolved = path.resolve(__dirname, '..', file);
  if (!fs.existsSync(resolved)) {
    console.error(`Test file not found: ${file}`);
    process.exit(1);
  }
  mocha.addFile(resolved);
}

mocha.run(failures => {
  process.exitCode = failures > 0 ? 1 : 0;
});
