import axios from 'axios';

const createHttp = () => {
    const http = axios.create({});

    // 请求拦截器（可选）
    http.interceptors.request.use(
        (config) => {
            // 在这里可以动态修改请求，比如添加额外的 headers
            return config;
        },
        () => {
            return "请求失败，请检查网络连接后重试"// 抛出错误让调用者在 catch 里处理;
        }
    );

    // 响应拦截器
    http.interceptors.response.use(
        (response) => response,
        () => {
            // 可以根据错误类型自定义错误返回
            return "未找到相关条目，请确认游戏名字后重试"// 抛出错误让调用者在 catch 里处理
            // Promise.reject(error)
        }
    );


    return http;
}

export default createHttp();