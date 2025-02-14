import Database  from '@tauri-apps/plugin-sql';

export async function initDatabase() {
  // 加载 SQLite 数据库，如果不存在则会自动创建
  const db = await Database.load('sqlite:data/reina_manager.db');

  // 创建存储游戏数据的表，注意将 tags 以 JSON 字符串形式存储
  await db.execute(`
    CREATE TABLE IF NOT EXISTS games (
      id INTEGER PRIMARY KEY,
      date TEXT,
      image TEXT,
      summary TEXT,
      name TEXT,
      name_cn TEXT,
      tags TEXT,
      rank INTEGER,
      score REAL
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