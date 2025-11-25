import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

// 独立的 axios 实例，避免污染全局
const instance: AxiosInstance = axios.create({
    baseURL: '/',
})

function getCookie(name: string) {
    let arr,
        reg = new RegExp('(^| )' + name + '=([^;]*)(;|$)')
    arr = document.cookie.match(reg)
    return arr ? unescape(arr[2]) : null
}

// 请求拦截：统一携带 token，设置默认 Content-Type
instance.interceptors.request.use(
    (config) => {
        const cookie = getCookie('token')
        const token = cookie || localStorage.getItem('token')
        if (!config.headers) config.headers = {}
        if (token) {
            config.headers['Authorization'] = 'Bearer ' + token
        }
        if(localStorage.getItem('companyid')) {
            config.headers['CompanyId'] = localStorage.getItem('companyid') || ''
        }
        const method = (config.method || 'get').toLowerCase()
        if (
            (method === 'post' || method === 'put' || method === 'patch') &&
            !config.headers['Content-Type']
        ) {
            config.headers['Content-Type'] = 'application/json'
        }
        return config
    },
    (error) => Promise.reject(error)
)

// 响应拦截：直接返回 data
instance.interceptors.response.use(
    (response: AxiosResponse) => {
        return response.data
    },
    (error) => Promise.reject(error)
)

export interface RequestOptions extends AxiosRequestConfig {
    // 兼容历史调用，常用字段在此保留
    method?: AxiosRequestConfig['method']
    data?: any
    params?: any
    headers?: Record<string, any>
}

// 与 service 中的用法保持一致：request('path', { method, data })
export function request<T = any>(url: string, options: RequestOptions = {}) {
    const config: AxiosRequestConfig = {
        url,
        ...options,
    }
    return instance.request<T>(config)
}

export default instance