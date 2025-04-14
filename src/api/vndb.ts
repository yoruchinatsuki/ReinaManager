import http from './http'
import { time_now } from "@/utils";

interface VNDB_title {
  title: string;
  lang: string;
  main: boolean;
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
      fields: 'id, titles.title, titles.lang, titles.main, image.url, released, rating, tags.name,tags.rating, description,developers.name,length_minutes'
    };
    
    // 调用VNDB API
    const VNDBdata = (await http.post('https://api.vndb.org/kana/vn', requestBody, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })).data.results[0];
    if(!VNDBdata) return "未找到相关条目，请确认游戏名字后重试";
    
    // 从titles数组中查找相关标题，使用正确的类型
    const titles = VNDBdata.titles.map((title:VNDB_title) => ({
      title: title.title,
      lang: title.lang,
      main: title.main
    }));
    
    const mainTitle: string = titles.find((title: VNDB_title) => title.main)?.title || '';
    const chineseTitle = titles.find((title:VNDB_title )=> 
      title.lang === 'zh-Hans' || title.lang === 'zh-Hant' || title.lang === 'zh'
    )?.title || "";
    
    // 提取所有标题
    const allTitles: string[] = titles.map((title: VNDB_title) => title.title);
    
    // 格式化返回数据，与bgm.ts的返回格式保持一致
    return {
      bgm_id: null,
      vndb_id: VNDBdata.id,
      id_type: 'vndb',
      date: VNDBdata.released,
      image: VNDBdata.image?.url||null ,
      summary: VNDBdata.description,
      name: mainTitle,
      name_cn: chineseTitle,
      all_titles: allTitles,
      tags: (VNDBdata.tags as { rating: number; name: string }[])
      .filter((tag) => tag.rating >= 2)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 30)
      .map(({ name }) => name),
      rank:null,
      score: Number((VNDBdata.rating/10).toFixed(2)),
      time: time_now(),
      developer: VNDBdata.developers?.[0]?.name || null,
      aveage_hours:   Number((VNDBdata.length_minutes / 60).toFixed(1)),
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