import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const directory = mkdtempSync(join(tmpdir(), 't06-browser-'));
const child = spawn(process.execPath, ['--import', 'tsx', 'src/server/local.ts'], {
  stdio: 'inherit', env: { ...process.env, T06_PORT: '3106', T06_DB_PATH: join(directory, 'test.sqlite'), NODE_ENV: 'production' },
});
let closing = false;
function close() { if (!closing) { closing = true; child.kill(); } }
child.on('exit', code => { rmSync(directory, { recursive: true, force: true }); process.exit(code ?? 0); });
process.on('SIGINT', close); process.on('SIGTERM', close);
