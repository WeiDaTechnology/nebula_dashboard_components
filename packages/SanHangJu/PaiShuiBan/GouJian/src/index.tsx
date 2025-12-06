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
        pileNumber: 'S11-11-55',
        designCoordinateX: 3_293_000,
        designCoordinateY: 501_916,
        actualCoordinateX: 3_293_000,
        actualCoordinateY: 501_916,
        actualPileLength: 33,
        penetrationSpeed: 0,
        extractionSpeed: 2,
        vibratoryHammerCurrent: 342,
        columnTiltAngleX: 0,
        columnTiltAngleY: 0,
        platformTiltAngleX: 0,
        platformTiltAngleY: 0,
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
