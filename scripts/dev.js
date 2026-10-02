import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Ensure essential Windows system directories are present in PATH and ComSpec is valid
if (process.platform === 'win32') {
  const sysRoot = process.env.SystemRoot || process.env.WINDIR || 'C:\\Windows';
  const sys32 = path.join(sysRoot, 'System32');
  const winPsh = path.join(sysRoot, 'System32', 'WindowsPowerShell', 'v1.0');
  const wbem = path.join(sysRoot, 'System32', 'Wbem');

  const currentPath = process.env.PATH || '';
  const parts = currentPath.split(';').map(p => p.trim());
  const lowerParts = parts.map(p => p.toLowerCase());

  const missing = [sys32, sysRoot, wbem, winPsh].filter(
    p => fs.existsSync(p) && !lowerParts.includes(p.toLowerCase())
  );

  if (missing.length > 0) {
    process.env.PATH = `${missing.join(';')};${currentPath}`;
  }

  if (!process.env.ComSpec || !fs.existsSync(process.env.ComSpec)) {
    const cmdPath = path.join(sys32, 'cmd.exe');
    if (fs.existsSync(cmdPath)) {
      process.env.ComSpec = cmdPath;
    }
  }
}

const tsNodeDevBin = path.resolve(rootDir, 'node_modules', 'ts-node-dev', 'lib', 'bin.js');
const viteBin = path.resolve(rootDir, 'node_modules', 'vite', 'bin', 'vite.js');

if (!fs.existsSync(tsNodeDevBin) || !fs.existsSync(viteBin)) {
  console.error('\x1b[31m[error] Dependencies are missing. Please run `npm install` first.\x1b[0m');
  process.exit(1);
}

function pipeOutput(child, prefix, colorCode) {
  const prefixStr = `\x1b[${colorCode}m[${prefix}]\x1b[0m `;

  if (child.stdout) {
    const rlOut = readline.createInterface({ input: child.stdout });
    rlOut.on('line', (line) => {
      console.log(`${prefixStr}${line}`);
    });
  }

  if (child.stderr) {
    const rlErr = readline.createInterface({ input: child.stderr });
    rlErr.on('line', (line) => {
      console.error(`${prefixStr}${line}`);
    });
  }
}

console.log('\x1b[32m[dev]\x1b[0m Starting Upasthiti backend server and frontend client...\n');

// Launch Backend Server directly via node
const serverProcess = spawn(
  process.execPath,
  [tsNodeDevBin, '--project', 'server/tsconfig.json', '--respawn', '--transpile-only', 'server/src/index.ts'],
  {
    cwd: rootDir,
    env: process.env,
    stdio: ['pipe', 'pipe', 'pipe']
  }
);
pipeOutput(serverProcess, 'server', '36'); // Cyan

// Launch Frontend Client directly via node
const clientProcess = spawn(
  process.execPath,
  [viteBin],
  {
    cwd: rootDir,
    env: process.env,
    stdio: ['pipe', 'pipe', 'pipe']
  }
);
pipeOutput(clientProcess, 'client', '35'); // Magenta

let shuttingDown = false;
function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`\n\x1b[33m[dev]\x1b[0m Received ${signal}, stopping services...`);

  const killChild = (child) => {
    if (!child || child.killed) return;
    try {
      if (process.platform === 'win32' && child.pid) {
        spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], {
          stdio: 'ignore',
          env: process.env
        }).on('error', () => {
          try { child.kill('SIGTERM'); } catch {}
        });
      } else {
        child.kill('SIGTERM');
      }
    } catch {
      try { child.kill('SIGTERM'); } catch {}
    }
  };

  killChild(serverProcess);
  killChild(clientProcess);

  setTimeout(() => {
    process.exit(0);
  }, 500);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

serverProcess.on('exit', (code) => {
  if (!shuttingDown) {
    console.log(`\x1b[31m[server]\x1b[0m Server process exited with code ${code}`);
  }
});

clientProcess.on('exit', (code) => {
  if (!shuttingDown) {
    console.log(`\x1b[31m[client]\x1b[0m Client process exited with code ${code}`);
  }
});
