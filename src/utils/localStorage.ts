import type { GameData } from '@/types/index';

// 定义本地存储的 key
const STORAGE_KEY = 'reina_manager_games';
const STORAGE_KEY_BGM_TOKEN = 'reina_manager_bgmtoken';

// 获取所有游戏数据
export function getGames(): GameData[] {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (error) {
      console.error('解析游戏数据失败：', error);
      return [];
    }
  }
  return [];
}

// 保存游戏数据集合到 localStorage
function setGames(games: GameData[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
}

// 插入一条游戏数据
export function insertGame(game: GameData): void {
  const games = getGames();
  games.push(game);
  setGames(games);
}

// 删除一条游戏数据
export function deleteGame(gameId: string): void {
  let games = getGames();
  games = games.filter(game => game.game_id !== gameId);
  setGames(games);
}

// 新增：通过 id 查找本地存储中的游戏数据
export function getGameByIdLocal(gameId: string): GameData {
  const games = getGames();
  const game = games.find(game => game.game_id === gameId);
  return game as GameData;
}

// 新增：读取 BGM_TOKEN
export function getBgmTokenLocal(): string {
  return localStorage.getItem(STORAGE_KEY_BGM_TOKEN) || "";
}

// 新增：保存 BGM_TOKEN
export function setBgmTokenLocal(token: string): void {
  localStorage.setItem(STORAGE_KEY_BGM_TOKEN, token);
}