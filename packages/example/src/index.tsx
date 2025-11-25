import './public-path.js'
import type React from 'react'
import { createRoot } from 'react-dom/client'
import Component from './component/index'
import { configure } from './configure'
import { ExampleSetter } from './setters'

declare const __RUN_ON_LOCAL__: boolean

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
    configure,
    setter: [ExampleSetter],
  })
}
