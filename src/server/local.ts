import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { resolve } from 'node:path';
import { createApp } from './app.ts';
import { LocalDatabase, projectRoot } from './local-db.ts';

const db = new LocalDatabase(process.env.T06_DB_PATH);
const app = createApp(db);
app.get('*', serveStatic({ root: resolve(projectRoot, 'dist') }));
app.get('*', serveStatic({ path: resolve(projectRoot, 'dist/index.html') }));
const port = Number(process.env.T06_PORT ?? 3006);
const server = serve({ fetch: app.fetch, port, hostname: '127.0.0.1' }, () => console.log(`T06 ready: http://127.0.0.1:${port} (server SQLite)`));
const close = () => server.close(() => { db.close(); process.exit(0); });
process.on('SIGINT', close);
process.on('SIGTERM', close);
