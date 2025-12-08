import { type FC, useCallback, useEffect, useState } from 'react'
import runImg from '../asserts/run.png'

const IMAGE_BASE_URL = '/api/bjfiles/filesFilter/'

const Component: FC<any> = props => {
  const {
    is_open_animation = true,
    is_reverse = false,
    Radius = 12,
    head_icon,
    color1 = '#1DDBE6',
    // color2 = '#2984D9',
    scale_font_size = 16,
    progress_font_size = 18,
    dataSourceData,
    startLoad,
    onLoad,
  } = props
  const { scale_font_color, progress_font_color } = props
  const [icon_url, setIconUrl] = useState('')
  const ticks = [0, 20, 40, 60, 80, 90, 100]
  // const value = Math.max(0, Math.min(100, dataSourceData.processedData[0][0].value ?? 65.0))
  const value = Number(dataSourceData.processedData?.[0]?.[0]?.value ?? 0)
  const duration = Math.max(0, Number(props?.animation_duration ?? 400))

  const [renderValue, setRenderValue] = useState(is_open_animation ? 0 : value)
  const [displayValue, setDisplayValue] = useState(is_open_animation ? 0 : value)

  const transitionDuration = is_open_animation ? duration : 0

  const buildImageUrl = useCallback((imageUrl?: string, width?: number, height?: number): string => {
    if (!imageUrl) {
      return ''
    }
    let url = IMAGE_BASE_URL + imageUrl
    if (width && height) {
      url += `?size=${width}x${height}`
    }
    return url
  }, [])

  // console.log('props.__designMode', dataSourceData)

  useEffect(() => {
    setIconUrl(buildImageUrl(head_icon))
  }, [head_icon, buildImageUrl])

  useEffect(() => {
    if (is_open_animation) {
      // 触发开始加载回调
      if (props.__designMode === 'preview') {
        startLoad?.()
      }

      if (is_reverse) {
        // 反向加载：进度条长度从0开始，从刻度100向0延伸
        setRenderValue(0)
        setDisplayValue(0)
        const start = performance.now()
        let rafId = 0
        const step = (now: number) => {
          const t = Math.min(1, (now - start) / duration)
          const currentValue = value * t
          setDisplayValue(currentValue)
          setRenderValue(currentValue)
          if (t < 1) {
            rafId = requestAnimationFrame(step)
          } else if (props.__designMode === 'preview') {
            // 加载结束,触发回调
            onLoad?.()
          }
        }
        rafId = requestAnimationFrame(step)
        return () => {
          cancelAnimationFrame(rafId)
        }
      }
      // 正向加载：从0向100加载
      setRenderValue(0)
      setDisplayValue(0)
      const start = performance.now()
      let rafId = 0
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / duration)
        setDisplayValue(value * t)
        if (t < 1) {
          rafId = requestAnimationFrame(step)
        } else if (props.__designMode === 'preview') {
          // 加载结束,触发回调
          onLoad?.()
        }
      }
      rafId = requestAnimationFrame(step)
      const id = requestAnimationFrame(() => setRenderValue(value))
      return () => {
        cancelAnimationFrame(id)
        cancelAnimationFrame(rafId)
      }
    }
    // 无动画模式,直接触发开始和结束回调
    if (props.__designMode === 'preview') {
      startLoad?.()
      onLoad?.()
    }
  }, [is_open_animation, value, duration, is_reverse, startLoad, onLoad, props.__designMode])

  return (
    <div style={{ width: '100%', display: 'flex', alignItems: 'center' }}>
      <div style={{ width: 'calc(100% - 400px)', margin: '0 auto' }}>
        <div style={{ position: 'relative' }}>
          {/* 图标 */}
          <img
            alt="图标"
            height={Math.round((props.style.height / 10) * 2.5)}
            src={head_icon ? icon_url : runImg}
            style={{
              position: 'absolute',
              right: is_reverse ? `${renderValue}%` : `${100 - renderValue}%`,
              left: is_reverse ? 'auto' : 'unset',
              transform: is_reverse ? 'translateX(50%) rotateY(180deg)' : 'translateX(50%)',
              bottom: '100%',
              width: `${(props.style.height / 10) * 2.5}px`,
              transition: `right ${transitionDuration}ms linear, left ${transitionDuration}ms linear`,
            }}
            width={Math.round((props.style.height / 10) * 2.5)}
          />
          <div
            style={{
              width: '100%',
              height: `${props.style.height / 10}px`,
              backgroundColor: '#ccc',
              borderRadius: `${Radius ?? 12}px`,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${renderValue}%`,
                height: '100%',
                // backgroundImage: is_reverse ? "linear-gradient(270deg, #2984D9 0%, #1DDBE6 100%)" : "linear-gradient(90deg, #2984D9 0%, #1DDBE6 100%)",
                // backgroundImage: is_reverse
                //   ? `linear-gradient(270deg, ${color1} 0%, ${color2} 100%)`
                //   : `linear-gradient(90deg, ${color1} 0%, ${color2} 100%)`,
                backgroundColor: color1,
                borderRadius: `${Radius ?? 12}px`,
                transition: `width ${transitionDuration}ms linear`,
                marginLeft: is_reverse ? 'auto' : '0',
              }}
            />
            {ticks.map(p => (
              <div
                key={p}
                style={{
                  position: 'absolute',
                  left: `${p}%`,
                  top: 0,
                  height: '100%',
                  borderLeft: '1px dashed #3C414B',
                  transform: 'translateX(-0.5px)',
                }}
              />
            ))}
            <div
              style={{
                position: 'absolute',
                right: is_reverse ? `${renderValue}%` : 'auto',
                left: is_reverse ? 'auto' : `${renderValue}%`,
                top: '50%',
                transform: is_reverse ? 'translate(50%, -50%)' : 'translate(-100%, -50%)',
                marginRight: is_reverse ? -8 : 'auto',
                marginLeft: is_reverse ? 'auto' : -8,
                color: progress_font_color ?? '#FFFFFF',
                fontWeight: 700,
                // 进度字体
                fontSize: progress_font_size ?? 16,
                zIndex: 2,
                whiteSpace: 'nowrap',
                transition: `right ${transitionDuration}ms linear, left ${transitionDuration}ms linear`,
              }}
            >
              {`${displayValue.toFixed(1)}%`}
            </div>
          </div>
        </div>
        {/* 刻度 */}
        <div style={{ position: 'relative', height: 18, marginTop: 6 }}>
          {ticks.map(p => (
            <div
              key={p}
              style={{
                position: 'absolute',
                left: `${p}%`,
                transform: 'translateX(-50%)',
                color: scale_font_color ?? '#3C414B',
                fontSize: scale_font_size ?? 14,
                lineHeight: '18px',
              }}
            >
              {p}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
export default Component
