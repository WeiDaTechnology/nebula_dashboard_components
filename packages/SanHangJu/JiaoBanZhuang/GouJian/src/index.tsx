import './public-path.js'
import React from 'react'
import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import Component from './component/index'

declare const __RUN_ON_LOCAL__: boolean

declare global {
  interface Window {
    GraphicCustomComponent: React.FC<ContainerProps>
  }
}

export interface ContainerProps {
  /** 组件id */
  __id?: string
  /** 操作对象引用 */
  __operatorRef?: React.RefObject<any>
  /** 当前大屏模式 */
  __designMode?: 'design' | 'preview' | 'live'
  __appHelper?: {
    ctx: any
  }
  style?: React.CSSProperties
}

// 本地测试用的包装组件
function LocalTestWrapper() {
  const [visible, setVisible] = useState(true)

  return (
    <Component
      data={{
        device_key: 'DP01808025100001',
        depth: 173.06,
        piles_scribe: 'A4-2',
        latitude: 0,
        end_time: 1_761_186_120,
        begin_time: 1_760_602_418,
        longitude: 0,
        part_count: 8,
        workDuration: 162.14,
        barChartData: [
          { total_volume: 120, hour_time: '2025-10-23 10:00:00' },
          { total_volume: 260, hour_time: '2025-10-23 11:00:00' },
          { total_volume: 320, hour_time: '2025-10-23 12:00:00' },
        ],
        lineChartData: [
          { total_length: 26, hour_time: '2025-10-23 10:00:00' },
          { total_length: 35, hour_time: '2025-10-23 11:00:00' },
          { total_length: 28, hour_time: '2025-10-23 12:00:00' },
        ],
      }}
      onClose={() => setVisible(false)}
      visible={visible}
    />
  )
}

export default function Container(props: ContainerProps) {
  return <Component {...props} />
}

if (__RUN_ON_LOCAL__) {
  ;(() => {
    const container = document.getElementById('app-root')
    if (!container) {
      throw new Error('Container not found')
    }
    const root = createRoot(container)
    root.render(<LocalTestWrapper />)
  })()
} else {
  window.GraphicCustomComponent = Container
}
