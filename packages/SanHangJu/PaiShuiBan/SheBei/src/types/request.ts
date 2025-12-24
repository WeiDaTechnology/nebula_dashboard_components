import type { AxiosRequestConfig } from 'axios'

export type CustomConfig = {
  /**
   * 自动在请求的body 外围包一个 param
   * 例如，原 body 为 { id : 'xxxid' } ，之后会变为 { param: { id : 'xxxid' } }
   * 默认值为 true
   */
  autoBoxParam?: boolean

  /**
   * 自动在请求的url 加一个 api 前缀
   * 例如，原 url 为 /platform/getById ，之后会变为 /api/plarform/getById
   * 默认值为 true
   */
  autoApiPrefix?: boolean

  /**
   * 自动从 cookies 中获取 token 和 companyId ，设置进 header 中
   * 默认值为 true
   */
  addToken?: boolean

  /**
   * 自动在 header 设置 content-type 为 json
   * 默认值为 true
   */
  setContentTypeJson?: boolean

  /**
   * 一般情况下，会根据返回值，自动抛出错误， 例如，http code 不是 2xx 的， 或者返回值没有 businessCode 不是 success 的
   * 该属性设置为 false , 会跳过这一步
   * 如果该属性设置为函数，可以动态的返回布尔值，来决定是否继续抛出错误
   * 默认值为 false
   */
  skipErrorThrower?: boolean | ((data: any) => boolean)

  /**
   * 一般情况下，会根据返回值，自动抛出错误， 之后会根据不同的类型，自动处理, 例如 token 校验失败，跳转到 login 页面等等
   * 该属性设置为 false , 会跳过这一步， 直接抛出错误， 并不会做额外的处理
   * 默认值为 false
   */
  skipErrorHandler?: boolean
}

export type RequestFunc = <T>(url: string, config: AxiosRequestConfig & CustomConfig) => Promise<T>
