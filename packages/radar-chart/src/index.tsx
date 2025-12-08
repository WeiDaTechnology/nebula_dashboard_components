import './public-path.js'
import type React from 'react'
import { createRoot } from 'react-dom/client'
import Component from './component/index'
import { configure } from './configure'

declare const __RUN_ON_LOCAL__: boolean

interface ChartDataItem {
  name: string
  type: string
  value: string
}

export interface ContainerProps {
  /** 组件id */
  __id?: string
  /** 操作对象引用 */
  __operatorRef?: React.RefObject<unknown>
  /** 当前大屏模式 */
  __designMode?: 'design' | 'preview' | 'live'
  __appHelper?: {
    ctx: unknown
  }
  style?: React.CSSProperties
  /** 数据源数据 */
  chartData?: {
    constant?: {
      data?: ChartDataItem[]
    }
  }
  /** 维度配置 */
  dimensions?: Array<{
    name: string
    max?: number
  }>
  /** 系列配置 */
  series?: Array<{
    name: string
    data: number[]
    color?: string
    lineWidth?: number
    lineStyle?: 'solid' | 'dashed' | 'dotted'
    areaColor?: string
  }>
  /** 雷达图配置 */
  radarConfig?: {
    /** 形状：polygon（多边形）或 circle（圆形） */
    shape?: 'polygon' | 'circle'
    center?: [string, string]
    radius?: string | number
    startAngle?: number
    splitNumber?: number
    axisLine?: boolean
    splitLine?: boolean
    indicatorName?: boolean
    backgroundColor?: string
    splitLineColor?: string
    axisLineColor?: string
    nameColor?: string
    axisLabel?: boolean
    axisLabelColor?: string
  }
  /** 图例配置 */
  legendConfig?: {
    show?: boolean
    position?: 'top' | 'bottom' | 'left' | 'right'
  }
  /** 提示框配置 */
  tooltipConfig?: {
    /** 是否显示提示框 */
    show?: boolean
  }
}

export default function Container(props: ContainerProps) {
  const { style } = props

  return (
    <div
      style={
        __RUN_ON_LOCAL__
          ? {}
          : {
              ...style,
              backgroundColor: 'transparent',
              left: 0,
              top: 0,
              display: 'flex',
              transform: `translate(${style?.left}px, ${style?.top}px)`,
            }
      }
    >
      <Component {...props} />
    </div>
  )
}

if (__RUN_ON_LOCAL__) {
  ;(() => {
    const container = document.getElementById('app-root')
    if (!container) {
      throw new Error('Container not found')
    }
    const root = createRoot(container)
    root.render(<Container />)
  })()
} else {
  window.registerGraphicCustomComponent?.({
    component: Container,
    interaction: {
      title: '交互',
      eventConfigure: [
        {
          eventName: 'onClick',
          displayName: '点击',
        },
      ],
    },
    configure,
  })
}
