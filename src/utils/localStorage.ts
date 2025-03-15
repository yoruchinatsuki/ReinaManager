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

// 获取所有游戏数据（增加排序功能）
export function getGames(sortOption = 'addtime', sortOrder: 'asc' | 'desc' = 'asc'): GameData[] {
  const data = localStorage.getItem(STORAGE_KEY);
  let games: GameData[] = [];
  
  if (data) {
    try {
      games = JSON.parse(data);
    } catch (error) {
      console.error('解析游戏数据失败：', error);
      return [];
    }
  }
  
  // 根据排序选项进行排序
  return sortGames(games, sortOption, sortOrder);
}

// 排序游戏数据的辅助函数
function sortGames(games: GameData[], sortOption: string, sortOrder: 'asc' | 'desc'): GameData[] {
  // 如果是按添加时间排序，先创建带索引的游戏列表
  if (sortOption === 'addtime') {
    // 创建带索引的副本，索引表示添加顺序
    const indexedGames = games.map((game, index) => ({ 
      ...game, 
      _index: index // 添加临时索引，表示在数组中的位置
    }));
    
    // 按索引排序
    return indexedGames.sort((a, b) => {
      return sortOrder === 'asc' ? a._index - b._index : b._index - a._index;
    });
  }
  
  // 其他排序逻辑不变
  return [...games].sort((a, b) => {
    let valueA = 0;
    let valueB = 0;
    
    // 根据排序选项获取要比较的值
    switch (sortOption) {
      case 'datetime':
        valueA = a.date ? new Date(a.date).getTime() : 0;
        valueB = b.date ? new Date(b.date).getTime() : 0;
        break;
      case 'rank':
        // 游戏排名比较（排名越小越好，如1比10好）
        valueA = Number(a.rank) || 99999;
        valueB = Number(b.rank) || 99999;
        break;
      default:
        // 默认情况不应该到达这里，因为已经在上面处理了addtime
        valueA = 0;
        valueB = 0;
    }
    
    // 特殊处理排名排序
    if (sortOption === 'rank') {
      // 对于排名:
      // 升序时: 排名较差的在前面 (较大值在前), 所以是 B-A
      // 降序时: 排名较好的在前面 (较小值在前), 所以是 A-B
      return sortOrder === 'asc' ? valueB - valueA : valueA - valueB;
    }
    
    // 对于其他排序选项:
    // 升序: 小的值在前 (A-B)
    // 降序: 大的值在前 (B-A)
    return sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
  });
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

// 纯前端搜索游戏，根据name_cn(为空则搜索name)进行模糊匹配
export function searchGamesLocal(
  keyword: string,
  sortOption = 'addtime',
  sortOrder: 'asc' | 'desc' = 'asc'
): GameData[] {
  // 如果关键字为空，返回所有游戏
  if (!keyword || keyword.trim() === '') {
    return getGames(sortOption, sortOrder);
  }

  // 从localStorage获取所有游戏数据
  const allGames = getGames();
  
  // 转换关键字为小写以进行不区分大小写的搜索
  const searchKeyword = keyword.toLowerCase().trim();
  
  // 过滤游戏：优先匹配name_cn，如果name_cn为空或未找到匹配，则匹配name
  const filteredGames = allGames.filter(game => {
    const nameCn = (game.name_cn || '').toLowerCase();
    const name = (game.name || '').toLowerCase();
    
    // 如果中文名存在并匹配，返回true
    if (nameCn?.includes(searchKeyword)) {
      return true;
    }
    
    // 如果中文名为空或不匹配，检查英文名
    return name.includes(searchKeyword);
  });
  
  // 使用现有的排序函数对结果进行排序
  return sortGames(filteredGames, sortOption, sortOrder);
}