import type { RequestFunc } from './request'

export interface EventConfigure {
  /** 事件名称 */
  eventName: string
  /** 事件显示名称 */
  displayName: string
}

export interface Configure {
  /** 属性字段 */
  name?: string
  /** 布局类型 */
  layout?: string
  /** 属性标题 */
  title?: string
  /** 属性设置器 */
  setter?:
    | string
    | {
        componentName: string
        props?: Record<string, any>
      }
  items?: Configure[]
  [key: string]: unknown
}

declare global {
  interface Window {
    registerGraphicCustomComponent: (component: {
      /** 组件 */
      component: React.ComponentType<any>
      /** 交互配置 */
      interaction?: Array<{
        /** 交互标题 */
        title: string
        /** 事件配置 */
        eventConfigure: EventConfigure[]
      }>
      /** 配置 */
      configure?: Configure
      /** 自定义设置器列表 */
      setter?: React.ComponentType<any>[]
    }) => void

    core: {
      /** 请求函数 */
      request: RequestFunc
    }
  }
}
