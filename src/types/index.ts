export interface GameData {
    id?: number;
    date?: string;
    image?: string;
    summary?: string;
    name: string;
    name_cn?: string;
    tags?: string[];
    rank?: number|null;
    score?: number;
    bgm_id?: string|null;
    vndb_id?: string|null;
    time: Date;
    localpath?: string;
    developer?: string|null;
    all_titles?: string[];
    aveage_hours?: number;
}


export interface HanleGamesProps  {
    id: string|undefined|null;
    getGameById: (id: string) => Promise<GameData>;
    canUse?: () => boolean;
}


