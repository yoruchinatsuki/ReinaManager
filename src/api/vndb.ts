import http from './http'
import { time_now } from "@/utils";

// 定义VNDB API响应的接口
interface VNDBTitle {
  title: string;
  lang: string;
  main?: boolean;
  official?: boolean;
}

interface VNDBTag {
  name: string;
  rating?: number;
}

interface VNDBData {
  id: string;
  titles: VNDBTitle[];
  image?: { url: string };
  released?: string;
  description?: string;
  rank: null;
  rating?: number;
  tags?: VNDBTag[];
  length_minutes?: number;
  screenshots?: { url: string }[];
  developers?: { name: string }[];
  va?: { character: { name: string, image?: { url: string } } }[];
  extlinks?: { name: string, url: string }[];
}

/**
 * 使用http实例从VNDB API获取游戏信息
 * @param name 游戏名称
 * @param id 可选的游戏ID
 */
export async function fetchFromVNDB(name: string, id?: string) {
  try {
    // 构建API请求体
    const requestBody = {
      filters: id ? ['id', '=', id] : ['search', '=', name],
      fields: 'id, titles.title, titles.lang, titles.main, image.url, released, rating, tags.name, description'
    };
    
    // 调用VNDB API
    const response = await http.post('https://api.vndb.org/kana/vn', requestBody, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.data || !response.data.results || response.data.results.length === 0) {
      return "未找到相关条目，请确认游戏名字后重试";
    }

    // 获取API返回的数据，并指定类型
    const VNDBdata = response.data.results[0] as VNDBData;
    
    // 从titles数组中查找相关标题，使用正确的类型
    const titles = VNDBdata.titles.map((title: VNDBTitle) => ({
      title: title.title,
      lang: title.lang,
      main: title.main
    }));
    
    const mainTitle = titles.find(title => title.main)?.title || '';
    const chineseTitle = titles.find(title => 
      title.lang === 'zh-Hans' || title.lang === 'zh-Hant' || title.lang === 'zh'
    )?.title || null;
    
    // 提取所有标题
    const allTitles = titles.map(title => title.title);
    
    // 格式化返回数据，与bgm.ts的返回格式保持一致
    return {
      date: VNDBdata.released,
      image: VNDBdata.image?.url || null,
      summary: VNDBdata.description,
      name: mainTitle,
      name_cn: chineseTitle,
      all_titles: allTitles,
      tags: VNDBdata.tags?.map((tag: VNDBTag) => tag.name) || [],
      rank:null,
      score: VNDBdata.rating || 0,
      game_id: VNDBdata.id,
      time: time_now()
    };
  } catch (error) {
    console.error("VNDB API调用失败:", error);
    if (error instanceof Error) {
      console.error("错误消息:", error.message);
    }
    return "获取数据失败，请稍后重试";
  }
}

/**
 * 通过ID直接获取VNDB游戏信息
 * @param id VNDB游戏ID (如 "v17")
 */
export async function fetchVNDBById(id: string) {
  return fetchFromVNDB("", id);
}