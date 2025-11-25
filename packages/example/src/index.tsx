import './public-path.js'
import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import Component from './component/index'
import { configure } from './configure/index'
import { Setter1 } from './setter/index'

declare const __RUN_ON_LOCAL__: boolean

interface ComProps {
  style?:React.CSSProperties
}
export default function Container(props:ComProps) {
  const { style } = props

  return (
    <>
      <div
        style={__RUN_ON_LOCAL__
          ? {}
          : {
              ...style,
              backgroundColor: 'transparent',
              left: 0,
              top: 0,
              display: 'flex',
              transform: `translate(${style?.left}px, ${style?.top}px)`
            }}
      >
        <Component {...props}/>
      </div>
    </>
  )
}

if (__RUN_ON_LOCAL__) {
  (() => {
    const container = document.getElementById('app-root')
    const root = createRoot(container)
    root.render(
      <Container />
    )
  })()
} else {
  window.GraphicCustomComponent = Container
  window.registerGraphicCustomComponent?.({
    component: Container,
    interaction: true,
    configure: configure,
    setter: []
  })
}
