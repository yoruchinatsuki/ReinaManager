import type { GameData } from '@/types/index';
import { getDb } from './database';



// 插入游戏数据，将 tags 序列化存储
export async function insertGame(game: GameData) {
  const db = await getDb();
  await db.execute(
    `
    INSERT INTO games (id, date, image, summary, name, name_cn, tags, rank, score)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
    `,
    [
      game.id,
      game.date,
      game.image,
      game.summary,
      game.name,
      game.name_cn,
      JSON.stringify(game.tags),
      game.rank,
      game.score
    ]
  );
}

// 获取所有游戏数据，判断 tags 是否为 JSON 字符串，如果是则解析，否则直接返回
export async function getGames(): Promise<GameData[]> {
  const db = await getDb();
  const rows = await db.select<GameData[]>(`
    SELECT id, date, image, summary, name, name_cn, tags, rank, score FROM games;
  `);
  return rows.map(row => ({
    ...row,
    tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags
  }));
}

// 查找指定 ID 的游戏数据
export async function getGameById(gameId: number): Promise<GameData> {
  const db = await getDb();
  const rows = await db.select<GameData[]>(`
    SELECT id, date, image, summary, name, name_cn, tags, rank, score 
    FROM games 
    WHERE id = ? 
    LIMIT 1;
  `, [gameId]);

  const game = rows[0];
  return {
    ...game,
    tags: typeof game.tags === 'string' ? JSON.parse(game.tags) : game.tags
  };
}
// 示例：删除游戏记录
export async function deleteGame(gameId: number) {
  const db = await getDb();
  await db.execute("DELETE FROM games WHERE id = ?;", [gameId]);
}