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
    INSERT INTO games (game_id, date, image, summary, name, name_cn, tags, rank, score, time, localpath)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?,?);
    `,
    [
      game.game_id,
      game.date,
      game.image,
      game.summary,
      game.name,
      game.name_cn,
      JSON.stringify(game.tags),
      game.rank,
      game.score,
      game.time,
      game.localpath
    ]
  );
}

// 获取所有游戏数据
export async function getGames(sortOption = 'addtime', sortOrder: 'asc' | 'desc' = 'asc'): Promise<GameData[]> {
  const db = await getDb();
  const { sortField, sortDirection, customSortSql } = getSortConfig(sortOption, sortOrder);
  
  let query = `
    SELECT id, game_id, date, image, summary, name, name_cn, tags, rank, score, time, localpath FROM games
  `;
  
  if (customSortSql) {
    query += ` ${customSortSql};`;
  } else {
    query += ` ORDER BY ${sortField} ${sortDirection};`;
  }
  
  const rows = await db.select<GameData[]>(query);
  return processGameRows(rows);
}

// 按 game_id 文本标识查找游戏数据
export async function getGameByGameId(gameId: string): Promise<GameData> {
  const db = await getDb();
  const rows = await db.select<GameData[]>(`
    SELECT id, game_id, date, image, summary, name, name_cn, tags, rank, score, time, localpath
    FROM games 
    WHERE game_id = ? 
    LIMIT 1;
  `, [gameId]);

  if (!rows || rows.length === 0) {
    throw new Error('未找到对应的游戏数据');
  }

  const [game] = processGameRows(rows);
  return game;
}

// 删除游戏记录
export async function deleteGame(gameId: string) {
  const db = await getDb();
  await db.execute("DELETE FROM games WHERE game_id = ?;", [gameId]);
}

// 搜索游戏数据，根据name_cn或name进行搜索
export async function searchGames(
  keyword: string,
  sortOption = 'addtime',
  sortOrder: 'asc' | 'desc' = 'asc'
): Promise<GameData[]> {
  // 如果关键字为空，返回所有游戏
  if (!keyword || keyword.trim() === '') {
    return getGames(sortOption, sortOrder);
  }

  const db = await getDb();
  const { sortField, sortDirection, customSortSql } = getSortConfig(sortOption, sortOrder);

  // 使用LIKE进行模糊搜索
  const searchKeyword = `%${keyword}%`;
  let query = `
    SELECT id, game_id, date, image, summary, name, name_cn, tags, rank, score, time, localpath 
    FROM games
    WHERE 
      (name_cn LIKE ? OR (name_cn IS NULL OR name_cn = '') AND name LIKE ?)
      OR name LIKE ?
  `;
  
  if (customSortSql) {
    query += ` ${customSortSql};`;
  } else {
    query += ` ORDER BY ${sortField} ${sortDirection};`;
  }
  
  const rows = await db.select<GameData[]>(query, [searchKeyword, searchKeyword, searchKeyword]);
  return processGameRows(rows);
}