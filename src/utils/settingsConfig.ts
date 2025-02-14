import { getDb } from "./database";

// 读取 BGM_TOKEN
export async function getBgmTokenRepository(): Promise<string> {
  const db = await getDb();
  const rows = await db.select<{ BGM_TOKEN: string }>(`
    SELECT BGM_TOKEN FROM user WHERE id = 1 LIMIT 1;
  `);
  if (Array.isArray(rows) && rows.length > 0 && typeof rows[0].BGM_TOKEN === 'string') {
    return rows[0].BGM_TOKEN;
  }
  return "";
}

// 保存 BGM_TOKEN，id 固定为 1
export async function setBgmTokenRepository(token: string): Promise<void> {
  const db = await getDb();
  await db.execute(
    `
    INSERT OR REPLACE INTO user (id, BGM_TOKEN)
    VALUES (1, ?);
    `,
    [token]
  )
}