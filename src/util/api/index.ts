import {AxiosRequestConfig, AxiosResponse} from "axios";

const axios = require('axios')

const instance = axios.create({
    timeout: 1000,
    headers: {
        'Access-Control-Allow-Origin': '*',
    }
});
//渲染进程中使用，这会强制 axios 使用节点适配器，参考地址：https://github.com/axios/axios/issues/1474
instance.defaults.adapter = require('axios/lib/adapters/http');
// http request 请求拦截器
instance.interceptors.request.use(
    function (config: AxiosRequestConfig) {
        return config;
    },
    function (error: any) {

        return Promise.reject(error);
    }
);

// http response 服务器响应拦截器，
instance.interceptors.response.use(
    function (response: AxiosResponse) {
        return response;
    },
    function (error: any) {
        // return Promise.reject('报错了');

        return Promise.reject(error.message)
    }
);

export default instance