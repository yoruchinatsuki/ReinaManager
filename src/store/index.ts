import { create } from 'zustand';
import type { GameData } from '@/types';
import { 
  getGames as getGamesRepository, 
  insertGame as insertGameRepository,
  getGameById as getGameByIdRepository
} from '@/utils/repository';
import { 
  getGames as getGamesLocal, 
  insertGame as insertGameLocal, 
  getBgmTokenLocal, 
  setBgmTokenLocal,
  getGameByIdLocal
} from '@/utils/localStorage';
import { getBgmTokenRepository, setBgmTokenRepository } from '@/utils/settingsConfig';


interface GameStore {
    games: GameData[];
    loading: boolean;
    fetchGames: () => Promise<void>;
    addGame: (game: GameData) => Promise<void>;
    getGameById: (gameId: number) => Promise<GameData>;
}
interface BGM_TOKEN {
    BGM_TOKEN: string;
    fetchBgmToken: () => Promise<void>;
    setBGM_TOKEN: (token: string) => void;
}
interface CardID {
    selectId:number;
    setselectId:(cardId:number)=>void;
}

// 判断是否运行在 Tauri 环境（即是否有 window.__TAURI__）
export const isTauri = typeof window !== 'undefined' && '__TAURI__' in window && !!window.__TAURI__


// export const useStore = create((set) => ({
  
// }));

export const useBGM_TOKEN = create<BGM_TOKEN>((set) => ({
    BGM_TOKEN: '',
    fetchBgmToken: async () => {
      let token = '';
      if (isTauri) {
        token = await getBgmTokenRepository();
      } else {
        token = getBgmTokenLocal();
      }
      set({ BGM_TOKEN: token });
    },
    setBGM_TOKEN: async (token: string) => {
      if (isTauri) {
        await setBgmTokenRepository(token);
      } else {
        setBgmTokenLocal(token);
      }
      set({ BGM_TOKEN: token });
    }
}));

export const useGameStore = create<GameStore>((set) => ({
  games: [],
  loading: false,

  fetchGames: async () => {
    set({ loading: true });
    try {
      const data = isTauri
        ? await getGamesRepository()
        : await Promise.resolve(getGamesLocal());
      set({ games: data });
    } catch (error) {
      console.error('Error fetching games:', error);
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
      const data = isTauri
        ? await getGamesRepository()
        : await Promise.resolve(getGamesLocal());
      set({ games: data });
    } catch (error) {
      console.error('Error adding game:', error);
    }
  },
  // 新增：根据 id 获取游戏资料
  getGameById: async (gameId: number): Promise<GameData> => {
    if (isTauri) {
      return await getGameByIdRepository(gameId);
    }
      return await Promise.resolve(getGameByIdLocal(gameId));
  }
}));

export const useRightMenu=create<CardID>((set)=>({
    selectId:-1,
    setselectId:(cardId:number)=>{
        set({selectId:cardId})
    }
}))
// 提供一个初始化函数，等待所有 store 初始化完成
export const initializeStores = async (): Promise<void> => {
  await Promise.all([
    useBGM_TOKEN.getState().fetchBgmToken(),
    useGameStore.getState().fetchGames()
  ]);
};