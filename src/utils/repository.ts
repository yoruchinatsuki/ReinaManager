import type { GameData } from '@/types';
import { getDb } from './database';

// 处理排序选项的工具函数
function getSortConfig(sortOption = 'addtime', sortOrder: 'asc' | 'desc' = 'asc') {
  let sortField = 'id';  
  const sortDirection = sortOrder.toUpperCase();
  let customSortSql = '';
  
  switch (sortOption) {
    case 'addtime':
      sortField = 'id';
      break;
    case 'datetime':
      sortField = 'date';
      break;
    case 'rank':
      // 修正的综合排序逻辑：
      // 1. 首先按评分排序 - 遵循用户选择的排序方向
      // 2. 对于评分相同的游戏，再按排名排序 - 注意排名低的数值小
      if (sortOrder.toUpperCase() === 'DESC') {
        // 降序排列：高分在前，同分时排名好的在前
        customSortSql = `ORDER BY 
          score DESC, 
          CASE 
            WHEN rank IS NULL OR rank = 0 THEN 999999 
            ELSE rank 
          END ASC`;
      } else {
        // 升序排列：低分在前，同分时排名差的在前
        customSortSql = `ORDER BY 
          score ASC, 
          CASE 
            WHEN rank IS NULL OR rank = 0 THEN -1
            ELSE rank 
          END DESC`;
      }
      break;
    default:
      sortField = 'id';
  }
  
  return { sortField, sortDirection, customSortSql };
}

// 处理查询结果的工具函数
function processGameRows(rows: GameData[]): GameData[] {
  return rows.map(row => ({
    ...row,
    tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags
  }));
}

// 插入游戏数据，将 tags 序列化存储
export async function insertGame(game: GameData) {
  const db = await getDb();
  await db.execute(
    `
    INSERT INTO games (bgm_id,vndb_id,id_type, date, image, summary, name, name_cn, tags, rank, score, time, localpath,developer,all_titles,aveage_hours)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?,?,?,?,?);
    `,
    [
      game.bgm_id,
      game.vndb_id,
      game.id_type,
      game.date,
      game.image,
      game.summary,
      game.name,
      game.name_cn,
      JSON.stringify(game.tags),
      game.rank,
      game.score,
      game.time,
      game.localpath,
      game.developer,
      JSON.stringify(game.all_titles),
      game.aveage_hours
    ]
  );
}

// 获取所有游戏数据
export async function getGames(sortOption = 'addtime', sortOrder: 'asc' | 'desc' = 'asc'): Promise<GameData[]> {
  const db = await getDb();
  const { sortField, sortDirection, customSortSql } = getSortConfig(sortOption, sortOrder);
  
  let query = `
    SELECT id, bgm_id,vndb_id, date, image, summary, name, name_cn, tags, rank, score, time, localpath,developer,all_titles,aveage_hours FROM games
  `;
  
  if (customSortSql) {
    query += ` ${customSortSql};`;
  } else {
    query += ` ORDER BY ${sortField} ${sortDirection};`;
  }
  
  const rows = await db.select<GameData[]>(query);
  return processGameRows(rows);
}

// // 通过外部ID(bgm_id或vndb_id)查找内部ID
// export async function getInternalIdByExternalId(externalId: string): Promise<number | null> {
//   const db = await getDb();
//   let query: string;
//   let params: string[];
  
//   if (externalId.startsWith('v')) {
//     // vndb格式ID
//     query = "SELECT id FROM games WHERE vndb_id = ? LIMIT 1";
//     params = [externalId];
//   } else {
//     // 假设是bgm格式ID
//     query = "SELECT id FROM games WHERE bgm_id = ? LIMIT 1";
//     params = [externalId];
//   }
  
//   const result = await db.select<{id: number}[]>(query, params);
//   return result.length > 0 ? result[0].id : null;
// }

// 通过内部ID获取游戏数据
export async function getGameById(id: number): Promise<GameData | null> {
  const db = await getDb();
  const rows = await db.select<GameData[]>(`
    SELECT * FROM games WHERE id = ? LIMIT 1;
  `, [id]);
  
  if (rows.length === 0) return null;
  return processGameRows(rows)[0];
}

// // 按 game_id 文本标识查找游戏数据 - 修改为使用内部ID
// export async function getGameByGameId(gameId: string): Promise<GameData | null> {
//   const internalId = await getInternalIdByExternalId(gameId);
//   if (internalId === null) return null;
//   return getGameById(internalId);
// }

// 删除游戏记录 
export async function deleteGame(gameId: number) {
  const db = await getDb();
  // 删除相关的会话记录和统计数据
  await db.execute("DELETE FROM game_sessions WHERE game_id = ?", [gameId]);
  await db.execute("DELETE FROM game_statistics WHERE game_id = ?", [gameId]);  
  //删除游戏数据
  await db.execute("DELETE FROM games WHERE id = ?", [gameId]);
}

// 更新搜索游戏函数，添加类型筛选功能
export async function searchGames(
  keyword: string,
  type: 'all' | 'local' | 'online' = 'all',
  sortOption = 'addtime',
  sortOrder: 'asc' | 'desc' = 'asc'
): Promise<GameData[]> {
  // 关键字为空且不筛选类型时，返回所有游戏
  if ((!keyword || keyword.trim() === '') && type === 'all') {
    return getGames(sortOption, sortOrder);
  }

  // 关键字为空但需要筛选类型时
  if ((!keyword || keyword.trim() === '') && type !== 'all') {
    return filterGamesByType(type, sortOption, sortOrder);
  }

  const db = await getDb();
  const { sortField, sortDirection, customSortSql } = getSortConfig(sortOption, sortOrder);

  // 构建类型筛选条件
  let filterCondition = '';
  if (type === 'local') {
    filterCondition = 'AND (localpath IS NOT NULL AND localpath != "")';
  } else if (type === 'online') {
    filterCondition = 'AND (localpath IS NULL OR localpath = "")';
  }

  // 使用LIKE进行模糊搜索
  const searchKeyword = `%${keyword}%`;
  let query = `
    SELECT id, bgm_id,vndb_id, date, image, summary, name, name_cn, tags, rank, score, time, localpath,developer,all_titles,aveage_hours
    FROM games
    WHERE 
      ((name_cn LIKE ? OR (name_cn IS NULL OR name_cn = '') AND name LIKE ?)
      OR name LIKE ?)
      ${filterCondition}
  `;
  
  if (customSortSql) {
    query += ` ${customSortSql};`;
  } else {
    query += ` ORDER BY ${sortField} ${sortDirection};`;
  }
  
  const rows = await db.select<GameData[]>(query, [searchKeyword, searchKeyword, searchKeyword]);
  return processGameRows(rows);
}

// 根据游戏类型进行筛选（全部/本地/网络）
export async function filterGamesByType(
  type: 'all' | 'local' | 'online',
  sortOption = 'addtime',
  sortOrder: 'asc' | 'desc' = 'asc'
): Promise<GameData[]> {
  if (type === 'all') {
    return getGames(sortOption, sortOrder);
  }
  
  const db = await getDb();
  const { sortField, sortDirection, customSortSql } = getSortConfig(sortOption, sortOrder);
  
  let filterCondition = '';
  if (type === 'local') {
    filterCondition = 'WHERE localpath IS NOT NULL AND localpath != ""';
  } else if (type === 'online') {
    filterCondition = 'WHERE localpath IS NULL OR localpath = ""';
  }
  
  let query = `
    SELECT id, bgm_id,vndb_id, date, image, summary, name, name_cn, tags, rank, score, time, localpath,developer,all_titles,aveage_hours
    FROM games
    ${filterCondition}
  `;
  
  if (customSortSql) {
    query += ` ${customSortSql};`;
  } else {
    query += ` ORDER BY ${sortField} ${sortDirection};`;
  }
  
  const rows = await db.select<GameData[]>(query);
  return processGameRows(rows);
}