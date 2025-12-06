import './public-path.js'
import  React from 'react'
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
        pileNumber: 'JBZ-LOCAL-01',
        startTime: '2025-01-10 08:30',
        endTime: '2025-01-10 09:20',
        pileTopElevation: '12.45m',
        pileBottomElevation: '-8.05m',
        pileLength: 20.5,
        pileDiameter: 0.8,
        durationMinutes: 50,
        slurryUsage: '5.1m³',
        cementUsage: '4.5m³',
        deviceName: '本地调试设备',
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
