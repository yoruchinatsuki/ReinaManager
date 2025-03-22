export interface GameData {
    id?: number;
    date?: string;
    image?: string;
    summary?: string;
    name: string;
    name_cn?: string;
    tags?: string[];
    rank?: number;
    score?: number;
    game_id: string;
    time: Date;
    localpath?: string;
}

export interface HanleGamesProps  {
    id: string|undefined|null;
    getGameById: (id: string) => Promise<GameData>;
}

