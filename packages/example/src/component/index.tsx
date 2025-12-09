import type * as React from 'react'
import { useEffect, useState } from 'react'
import type { ContainerProps } from '..'
import useStyles from './styles'

interface ComponentProps extends ContainerProps {}

const Component: React.FC<ComponentProps> = props => {
  const { styles } = useStyles()

  const {
    entryAnimiationisShow = false,
    decimalisShow = false,
    postfixisShow = false,
    showTextisShow = false,
    animation_duration = 1000,
    startLoad,
    endLoad,
    ringStyle = 'Round',
    style,
    opacity = 1,
    rotate = 0,
    suffixStyle = 40,
    suffix = '%',
    innerRadius = 0.5,
    direction = 'clockwise',
    dataSourceData,
    processedDataFunc,
    __designMode,
  } = props as any

  const {
    width,
    height,
    backgroundColor = '#4399BA',
    ringColor = '#109bff',
    color = '#fff',
    fontWeight = 600,
    fontSize = 54,
    fontSizeFraction = 34,
    fontSizeFractionDecimal = 1,
    fontFamily,
    fontStyle = 'normal',
    letterSpacing = 0,
  } = style

  // 获取对应字段的数据
  const { rawChartData } =
    processedDataFunc?.({
      designMode: __designMode,
      chartType: 'CUSTOM',
      chartDataConfig: dataSourceData?.chartDataConfig,
    }) || {}
  const valueData = rawChartData?.[0] || []

  const percentRaw = Object.values(valueData)?.[0] as number

  const targetPercent = Math.max(0, Math.min(100, percentRaw)) // 限制在0-100范围
  const [currentPercent, setCurrentPercent] = useState(entryAnimiationisShow ? 0 : targetPercent)

  // 尺寸
  const toNumber = (v: any) => {
    if (typeof v === 'number') {
      return v
    }
    if (typeof v === 'string') {
      return Number.parseFloat(v)
    }
    return
  }
  const w = toNumber(width) // 容器宽度
  const h = toNumber(height) // 容器高度
  const sizeBase = 300 // 基础尺寸
  const size = w && h ? Math.min(w, h) : w || h || sizeBase // 实际尺寸

  const outerRadius = 0.9 // 外圆半径
  const strokeWidth = (outerRadius - Math.min(innerRadius, outerRadius)) * 100 // 圆环宽度
  const radius = (size - strokeWidth) / 2 // 圆环半径
  const circumference = 2 * Math.PI * radius // 圆环周长
  const dashOffset = circumference * (1 - currentPercent / 100) // 进度条偏移量
  const strokeCap = ringStyle === 'Square' ? 'butt' : 'round' // 端点样式

  // 动画效果
  useEffect(() => {
    if (!entryAnimiationisShow) {
      setCurrentPercent(targetPercent)
      return
    }

    if (props.__designMode === 'preview') {
      startLoad?.()
    }

    const startTime = Date.now()
    const startPercent = 0

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / animation_duration, 1)

      const easeOutCubic = (t: number) => 1 - (1 - t) ** 3
      const easedProgress = easeOutCubic(progress)

      const newPercent = startPercent + (targetPercent - startPercent) * easedProgress
      setCurrentPercent(newPercent)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else if (props.__designMode === 'preview') {
        endLoad?.()
      }
    }

    requestAnimationFrame(animate)
  }, [entryAnimiationisShow, animation_duration, targetPercent, startLoad, endLoad, props.__designMode])

  // 当入场动画开关状态变化时重置当前百分比
  useEffect(() => {
    setCurrentPercent(entryAnimiationisShow ? 0 : targetPercent)
  }, [entryAnimiationisShow, targetPercent])

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h2 className={styles.title} style={{ color: style?.color }}>
          <div
            style={{
              width,
              height,
              opacity,
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
                transform: `translate(-50%, -50%) rotate(${rotate}deg)`,
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
                {/* 背景圆环 */}
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  fill="none"
                  r={radius}
                  stroke={backgroundColor}
                  strokeOpacity={0.2}
                  strokeWidth={strokeWidth}
                />
                {/* 进度圆环 */}
                <g>
                  {direction === 'counterclockwise' ? (
                    <circle
                      cx={size / 2}
                      cy={size / 2}
                      fill="none"
                      r={radius}
                      stroke={ringColor}
                      strokeDasharray={circumference}
                      strokeDashoffset={dashOffset}
                      strokeLinecap={strokeCap}
                      strokeWidth={strokeWidth}
                      transform={`scale(-1, 1) translate(${-size} 0) rotate(-90 ${size / 2} ${size / 2})`}
                    />
                  ) : (
                    <circle
                      cx={size / 2}
                      cy={size / 2}
                      fill="none"
                      r={radius}
                      stroke={ringColor}
                      strokeDasharray={circumference}
                      strokeDashoffset={dashOffset}
                      strokeLinecap={strokeCap}
                      strokeWidth={strokeWidth}
                      transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    />
                  )}
                </g>
                {/* 文本 */}
                {showTextisShow && (
                  <text
                    dominantBaseline="middle"
                    fill={color}
                    fontFamily={fontFamily}
                    fontStyle={fontStyle}
                    fontWeight={fontWeight}
                    letterSpacing={letterSpacing}
                    textAnchor="middle"
                    x="50%"
                    y="50%"
                  >
                    {(() => {
                      const fractionDecimal = fontSizeFractionDecimal // 小数部分保留的位数
                      const formatted = currentPercent.toFixed(fractionDecimal) // 格式化百分比
                      const [intPart, fracPart] = formatted.split('.') // 整数部分和小数部分
                      return (
                        <>
                          <tspan fontSize={fontSize}>{intPart}</tspan>
                          {fractionDecimal > 0 && decimalisShow && (
                            <tspan fontSize={fontSizeFraction}>.{fracPart}</tspan>
                          )}
                          {postfixisShow && <tspan fontSize={suffixStyle}>{suffix}</tspan>}
                        </>
                      )
                    })()}
                  </text>
                )}
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
