import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GameData } from '@/types';
import { 
  getGames as getGamesRepository, 
  insertGame as insertGameRepository,
  getGameByGameId as getGameByIdRepository,
  deleteGame as deleteGameRepository,
searchGames as searchGamesRepository 
} from '@/utils/repository';
import { 
  getGames as getGamesLocal, 
  insertGame as insertGameLocal, 
  deleteGame as deleteGameLocal,
  getBgmTokenLocal, 
  setBgmTokenLocal,
  getGameByIdLocal,
  searchGamesLocal
} from '@/utils/localStorage';
import { getBgmTokenRepository, setBgmTokenRepository } from '@/utils/settingsConfig';

// 判断是否运行在 Tauri 环境
export const isTauri = typeof window !== 'undefined' && '__TAURI__' in window && !!window.__TAURI__;

// 定义应用全局状态类型
interface AppState {
  // 游戏相关状态与方法
  games: GameData[];
  loading: boolean;
  // 排序选项
  sortOption: string;
  sortOrder: 'asc' | 'desc';
  // BGM 令牌
  bgmToken: string;
  // UI 状态
  selectedGameId: string | null;
  
  // 游戏操作方法
  fetchGames: (sortOption?: string, sortOrder?: 'asc' | 'desc') => Promise<void>;
  addGame: (game: GameData) => Promise<void>;
  deleteGame: (gameId: string) => Promise<void>;
  getGameById: (gameId: string) => Promise<GameData>;
  
  // 排序方法
  setSortOption: (option: string) => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  
  // BGM 令牌方法
  fetchBgmToken: () => Promise<void>;
  setBgmToken: (token: string) => Promise<void>;
  
  // UI 操作方法
  setSelectedGameId: (id: string | null) => void;
  
  // 初始化
  initialize: () => Promise<void>;

  searchKeyword: string;
  
  // ...existing methods
  setSearchKeyword: (keyword: string) => void;
  searchGames: (keyword: string) => Promise<void>;

}

// 创建持久化的全局状态
export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // 游戏相关状态
      games: [],
      loading: false,
      
      // 排序选项默认值
      sortOption: 'addtime',
      sortOrder: 'asc',
      
      // BGM 令牌
      bgmToken: '',
      
      // UI 状态
      selectedGameId: null,

      searchKeyword: '',
      
       // fetchGames 函数修改，重置搜索关键字
      fetchGames: async (sortOption?: string, sortOrder?: 'asc' | 'desc') => {
        set({ loading: true });
        try {
          const option = sortOption || get().sortOption;
          const order = sortOrder || get().sortOrder;
          
          const data = isTauri
            ? await getGamesRepository(option, order)
            : getGamesLocal(option, order);
          
          set({ 
            games: data, 
            searchKeyword: '' // 重置搜索关键字
          });
        } catch (error) {
          console.error('获取游戏数据失败:', error);
          set({ games: [] });
        } finally {
          set({ loading: false });
        }
      },

      
      addGame: async (game: GameData) => {
        try {
          if (isTauri) {
            await insertGameRepository(game);
          } else {
            insertGameLocal(game);
          }
          // 重新获取游戏列表
          await get().fetchGames();
        } catch (error) {
          console.error('Error adding game:', error);
        }
      },
      
      deleteGame: async (gameId: string): Promise<void> => {
        try {
          if (isTauri) {
            await deleteGameRepository(gameId);
          } else {
            deleteGameLocal(gameId);
          }
          // 重新获取游戏列表
          await get().fetchGames();
        } catch (error) {
          console.error('删除游戏数据失败:', error);
        }
      },
      
      getGameById: async (gameId: string): Promise<GameData> => {
        if (isTauri) {
          return await getGameByIdRepository(gameId);
        }
        return await Promise.resolve(getGameByIdLocal(gameId));
      },

      setSearchKeyword: (keyword: string) => {
        set({ searchKeyword: keyword });
      },
      
      searchGames: async (keyword: string) => {
        set({ loading: true });
        try {
          const option = get().sortOption;
          const order = get().sortOrder;
          
          let data: GameData[];
          if (isTauri) {
            // 服务端搜索
            data = await searchGamesRepository(keyword, option, order);
          } else {
            // 客户端搜索
            data = searchGamesLocal(keyword, option, order);
          }
          
          set({ games: data, searchKeyword: keyword });
        } catch (error) {
          console.error('搜索游戏数据失败:', error);
          set({ games: [] });
        } finally {
          set({ loading: false });
        }
      },
      
      // 排序方法
      setSortOption: (option: string) => {
        set({ sortOption: option });
      },
      
      setSortOrder: (order: 'asc' | 'desc') => {
        set({ sortOrder: order });
      },
      
      // BGM 令牌方法
      fetchBgmToken: async () => {
        try {
          let token = '';
          if (isTauri) {
            token = await getBgmTokenRepository();
          } else {
            token = getBgmTokenLocal();
          }
          set({ bgmToken: token });
        } catch (error) {
          console.error('Error fetching BGM token:', error);
        }
      },
      
      setBgmToken: async (token: string) => {
        try {
          if (isTauri) {
            await setBgmTokenRepository(token);
          } else {
            setBgmTokenLocal(token);
          }
          set({ bgmToken: token });
        } catch (error) {
          console.error('Error setting BGM token:', error);
        }
      },
      
      // UI 操作方法
      setSelectedGameId: (id: string | null) => {
        set({ selectedGameId: id });
      },
      
      // 初始化方法，先初始化数据库，然后加载所有需要的数据
      initialize: async () => {        
        // 然后并行加载其他数据
        await Promise.all([
          get().fetchBgmToken(),
          get().fetchGames()
        ]);
      }
    }),
    {
      name: 'reina-manager-store',
      // 可选：定义哪些字段需要持久化存储
      partialize: (state) => ({
        sortOption: state.sortOption,
        sortOrder: state.sortOrder
      })
    }
  )
);

// 初始化函数保持不变，但内部调用了新的方法
export const initializeStores = async (): Promise<void> => {
  await useStore.getState().initialize();
};