import axios, { type AxiosError } from 'axios';

 export const createHttp = () => {
    const http = axios.create({});

    // 响应拦截器
    http.interceptors.response.use(
        (response) => response,
        (error: AxiosError) => {
            if (error.response?.status === 401) {
                return "认证失败，请检查你的BGM_TOKEN是否正确";
            }
            if (error.response?.status === 400) {
                return console.error('请求错误，请检查你的网络连接');
            }
            return "未找到相关条目,请确认游戏名字后重试或网络连接错误";
        }
    );


    return http;
}
export default createHttp();