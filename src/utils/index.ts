import { open } from '@tauri-apps/plugin-shell';
import { invoke, isTauri } from '@tauri-apps/api/core';
import {path} from '@tauri-apps/api';
import type { GameData, HanleGamesProps } from '@/types';
// import { createTheme } from '@mui/material/styles';


export const time_now=()=>{
    // 获取当前时间
const currentDate = new Date();

// // 获取当前年份
// const year = currentDate.getFullYear();

// // 获取当前月份
// const month = currentDate.getMonth() + 1;

// // 获取当前日期
// const date = currentDate.getDate();

// // 获取当前小时
// const hours = currentDate.getHours();

// // 获取当前分钟
// const minutes = currentDate.getMinutes();

// // 获取当前秒数
// const seconds = currentDate.getSeconds();

return currentDate;

// console.log(`当前时间：${year}-${month}-${date}${hours}:${minutes}:${seconds}`);

}

// export const Buttontheme = createTheme({
//   components: {
//     MuiButton: {
//       styleOverrides: {
//         root: {
//           textTransform: 'none', // 禁用所有按钮的文本大写转换
//         },
//       },
//     },
//   },
// });

export async function openurl(url: string) {
  if (isTauri()) {
    await open(url)
  } else {
    window.open(url, '_blank')
  }
}

    export const handleOpenFolder = async ({id,getGameById}:HanleGamesProps) => {
      if (!id) {
            console.error('未选择游戏');
            return;
        }
        try {
            const selectedGame = await getGameById(id);
            if (!selectedGame || !selectedGame.localpath) {
                console.error('游戏路径未找到');
                return;
            }
            const folder = await path.dirname(selectedGame.localpath);
            if (folder) {
                // 使用我们自己的后端函数打开文件夹
                await invoke('open_directory', { dirPath: folder });
            }
        } catch (error) {
            console.error('打开文件夹失败:', error);
        }
    }

export function getGamePlatformId(game: GameData): string | undefined {
  // 严格检查：非空字符串
  if (game.bgm_id && game.bgm_id.trim() !== "") return game.bgm_id;
  if (game.vndb_id && game.vndb_id.trim() !== "") return game.vndb_id;
  return undefined;
}

// // 改进版本，使用更清晰的函数设计
// export function isCustom(gameOrId: GameData | string | undefined): boolean {
//   if (!gameOrId) return false;
  
//   // 如果传入的是游戏对象
//   if (typeof gameOrId !== 'string') {
//     return Boolean(gameOrId.bgm_id?.includes("custom"));
//   }
  
//   // 如果传入的是字符串ID
//   return gameOrId.includes("custom");
// }

