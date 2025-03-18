import { open } from '@tauri-apps/plugin-shell';
import { isTauri } from '@tauri-apps/api/core';

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