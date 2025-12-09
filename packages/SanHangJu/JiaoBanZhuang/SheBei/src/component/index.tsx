import React from 'react'
import { useEffect, useState } from 'react'
import type { ContainerProps } from '..'
import useStyles from './styles'

declare const BlackHole3D: any
declare const __RUN_ON_LOCAL__: boolean

interface DataItem {
  /** 桩号 */
  pileNumber: string
  /** 开始时间 */
  startTime: string
  /** 结束时间 */
  endTime: string
  /** 桩长（m） */
  pileLength: string | number
  /** 桩径（m） */
  pileDiameter: string | number
  /** 加固土量 */
  total: string | number
  /** 设备名称，展示在标题处 */
  deviceName?: string
}
/**
 * 后端返回字段映射：
 * input_oyigkl      -> pileNumber    (桩号)        e.g. "SN-14-460"
 * timepicker_9yn01y -> startTime     (开始时间)    e.g. "08:16:00"
 * timepicker_7y5tba -> endTime       (结束时间)    e.g. "10:51:00"
 * numberinput_ud2fax-> pileLength    (桩长)        e.g. 29.5
 * numberinput_adav79-> pileDiameter  (桩径)        e.g. 1
 * numberinput_91nj00-> total         (加固土量)    e.g. 23.16
 */

/** 后端原始返回数据结构 */
interface BackendDataItem {
  input_oyigkl: string // 桩号
  timepicker_9yn01y: string // 开始时间
  timepicker_7y5tba: string // 结束时间
  numberinput_ud2fax: number // 桩长
  numberinput_adav79: number // 桩径
  numberinput_91nj00: number // 加固土量
}

/** 将后端数据转换为前端数据格式 */
const transformBackendData = (backendData: BackendDataItem): DataItem => ({
  pileNumber: backendData.input_oyigkl,
  startTime: backendData.timepicker_9yn01y,
  endTime: backendData.timepicker_7y5tba,
  pileLength: backendData.numberinput_ud2fax,
  pileDiameter: backendData.numberinput_adav79,
  total: backendData.numberinput_91nj00,
})
interface ComponentProps extends ContainerProps {
  /** 弹窗标题 */
  title?: string
  /** 在线状态 */
  isOnline?: boolean
  /** 是否显示弹窗 */
  visible?: boolean
  /** 关闭回调 */
  onClose?: () => void
  /** 透传的设备数据，便于外部控制和本地调试 */
  data?: DataItem
}

const Component: React.FC<ComponentProps> = props => {
  const { style, title = '水泥搅拌桩', isOnline = true, visible: controlledVisible, onClose, data } = props
  const { styles } = useStyles()

  const [internalVisible, setInternalVisible] = useState(false)
  const [stationInfo, setStationInfo] = useState<DataItem | null>(null)

  // 优先显示传入的数据，否则显示接口获取的数据
  const currentData = data || stationInfo

  // 状态处理：如果有数据则视为在线（或根据具体字段判断），否则使用默认
  const isOnlineStatus = currentData ? true : isOnline
  const statusText = isOnlineStatus ? '在线' : '离线'
  const titleText = currentData?.deviceName || title

  const visible = controlledVisible !== undefined ? controlledVisible : internalVisible

  const handleClose = () => {
    if (controlledVisible === undefined) {
      setInternalVisible(false)
    }
    setStationInfo(null)
    onClose?.()
  }

  // ...
  const formatValue = (value: string | number | undefined, unit?: string): string => {
    if (value === undefined || value === null || value === '') {
      return unit ? `/${unit}` : '/'
    }
    if (typeof value === 'string' && value.startsWith('/')) {
      return value
    }
    return unit ? `${value}${unit}` : String(value)
  }

  // 现场模式：监听三维场景选中事件，按设备号匹配数据
  useEffect(() => {
    const handler = async () => {
      const element = BlackHole3D?.Probe?.getCurCombProbeRet().elemId
      if (
        !BlackHole3D.Anchor.getAllAnc()
          .map((item: any) => item.ancName)
          .includes(element)
      )
        return
      const ancData = BlackHole3D.Anchor.getAnc(element)
      // textInfo "2#搅拌桩"
      if (!ancData.textInfo.includes('桩机')) return

      try {
        // 请求接口数据
        const response: { data: BackendDataItem[] } = await window.core.request('bjgraphicplatform/dataSet/executeQuery', {
          data: {
            dataSetUuid: '9f6abc6d12764dd3b608517ead986b11',
            params: {
              pileNumber: ancData.textInfo,
            },
          },
        })

        const backendData = response.data?.[0]
        console.log('搅拌桩接口返回数据:', backendData)

        if (backendData) {
          // 转换后端数据为前端格式
          const currentDeviceData = transformBackendData(backendData)
          // 将 ancData.textInfo 作为设备名称存入
          currentDeviceData.deviceName = ancData.textInfo
          setStationInfo(currentDeviceData)
          setInternalVisible(true)
        } else {
          console.warn(`未找到桩机${ancData.textInfo}的数据`)
        }
      } catch (error) {
        console.error('获取设备数据失败 >>>> ', error)
      }
    }

    document.addEventListener('RESystemSelShpElement', handler)

    // 组件卸载时自动取消监听
    return () => {
      document.removeEventListener('RESystemSelShpElement', handler)
    }
  }, [])
  const rows = [
    { label: '桩号', value: currentData?.pileNumber },
    { label: '开始时间', value: currentData?.startTime },
    { label: '结束时间', value: currentData?.endTime },
    { label: '桩长（m）', value: currentData?.pileLength },
    { label: '桩径（m）', value: currentData?.pileDiameter },
    { label: '加固土量', value: currentData?.total },
  ]

  return (
    visible && (
      <div
        style={
          __RUN_ON_LOCAL__
            ? {
              width: '100%',
              height: '100vh',
            }
            : {
              ...style,
              width: '640px',
              height: '540px',
              backgroundColor: 'transparent',
              left: 0,
              top: 0,
              display: 'flex',
              transform: `translate(${style?.left}px, ${style?.top}px)`,
            }
        }
      >
        <div className={styles.modalOverlay} onClick={handleClose}>
          <div className={styles.modalContainer} onClick={e => e.stopPropagation()}>
            <div className={styles.header}>
              <div className={styles.statusIndicator}>
                <span
                  className={styles.statusDot}
                  style={{ backgroundColor: isOnlineStatus ? '#52c41a' : '#ff4d4f' }}
                />
                <span className={styles.statusText}>{statusText}</span>
              </div>
              <h2 className={styles.title}>{titleText}</h2>
              <div className={styles.rightActions}>
                <span className={styles.trophyIcon}>🏆</span>
                <button aria-label="关闭" className={styles.closeButton} onClick={handleClose} type="button">
                  ×
                </button>
              </div>
            </div>

            <div className={styles.content}>
              <div className={styles.dataGrid}>
                {rows.map(item => (
                  <div className={styles.dataItem} key={item.label}>
                    <span className={styles.label}>{item.label}</span>
                    <span className={styles.value}>{formatValue(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  )
}
export default Component
