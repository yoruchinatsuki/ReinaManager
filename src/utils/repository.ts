import type { GameData } from '@/types';
import { getDb } from './database';

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

// 获取所有游戏数据，判断 tags 是否为 JSON 字符串，如果是则解析，否则直接返回
export async function getGames(sortOption = 'addtime', sortOrder: 'asc' | 'desc' = 'asc'): Promise<GameData[]> {
  const db = await getDb();
  
  // 映射排序选项到对应的数据库字段
  let sortField: string;
  let sortDirection = sortOrder.toUpperCase();
  
  switch (sortOption) {
    case 'addtime':
      sortField = 'id'; // id 越大表示添加时间越近
      break;
    case 'datetime':
      sortField = 'date';
      break;
    case 'rank':
      sortField = 'rank'; // 使用 rank 字段
      // 对 rank 特殊处理：rank 数值小的表示排名好，总是应该在前面
      // 因此 desc 排序应该反过来使用 asc 排序
      sortDirection = sortOrder.toUpperCase() === 'DESC' ? 'ASC' : 'DESC';
      break;
    default:
      sortField = 'id';
  }
  
  const rows = await db.select<GameData[]>(`
    SELECT id, game_id, date, image, summary, name, name_cn, tags, rank, score, time, localpath FROM games
    ORDER BY ${sortField} ${sortDirection};
  `);
  
  return rows.map(row => ({
    ...row,
    tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags
  }));
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

  const game = rows[0];
  return {
    ...game,
    tags: typeof game.tags === 'string' ? JSON.parse(game.tags) : game.tags
  };
}
// 示例：删除游戏记录
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
  
  // 处理排序方式，与getGames保持一致
  let sortField: string;
  let sortDirection = sortOrder.toUpperCase();
  
  switch (sortOption) {
    case 'addtime':
      sortField = 'id';
      break;
    case 'datetime':
      sortField = 'date';
      break;
    case 'rank':
      sortField = 'rank';
      sortDirection = sortOrder.toUpperCase() === 'DESC' ? 'ASC' : 'DESC';
      break;
    default:
      sortField = 'id';
  }

  // 使用LIKE进行模糊搜索，优先搜索name_cn，为空则搜索name
  const searchKeyword = `%${keyword}%`;
  const rows = await db.select<GameData[]>(`
    SELECT id, game_id, date, image, summary, name, name_cn, tags, rank, score, time ,localpath 
    FROM games
    WHERE 
      (name_cn LIKE ? OR (name_cn IS NULL OR name_cn = '') AND name LIKE ?)
      OR name LIKE ?
    ORDER BY ${sortField} ${sortDirection};
  `, [searchKeyword, searchKeyword, searchKeyword]);
  
  return rows.map(row => ({
    ...row,
    tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags
  }));
}