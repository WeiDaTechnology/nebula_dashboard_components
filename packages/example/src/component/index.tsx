import type * as React from 'react'
import { useEffect, useMemo, useState } from 'react'
import type { ContainerProps } from '..'
import useStyles from './styles'

interface ComponentProps extends ContainerProps {}

const Component: React.FC<ComponentProps> = props => {
  //const { style } = props
  const { styles } = useStyles()
  // 进度条设置
  const percentRaw =
    typeof (props as any).percent === 'number'
      ? (props as any).percent
      : typeof props.value === 'number'
        ? props.value
        : 37
  const targetPercent = Math.max(0, Math.min(100, percentRaw)) // 限制在0-100范围
  const [currentPercent, setCurrentPercent] = useState((props as any).entryAnimiation?.isShow ? 0 : targetPercent)

  const style = props.style || {}

  // 尺寸
  const toNumber = (v: any) => (typeof v === 'number' ? v : typeof v === 'string' ? Number.parseFloat(v) : undefined)
  const w = toNumber(style.width) // 容器宽度
  const h = toNumber(style.height) // 容器高度
  const sizeBase = typeof (props as any).size === 'number' ? (props as any).size : 300 // 基础尺寸
  const size = w && h ? Math.min(w, h) : w || h || sizeBase // 实际尺寸

  // 圆环几何计算
  const outerRadius = (props as any).outerRadius || 0.9 // 外圆半径
  const innerRadius = (props as any).innerRadius || 0.5 // 内圆半径
  const strokeWidth = (outerRadius - Math.min(innerRadius, outerRadius)) * 100 // 圆环宽度
  const radius = (size - strokeWidth) / 2 // 圆环半径
  const circumference = 2 * Math.PI * radius // 圆环周长
  const dashOffset = circumference * (1 - currentPercent / 100) // 进度条偏移量

  // 进度条样式
  const gradId = useMemo(() => `grad-${Math.random().toString(36).slice(2)}`, []) // 渐变ID
  const direction = (props as any).direction === 'counterclockwise' ? 'counterclockwise' : 'clockwise' // 方向
  const strokeCap = (props as any).ringStyle === 'Square' ? 'butt' : 'round' // 端点样式

  // 动画效果
  useEffect(() => {
    // 如果入场动画开关关闭，直接显示目标百分比
    if (!(props as any).entryAnimiation?.isShow) {
      setCurrentPercent(targetPercent)
      return
    }

    const startTime = Date.now()
    const startPercent = currentPercent
    const animationDuration = (props as any).animation_duration || 1000 // 默认1秒

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / animationDuration, 1)

      // 使用缓动函数让动画更自然
      const easeOutCubic = (t: number) => 1 - (1 - t) ** 3
      const easedProgress = easeOutCubic(progress)

      const newPercent = startPercent + (targetPercent - startPercent) * easedProgress
      setCurrentPercent(newPercent)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [targetPercent, (props as any).animation_duration, currentPercent, (props as any).entryAnimiation?.isShow])

  // 当入场动画开关状态变化时重置当前百分比
  useEffect(() => {
    setCurrentPercent((props as any).entryAnimiation?.isShow ? 0 : targetPercent)
  }, [(props as any).entryAnimiation?.isShow, targetPercent])

  useEffect(() => {
    const { startLoad, endLoad } = props as any
    startLoad?.()
    endLoad?.()
  }, [])

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h2 className={styles.title} style={{ color: style?.color }}>
          <div
            style={{
              width: style.width ?? '100%',
              height: style.height ?? '100%',
              opacity: (props as any).opacity ?? 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              boxSizing: 'border-box',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                width: w || sizeBase,
                height: h || sizeBase,
                left: '50%',
                top: '50%',
                display: 'flex',
                transform: `translate(-50%, -50%) rotate(${(props as any).rotate ?? 0}deg)`,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg
                aria-label={`Progress circle ${Math.round(currentPercent)}%`}
                height={size}
                role="img"
                style={{ display: 'block', maxWidth: '100%', maxHeight: '100%' }}
                viewBox={`0 0 ${size} ${size}`}
                width={size}
              >
                <defs>
                  <linearGradient id={gradId} x1="0%" x2="100%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor={(props as any).ringColor1 ?? '#1890ff'} />
                    <stop offset="100%" stopColor={(props as any).ringColor2 ?? '#1ee3e8'} />
                  </linearGradient>
                </defs>
                {/* 背景圆环 */}
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  fill="none"
                  r={radius}
                  stroke={style.backgroundColor ?? '#4399BA'}
                  strokeOpacity={0.2}
                  strokeWidth={strokeWidth} // 背景圆环不填充
                />
                {/* 进度圆环 */}
                <g>
                  {direction === 'counterclockwise' ? (
                    <circle
                      cx={size / 2}
                      cy={size / 2}
                      fill="none"
                      r={radius} // 进度条颜色
                      stroke={`url(#${gradId})`}
                      strokeDasharray={circumference} // 端点样式
                      strokeDashoffset={dashOffset} // 进度条周长
                      strokeLinecap={strokeCap} // 进度条偏移量
                      strokeWidth={strokeWidth}
                      transform={`scale(-1, 1) translate(${-size} 0) rotate(-90 ${size / 2} ${size / 2})`}
                    />
                  ) : (
                    <circle
                      cx={size / 2}
                      cy={size / 2}
                      fill="none"
                      r={radius}
                      stroke={`url(#${gradId})`}
                      strokeDasharray={circumference}
                      strokeDashoffset={dashOffset}
                      strokeLinecap={strokeCap}
                      strokeWidth={strokeWidth}
                      transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    />
                  )}
                </g>
                {/* 文本 */}
                <text dominantBaseline="middle" fill={style.color ?? '#fff'} textAnchor="middle" x="50%" y="50%">
                  {(() => {
                    const fractionDecimal = (style as any).fontSizeFractionDecimal ?? 1 // 小数部分保留的位数
                    const formatted = currentPercent.toFixed(fractionDecimal) // 格式化百分比
                    const [intPart, fracPart] = formatted.split('.') // 整数部分和小数部分
                    return (
                      <>
                        <tspan
                          fontFamily={style.fontFamily}
                          fontSize={style.fontSize ?? 54}
                          fontStyle={style.fontStyle}
                          fontWeight={style.fontWeight ?? 600}
                          letterSpacing={style.letterSpacing}
                        >
                          {intPart}
                        </tspan>
                        {fractionDecimal > 0 && (
                          <tspan fontSize={(style as any).fontSizeFraction ?? 34} fontWeight={600}>
                            .{fracPart}
                          </tspan>
                        )}
                        <tspan fontSize={(props as any).suffixStyle ?? 40} fontWeight={600}>
                          {(props as any).suffix ?? '%'}
                        </tspan>
                      </>
                    )
                  })()}
                </text>
              </svg>
            </div>
          </div>
        </h2>
        {/* <p className={styles.description}>这是一个自定义组件展示</p> */}
      </div>
    </div>
  )
}

export default Component
