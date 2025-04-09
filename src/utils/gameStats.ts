import { listen } from '@tauri-apps/api/event';
import { invoke, isTauri } from '@tauri-apps/api/core';
import { getDb } from './database';
import { getIdType } from './repository';
import type { GameSession, GameStatistics, GameTimeStats } from '../types';

// 类型定义
export type TimeUpdateCallback = (gameId: string, minutes: number) => void;
export type SessionEndCallback = (gameId: string, minutes: number) => void;

// 格式化游戏时间
export function formatPlayTime(minutes: number): string {
  if (!minutes) return '0分钟';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}分钟`;
  }
  
  return `${hours}小时${mins > 0 ? `${mins}分钟` : ''}`;
}

// 记录游戏会话
export async function recordGameSession(
  gameId: string, 
  minutes: number, 
  startTime: number, 
  endTime: number,
): Promise<number> {
  const db = await getDb();
  const idParts = getIdType(gameId);
  
  if (!idParts || idParts.type === 'unknown' || !idParts.params[0]) {
    console.error(`无效的游戏ID: ${gameId}`);
    return -1;
  }
  
  const refId = idParts.params[0];
  const idType = idParts.type;
  
  // 当前日期，格式YYYY-MM-DD
  const date = new Date(endTime * 1000).toISOString().split('T')[0];
  
  try {
    // 插入游戏会话记录
    const result = await db.execute(
      `INSERT INTO game_sessions (
        game_ref_id, id_type, start_time, end_time, duration, date
      ) VALUES (?, ?, ?, ?, ?, ?);`,
      [refId, idType, startTime, endTime, minutes, date],
    );
    
    // 更新统计信息
    await updateGameStatistics(refId, idType);
    
    return result.lastInsertId ?? -1;
  } catch (error) {
    console.error('记录游戏会话失败:', error);
    throw error;
  }
}

// 更新游戏统计信息
export async function updateGameStatistics(gameRefId: string, idType: 'bgm' | 'vndb'): Promise<void> {
  const db = await getDb();
  
  try {
    // 计算总游戏时间和会话数
    const stats = await db.select<{
      total_time: number;
      session_count: number;
      last_played: number;
    }[]>(`
      SELECT 
        COALESCE(SUM(duration), 0) as total_time, 
        COUNT(*) as session_count,
        MAX(end_time) as last_played
      FROM game_sessions 
      WHERE game_ref_id = ? AND id_type = ?;
    `, [gameRefId, idType]);
    
    // 计算每日统计数据
    const dailyStats = await db.select<{
      date: string;
      duration: number;
    }[]>(`
      SELECT 
        date, 
        SUM(duration) as duration
      FROM game_sessions 
      WHERE game_ref_id = ? AND id_type = ?
      GROUP BY date
      ORDER BY date DESC;
    `, [gameRefId, idType]);
    
    // 转换为数组套对象格式
    const dailyStatsArray = dailyStats.map(({ date, duration }) => ({
      date,
      playtime: duration
    }));
    
    // 更新统计表
    await db.execute(
      `REPLACE INTO game_statistics 
       (game_ref_id, id_type, total_time, session_count, last_played, daily_stats)
       VALUES (?, ?, ?, ?, ?, ?);`,
      [
        gameRefId,
        idType,
        stats[0]?.total_time || 0,
        stats[0]?.session_count || 0,
        stats[0]?.last_played || null,
        JSON.stringify(dailyStatsArray),
      ]
    );
  } catch (error) {
    console.error('更新游戏统计失败:', error);
    throw error;
  }
}

// 获取游戏统计信息
export async function getGameStatistics(gameId: string): Promise<GameStatistics | null> {
  const db = await getDb();
  const idInfo = getIdType(gameId);
  
  if (!idInfo || idInfo.type === 'unknown' || !idInfo.params[0]) {
    return null;
  }
  
  const refId = idInfo.params[0];
  const idType = idInfo.type;
  
  const stats = await db.select<GameStatistics[]>(
    'SELECT * FROM game_statistics WHERE game_ref_id = ? AND id_type = ?;',
    [refId, idType],
  );
  
  if (stats.length === 0) {
    return null;
  }
  
  const result = stats[0];
  
  // 解析JSON存储的每日统计数据
  if (typeof result.daily_stats === 'string') {
    try {
      const parsedStats = JSON.parse(result.daily_stats);
      
      // 兼容旧格式 - 如果是对象格式，转换为新的数组格式
      if (parsedStats && !Array.isArray(parsedStats)) {
        result.daily_stats = Object.entries(parsedStats).map(([date, minutes]) => ({
          date,
          playtime: minutes as number
        }));
      } else {
        result.daily_stats = parsedStats;
      }
    } catch (e) {
      console.error('解析游戏统计数据失败:', e);
      result.daily_stats = [];
    }
  }
  
  return result;
}

// 获取今天的游戏时间
export async function getTodayGameTime(gameId: string): Promise<number> {
  const stats = await getGameStatistics(gameId);
  const today = new Date().toISOString().split('T')[0];
  
  if (!stats || !stats.daily_stats) {
    return 0;
  }
  
  // 在数组中查找今天的记录
  const todayRecord = stats.daily_stats.find(record => record.date === today);
  return todayRecord?.playtime || 0;
}

// 获取游戏会话历史
export async function getGameSessions(
  gameId: string, 
  limit = 10, 
  offset = 0,
): Promise<GameSession[]> {
  const db = await getDb();
  const idInfo = getIdType(gameId);
  
  if (!idInfo || idInfo.type === 'unknown' || !idInfo.params[0]) {
    return [];
  }
  
  const refId = idInfo.params[0];
  const idType = idInfo.type;
  
  const sessions = await db.select<GameSession[]>(
    `
    SELECT * FROM game_sessions
    WHERE game_ref_id = ? AND id_type = ?
    ORDER BY start_time DESC
    LIMIT ? OFFSET ?;
    `,
    [refId, idType, limit, offset],
  );
  
  return sessions;
}

// 获取格式化的游戏时间统计
export async function getFormattedGameStats(gameId: string): Promise<GameTimeStats> {
  const stats = await getGameStatistics(gameId);
  const todayMinutes = await getTodayGameTime(gameId);
  
  return {
    totalPlayTime: formatPlayTime(stats?.total_time || 0),
    totalMinutes: stats?.total_time || 0,
    todayPlayTime: formatPlayTime(todayMinutes),
    todayMinutes,
    sessionCount: stats?.session_count || 0,
    lastPlayed: stats?.last_played ? new Date(stats.last_played * 1000) : null,
    daily_stats: stats?.daily_stats || [],
  };
}

// 初始化游戏时间跟踪
export function initGameTimeTracking(
  onTimeUpdate?: TimeUpdateCallback,
  onSessionEnd?: SessionEndCallback,
): () => void {
  if (!isTauri()) return () => {};

  // 游戏会话开始
  const unlistenStart = listen<{gameId: string; processId: number; startTime: number}>(
    'game-session-started',
    async (event) => {
      const { gameId } = event.payload;
      
      try {
        // 更新会话计数
        const db = await getDb();
        const idInfo = getIdType(gameId);
        
        if (!idInfo || idInfo.type === 'unknown' || !idInfo.params[0]) {
          return;
        }
        
        const refId = idInfo.params[0];
        const idType = idInfo.type;
        
        await db.execute(`
          INSERT INTO game_statistics 
          (game_ref_id, id_type, total_time, session_count, last_played) 
          VALUES (?, ?, 0, 1, ?)
          ON CONFLICT(game_ref_id, id_type) DO UPDATE SET
          session_count = session_count + 1,
          last_played = excluded.last_played;
        `, [refId, idType, Math.floor(Date.now() / 1000)]);
      } catch (error) {
        console.error('增加游戏会话计数失败:', error);
      }
    }
  );

// 游戏时间更新事件监听
const unlistenUpdate = listen<{gameId: string; totalMinutes: number; processId: number}>(
  'game-time-update',
  async (event) => {
    const { gameId } = event.payload;
    
    try {
      // 实时更新数据库中的总时间
      const db = await getDb();
      const idInfo = getIdType(gameId);
      
      if (!idInfo || idInfo.type === 'unknown' || !idInfo.params[0]) {
        return;
      }
      
      const refId = idInfo.params[0];
      const idType = idInfo.type;
      const today = new Date().toISOString().split('T')[0];
      
      // 先获取当前统计数据
      const currentStats = await db.select<{daily_stats: string}[]>(
        'SELECT daily_stats FROM game_statistics WHERE game_ref_id = ? AND id_type = ?;',
        [refId, idType]
      );
      
      let dailyStats: Array<{date: string; playtime: number}> = [];
      
      // 如果有现有数据，解析它
      if (currentStats.length > 0 && currentStats[0].daily_stats) {
        try {
          const parsed = JSON.parse(currentStats[0].daily_stats);
          
          // 兼容旧版格式
          if (Array.isArray(parsed)) {
            dailyStats = parsed;
          } else {
            // 旧的对象格式，转换为数组
            dailyStats = Object.entries(parsed).map(([date, minutes]) => ({
              date,
              playtime: minutes as number
            }));
          }
        } catch (e) {
          console.error('解析游戏统计数据失败:', e);
        }
      }
      
      // 查找今天的记录
      const todayIndex = dailyStats.findIndex(item => item.date === today);
      
      if (todayIndex >= 0) {
        // 已有今天的记录，更新它
        dailyStats[todayIndex].playtime += 1;
      } else {
        // 添加今天的新记录
        dailyStats.push({ date: today, playtime: 1 });
      }
      
      // 更新游戏统计
      await db.execute(
        `UPDATE game_statistics 
         SET 
           total_time = COALESCE(total_time, 0) + 1,
           daily_stats = ?
         WHERE game_ref_id = ? AND id_type = ?;`,
        [JSON.stringify(dailyStats), refId, idType]
      );
      
      // 调用回调函数
      if (onTimeUpdate) {
        onTimeUpdate(event.payload.gameId, event.payload.totalMinutes);
      }
    } catch (error) {
      console.error('更新游戏实时统计失败:', error);
    }
  }
);

  // 游戏会话结束
  const unlistenEnd = listen<{gameId: string; totalMinutes: number; startTime: number; endTime: number; processId: number}>(
    'game-session-ended',
    async (event) => {
      const { gameId, totalMinutes, startTime, endTime } = event.payload;
      
      try {
        // 记录完整的游戏会话
        await recordGameSession(gameId, totalMinutes, startTime, endTime);
        
        // 调用回调函数
        if (onSessionEnd) {
          onSessionEnd(gameId, totalMinutes);
        }
      } catch (error) {
        console.error('处理游戏结束事件失败:', error);
      }
    }
  );

  // 返回清理函数
  return () => {
    unlistenStart.then(fn => fn());
    unlistenUpdate.then(fn => fn());
    unlistenEnd.then(fn => fn());
  };
}

// 启动游戏并开始监控
export async function launchGameWithTracking(
  gamePath: string, 
  gameId: string, 
  args?: string[],
): Promise<{success: boolean; message: string; process_id?: number}> {
  try {
    const result = await invoke<{success: boolean; message: string; process_id?: number}>('launch_game', { 
      gamePath, 
      gameId,  
      args: args || [],
    });
    
    return result;
  } catch (error) {
    const errorMessage = typeof error === 'string' ? error : 'Unknown error occurred';
    throw new Error(errorMessage);
  }
}

// 获取游戏时间统计趋势数据（按日期）
// export async function getGameTimeTrend(
//   gameId: string,
//   days = 7,
// ): Promise<{date: string; playtime: number}[]> {
//   const db = await getDb();
//   const idInfo = getIdType(gameId);
  
//   if (!idInfo || idInfo.type === 'unknown' || !idInfo.params[0]) {
//     return [];
//   }
  
//   const refId = idInfo.params[0];
//   const idType = idInfo.type;
  
//   // 计算起始日期
//   const endDate = new Date();
//   const startDate = new Date();
//   startDate.setDate(startDate.getDate() - days + 1);
  
//   const startDateStr = startDate.toISOString().split('T')[0];
//   const endDateStr = endDate.toISOString().split('T')[0];
  
//   // 查询日期范围内的游戏时间
//   interface TrendResult {
//     date: string;
//     duration: number;
//   }

//   const results = await db.select<TrendResult[]>(
//     `
//     SELECT 
//       date, 
//       SUM(duration) as duration
//     FROM game_sessions 
//     WHERE game_ref_id = ? AND id_type = ? AND date >= ? AND date <= ?
//     GROUP BY date
//     ORDER BY date ASC;
//     `,
//     [refId, idType, startDateStr, endDateStr],
//   );
  
//   // 生成完整的日期范围数据（包括无数据的日期）
//   const trend: {date: string; playtime: number}[] = [];
//   const dateMap = new Map(results.map(item => [item.date, item.duration]));
  
//   for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
//     const dateStr = d.toISOString().split('T')[0];
//     trend.push({
//       date: dateStr,
//       playtime: dateMap.get(dateStr) || 0,
//     });
//   }
  
//   return trend;
// }