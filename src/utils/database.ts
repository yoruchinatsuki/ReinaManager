import Database  from '@tauri-apps/plugin-sql';
import { exists, BaseDirectory,mkdir,remove,copyFile } from '@tauri-apps/plugin-fs';


export async function initDatabase() {
  const appDataExists = await exists('', { baseDir: BaseDirectory.AppData });
    if (!appDataExists) {
      // 创建应用数据文件夹
      await mkdir('', { baseDir: BaseDirectory.AppData, recursive: true });
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
      bgm_id TEXT,
      vndb_id TEXT,
      date TEXT,
      image TEXT,
      summary TEXT,
      name TEXT,
      name_cn TEXT,
      tags TEXT,
      rank INTEGER,
      score REAL,
      time TEXT,
      localpath TEXT,
      developer TEXT,
      all_titles TEXT,
      aveage_hours REAL
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

export async function backupDatabase(): Promise<string> {
  // 生成带时间戳的备份文件名
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupName = `reina_manager_${timestamp}.db`;
  const backupPath = `data/backups/${backupName}`;
  
  try {
    // 确保备份目录存在
    await mkdir('data/backups', { baseDir: BaseDirectory.AppData, recursive: true });
    
    // 关闭当前连接
    if (dbInstance) {
      await dbInstance.close();
      dbInstance = null;
    }
    
    // 复制数据库文件
    await copyFile(
      'data/reina_manager.db', 
      backupPath, 
      { fromPathBaseDir: BaseDirectory.AppData ,
      toPathBaseDir: BaseDirectory.AppData}
    );
    
    console.log(`数据库已备份到: ${backupPath}`);
    return backupPath;
  } catch (error) {
    console.error('备份数据库失败:', error);
    throw error;
  } finally {
    // 重新连接数据库
    dbInstance = await getDb();
  }
}

// 2. 重置数据库函数
export async function resetDatabase(): Promise<void> {
  try {
    // 先备份当前数据库
    await backupDatabase();
    
    // 关闭连接
    if (dbInstance) {
      await dbInstance.close();
      dbInstance = null;
    }
    
    // 删除当前数据库
    await remove('data/reina_manager.db', { baseDir: BaseDirectory.AppData });
    
    // 重新初始化，会创建全新数据库
    dbInstance = await initDatabase();
    console.log('数据库已重置');
  } catch (error) {
    console.error('重置数据库失败:', error);
    throw error;
  }
}