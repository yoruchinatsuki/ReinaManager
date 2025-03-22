import { open } from '@tauri-apps/plugin-shell';
import { invoke, isTauri } from '@tauri-apps/api/core';
import {path} from '@tauri-apps/api';
import type { HanleGamesProps } from '@/types';

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

export async function openurl(url: string) {
  if (isTauri()) {
    await open(url)
  } else {
    window.open(url, '_blank')
  }
}

export const handleStartGame = async ({id,getGameById}:HanleGamesProps) => {
        try {
          if (!id) {
            console.error('未选择游戏');
            return;
        }
          const selectedGame = await getGameById(id);
            if (!selectedGame || !selectedGame.localpath) {
                console.error('游戏路径未找到');
                return;
            }
            // 调用Rust后端启动游戏
            await invoke('launch_game', {
                gamePath: selectedGame.localpath,
            });
        } catch (error) {
            console.error('游戏启动失败:', error);
            // 这里可以添加错误提示UI
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