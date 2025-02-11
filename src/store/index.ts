import { create } from 'zustand';
import type { GameData } from '@/types';
import { readTextFile, writeTextFile, mkdir, BaseDirectory } from '@tauri-apps/plugin-fs';

interface GameStore {
    games: GameData[];
    loading: boolean;
    fetchGames: () => Promise<void>;
    addGame: (game: GameData) => Promise<void>;
}
interface BGM_TOKEN {
    BGM_TOKEN: string;
    setBGM_TOKEN: (token: string) => void;
}
interface CardID {
    selectId:number;
    setselectId:(cardId:number)=>void;
}

export const useBGM_TOKEN = create<BGM_TOKEN>((set) => ({
    BGM_TOKEN: '',
    setBGM_TOKEN: (token: string) => set({ BGM_TOKEN: token }),
}));

export const useGameStore = create<GameStore>((set, get) => ({
    games: [],
    loading: false,

    fetchGames: async () => {
        set({ loading: true });
        try {
            const fileContent = await readTextFile('data/games.json', {
                baseDir: BaseDirectory.AppData
            });
            const data = fileContent.trim() ? JSON.parse(fileContent) : [];
            set({ games: data });
        } catch (error) {
            console.error('Error reading games:', error);
            set({ games: [] });
        } finally {
            set({ loading: false });
        }
    },

    addGame: async (game: GameData) => {
        try {
            const { games } = get();
            const newGames = [...games, game];
            
            await mkdir('data', { baseDir: BaseDirectory.AppData, recursive: true });
            await writeTextFile('data/games.json', JSON.stringify(newGames, null, 2), {
                baseDir: BaseDirectory.AppData
            });
            
            set({ games: newGames });
        } catch (error) {
            console.error('Error adding game:', error);
        }
    }
}));

export const useRightMenu=create<CardID>((set)=>({
    selectId:-1,
    setselectId:(cardId:number)=>{
        set({selectId:cardId})
    }
}))