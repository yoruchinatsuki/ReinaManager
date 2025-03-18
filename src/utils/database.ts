import Database  from '@tauri-apps/plugin-sql';
import { exists, BaseDirectory,mkdir } from '@tauri-apps/plugin-fs';


export async function initDatabase() {
  const appDataExists = await exists('', { baseDir: BaseDirectory.AppData });
    if (!appDataExists) {
      // 创建应用数据文件夹
      await mkdir('', { baseDir: BaseDirectory.AppData, recursive: true });
      console.log('Created app data directory');
    }

 const existsdata= await exists('data', { baseDir: BaseDirectory.AppData });
  if(!existsdata){
    await mkdir('data', {
  baseDir: BaseDirectory.AppData,
});
}

  // 加载 SQLite 数据库，如果不存在则会自动创建
  const db = await Database.load('sqlite:data/reina_manager.db');

  // 创建存储游戏数据的表，注意将 tags 以 JSON 字符串形式存储
  await db.execute(`
    CREATE TABLE IF NOT EXISTS games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_id TEXT,
      date TEXT,
      image TEXT,
      summary TEXT,
      name TEXT,
      name_cn TEXT,
      tags TEXT,
      rank INTEGER,
      score REAL,
      time TEXT,
      localpath TEXT
    );
  `);

  // 创建 user 表，仅存储一条记录，用于保存 BGM_TOKEN
  await db.execute(`
    CREATE TABLE IF NOT EXISTS user (
      id INTEGER PRIMARY KEY,
      BGM_TOKEN TEXT
    );
  `);

  return db;
}

let dbInstance: Database | null = null;

export async function getDb() {
  if (!dbInstance) {
    dbInstance = await initDatabase();
  }
  return dbInstance;
}