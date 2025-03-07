import type { GameData } from '@/types/index';

// 定义本地存储的 key
const STORAGE_KEY = 'reina_manager_games';
const STORAGE_KEY_SETTINGS = 'reina_manager_settings';

// 设置类型定义
interface Settings {
  bgmToken: string;
  // 其他设置项可在此添加
  theme?: 'light' | 'dark';
  language?: string;
  // ...
  sort?: string;
}

// 默认设置
const DEFAULT_SETTINGS: Settings = {
  bgmToken: '',
  theme: 'light',
  language: 'zh-CN',
  sort: 'addtime',
};

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

//通过 id 查找本地存储中的游戏数据
export function getGameByIdLocal(gameId: string): GameData {
  const games = getGames();
  const game = games.find(game => game.game_id === gameId);
  return game as GameData;
}

// 获取设置
export function getSettings(): Settings {
  const data = localStorage.getItem(STORAGE_KEY_SETTINGS);
  if (data) {
    try {
      return {...DEFAULT_SETTINGS, ...JSON.parse(data)};
    } catch (error) {
      console.error('解析设置数据失败:', error);
      return DEFAULT_SETTINGS;
    }
  }
  return DEFAULT_SETTINGS;
}

// 保存设置
export function saveSettings(settings: Settings): void {
  localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
}

// 获取 BGM_TOKEN
export function getBgmTokenLocal(): string {
  const settings = getSettings();
  return settings.bgmToken;
}

// 保存 BGM_TOKEN
export function setBgmTokenLocal(token: string): void {
  const settings = getSettings();
  settings.bgmToken = token;
  saveSettings(settings);
}

// 获取设置中的单个值
export function getSetting<K extends keyof Settings>(key: K): Settings[K] {
  const settings = getSettings();
  return settings[key];
}

// 更新设置中的单个值
export function setSetting<K extends keyof Settings>(key: K, value: Settings[K]): void {
  const settings = getSettings();
  settings[key] = value;
  saveSettings(settings);
}