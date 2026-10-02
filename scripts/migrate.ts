import { LocalDatabase } from '../src/server/local-db.ts';
const db = new LocalDatabase(process.env.T06_DB_PATH);
db.close();
console.log('T06 서버 SQLite 마이그레이션 완료.');
