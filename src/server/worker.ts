import { createApp } from './app.ts';
import { D1Adapter } from './db.ts';

const app = createApp(bindings => {
  if (!bindings.DB) throw new Error('T06 D1 DB binding is missing');
  return new D1Adapter(bindings.DB);
});
app.get('*', c => {
  if (!c.env.ASSETS) return c.json({ error: '화면 파일이 배포되지 않았습니다.' }, 503);
  return c.env.ASSETS.fetch(c.req.raw);
});
export default app;
