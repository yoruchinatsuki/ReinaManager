import http from './http'

// const UA = 'huoshen80/ReinaManager(https://github.com/huoshen80/ReinaManager)';



export async function fetchFromBgm(name: string, BGM_TOKEN: string,id?: string) {
    const BGM_HEADER = {
    headers: {
        "Authorization": `Bearer ${BGM_TOKEN}`,
    }
}
    if (BGM_TOKEN==='')return "请先设置BGM Token";
    let idTemp=id;
    if(!id){
        const dataTemp = (await http.get(`https://api.bgm.tv/search/subject/${name}?type=4&responseGroup=small`)).data;
    if (!dataTemp||dataTemp.length===0)return "未找到相关条目，请确认游戏名字后重试";
    idTemp = dataTemp.list[0].id
    }
    const BGMdata = (await http.get(`https://api.bgm.tv/v0/subjects/${idTemp}`, BGM_HEADER)).data;

    return {
       date: BGMdata.date,
       image: BGMdata.images.large,
       summary: BGMdata.summary,
       name: BGMdata.name,
         name_cn: BGMdata.name_cn,
         tags: BGMdata.tags.map((tag: { name: string }) => tag.name),
         rank: BGMdata.rating.rank,
        score: BGMdata.rating.score,
        id: BGMdata.id
    }
}
