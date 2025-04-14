import { listen } from '@tauri-apps/api/event';
import { invoke, isTauri } from '@tauri-apps/api/core';
import { getDb } from './database';
import type { GameSession, GameStatistics, GameTimeStats } from '../types';

// 类型定义
export type TimeUpdateCallback = (gameId: number, minutes: number) => void;
export type SessionEndCallback = (gameId: number, minutes: number) => void;

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

// 记录游戏会话 - 直接使用内部ID
export async function recordGameSession(
  gameId: number, // 改为number类型
  minutes: number, 
  startTime: number, 
  endTime: number,
): Promise<number> {
  const db = await getDb();
  
  // 当前日期，格式YYYY-MM-DD
  const date = new Date(endTime * 1000).toISOString().split('T')[0];
  
  try {
    // 插入游戏会话记录
    const result = await db.execute(
      `INSERT INTO game_sessions (
        game_id, start_time, end_time, duration, date
      ) VALUES (?, ?, ?, ?, ?);`,
      [gameId, startTime, endTime, minutes, date],
    );
    
    // 更新统计信息
    await updateGameStatistics(gameId);
    
    return result.lastInsertId ?? -1;
  } catch (error) {
    console.error('记录游戏会话失败:', error);
    throw error;
  }
}

// 更新游戏统计信息 - 直接使用内部ID
export async function updateGameStatistics(gameId: number): Promise<void> {
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
      WHERE game_id = ?;
    `, [gameId]);
    
    // 计算每日统计数据
    const dailyStats = await db.select<{
      date: string;
      duration: number;
    }[]>(`
      SELECT date, SUM(duration) as duration
      FROM game_sessions 
      WHERE game_id = ?
      GROUP BY date
      ORDER BY date DESC;
    `, [gameId]);
    
    // 转换为数组套对象格式
    const dailyStatsArray = dailyStats.map(({ date, duration }) => ({
      date,
      playtime: duration
    }));
    
    // 更新统计表
    await db.execute(
      `REPLACE INTO game_statistics 
       (game_id, total_time, session_count, last_played, daily_stats)
       VALUES (?, ?, ?, ?, ?);`,
      [
        gameId,
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

// 获取游戏统计信息 - 直接使用内部ID
export async function getGameStatistics(gameId: number): Promise<GameStatistics | null> {
  const db = await getDb();
  
  const stats = await db.select<GameStatistics[]>(
    'SELECT * FROM game_statistics WHERE game_id = ?;',
    [gameId],
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

// 获取今天的游戏时间 - 直接使用内部ID
export async function getTodayGameTime(gameId: number): Promise<number> {
  const stats = await getGameStatistics(gameId);
  const today = new Date().toISOString().split('T')[0];
  
  if (!stats || !stats.daily_stats) {
    return 0;
  }
  
  // 在数组中查找今天的记录
  const todayRecord = stats.daily_stats.find(record => record.date === today);
  return todayRecord?.playtime || 0;
}

// 获取游戏会话历史 - 直接使用内部ID
export async function getGameSessions(
  gameId: number,
  limit = 10, 
  offset = 0,
): Promise<GameSession[]> {
  const db = await getDb();
  
  const sessions = await db.select<GameSession[]>(
    `
    SELECT * FROM game_sessions
    WHERE game_id = ?
    ORDER BY start_time DESC
    LIMIT ? OFFSET ?;
    `,
    [gameId, limit, offset],
  );
  
  return sessions;
}

// 获取格式化的游戏时间统计 - 直接使用内部ID
export async function getFormattedGameStats(gameId: number): Promise<GameTimeStats> {
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
  const unlistenStart = listen<{gameId: number; processId: number; startTime: number}>(
    'game-session-started',
    async (event) => {
      const { gameId } = event.payload;
      
      try {
        // 直接使用数字类型的gameId
        const db = await getDb();
        
        await db.execute(`
          INSERT INTO game_statistics 
          (game_id, total_time, session_count, last_played) 
          VALUES (?, 0, 1, ?)
          ON CONFLICT(game_id) DO UPDATE SET
          session_count = session_count + 1,
          last_played = excluded.last_played;
        `, [gameId, Math.floor(Date.now() / 1000)]);
      } catch (error) {
        console.error('增加游戏会话计数失败:', error);
      }
    }
  );

  // 游戏时间更新事件监听
  const unlistenUpdate = listen<{gameId: number; totalMinutes: number; processId: number}>(
    'game-time-update',
    async (event) => {
      const { gameId, totalMinutes } = event.payload;
      
      try {
        // 直接使用数字类型的gameId进行查询
        const db = await getDb();
        const today = new Date().toISOString().split('T')[0];
        
        // 获取当前统计数据
        const currentStats = await db.select<{daily_stats: string}[]>(
          'SELECT daily_stats FROM game_statistics WHERE game_id = ?;',
          [gameId]
        );
        
        let dailyStats: Array<{date: string; playtime: number}> = [];
        
        // 解析已有数据
        if (currentStats.length > 0 && currentStats[0].daily_stats) {
          try {
            const parsed = JSON.parse(currentStats[0].daily_stats);
            
            // 兼容旧版格式
            if (Array.isArray(parsed)) {
              dailyStats = parsed;
            } else {
              dailyStats = Object.entries(parsed).map(([date, minutes]) => ({
                date,
                playtime: minutes as number
              }));
            }
          } catch (e) {
            console.error('解析游戏统计数据失败:', e);
          }
        }
        
        // 更新今天的记录
        const todayIndex = dailyStats.findIndex(item => item.date === today);
        
        if (todayIndex >= 0) {
          dailyStats[todayIndex].playtime += 1;
        } else {
          dailyStats.push({ date: today, playtime: 1 });
        }
        
        // 更新统计
        await db.execute(
          `UPDATE game_statistics 
           SET 
             total_time = COALESCE(total_time, 0) + 1,
             daily_stats = ?
           WHERE game_id = ?;`,
          [JSON.stringify(dailyStats), gameId]
        );
        
        // 调用回调函数
        if (onTimeUpdate) {
          onTimeUpdate(gameId, totalMinutes);
        }
      } catch (error) {
        console.error('更新游戏实时统计失败:', error);
      }
    }
  );

  // 游戏会话结束
  const unlistenEnd = listen<{gameId: number; totalMinutes: number; startTime: number; endTime: number; processId: number}>(
    'game-session-ended',
    async (event) => {
      const { gameId, totalMinutes, startTime, endTime } = event.payload;
      
      try {
        // 直接使用数字类型的gameId
        await recordGameSession(gameId, totalMinutes, startTime, endTime);
        
        // 调用回调函数时转换为字符串（如果回调函数期望字符串）
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
  gameId: number,  // 改为number类型
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