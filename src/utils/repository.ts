import type { GameData } from '@/types/index';
import { getDb } from './database';



// 插入游戏数据，将 tags 序列化存储
export async function insertGame(game: GameData) {
  const db = await getDb();
  await db.execute(
    `
    INSERT INTO games (game_id, date, image, summary, name, name_cn, tags, rank, score, time)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?);
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
      game.time
    ]
  );
}

// 获取所有游戏数据，判断 tags 是否为 JSON 字符串，如果是则解析，否则直接返回
export async function getGames(): Promise<GameData[]> {
  const db = await getDb();
  const rows = await db.select<GameData[]>(`
    SELECT id, game_id, date, image, summary, name, name_cn, tags, rank, score, time FROM games;
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
    SELECT id, game_id, date, image, summary, name, name_cn, tags, rank, score, time
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