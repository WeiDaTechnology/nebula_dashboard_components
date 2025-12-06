import type * as React from 'react'
import { useEffect, useState } from 'react'
import type { ContainerProps } from '..'
import useStyles from './styles'

declare const BlackHole3D: any
declare const __RUN_ON_LOCAL__: boolean

// {
//   "rpressure": 0,
//   "device_key": "DP01808025100002",
//   "device_name": "2号机",
//   "acc_num": 27,
//   "y_angle": 0.718083322048187,
//   "rlongitude": 0,
//   "begin_time": 1763444616,
//   "angle": 3.47016382217407,
//   "state": 1,
//   "rlatitude": 0,
//   "acc_deep": 230.242614746094,
//   "x_angle": -0.774583339691162
// }
interface DataItem {
  rpressure: number
  device_key: string
  device_name: string
  acc_num: number
  y_angle: number
  rlongitude: number
  begin_time: number
  angle: number
  state: number
  rlatitude: number
  acc_deep: number
  x_angle: number
  /** 由场景中的编号推导出来的区域号（设备号码），例如 "4" */
  region?: string
}

interface ComponentProps extends ContainerProps {
  /** 弹窗标题 */
  title?: string
  /** 在线状态 */
  isOnline?: boolean
  /** 是否显示弹窗 */
  visible?: boolean
  /** 关闭回调 */
  onClose?: () => void
}

const Component: React.FC<ComponentProps> = props => {
  const { style, title = 'DWADRTO1', isOnline = true, visible: controlledVisible, onClose } = props
  const { styles } = useStyles()

  const [internalVisible, setInternalVisible] = useState(false)
  const [stationInfo, setStationInfo] = useState<DataItem | null>(null)

  // 如果接口里有设备状态、设备名称，优先使用接口返回值
  const deviceState: number | undefined = stationInfo?.state
  const deviceName: string | undefined = stationInfo?.device_name
  const isOnlineStatus = deviceState !== undefined ? deviceState === 1 : isOnline
  const statusText = deviceState !== undefined ? (deviceState === 1 ? '在线' : '离线') : isOnline ? '在线' : '离线'
  const titleText = deviceName || title

  const visible = controlledVisible !== undefined ? controlledVisible : internalVisible

  const handleClose = () => {
    if (controlledVisible === undefined) {
      setInternalVisible(false)
    }
    setStationInfo(null)
    onClose?.()
  }

  const formatValue = (value: string | number | undefined, unit?: string): string => {
    if (value === undefined || value === null || value === '') {
      return unit ? `/${unit}` : '/'
    }
    // 如果值本身就是带单位的字符串格式（如 "/m"），直接返回
    if (typeof value === 'string' && value.startsWith('/')) {
      return value
    }
    // 对于有单位的值，直接拼接，不添加空格
    return unit ? `${value}${unit}` : String(value)
  }
  const formatTimestamp = (timestamp?: number | null): string => {
    if (!timestamp) return '/'
    try {
      return new Date(timestamp * 1000).toLocaleString()
    } catch {
      return String(timestamp)
    }
  }
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
     
      const number = ancData.textInfo[0] // 设备号码，例如 "4"

      try {
        const response: { data: DataItem[] } = await window.core.request('bjgraphicplatform/dataSet/executeQuery', {
          data: {
            dataSetUuid: 'a4c871ac861b4b94864b98d8e288c0d4',
            params: {
              device_name: ancData.textInfo,
            },
          },
        })

        const currentDeviceData = response.data?.[0]

        /**
         * 最新接口返回示例（单条）：
         * {
         *   "rpressure": 0,
         *   "device_key": "DP01808025100002",
         *   "device_name": "2号机",
         *   "acc_num": 27,
         *   "y_angle": 0.718083322048187,
         *   "rlongitude": 0,
         *   "begin_time": 1763444616,
         *   "angle": 3.47016382217407,
         *   "state": 1,
         *   "rlatitude": 0,
         *   "acc_deep": 230.242614746094,
         *   "x_angle": -0.774583339691162
         * }
         *
         */

        if (currentDeviceData) {
          // 设置当前设备的数据到 stationInfo，这样弹窗就会显示对应的数据
          setStationInfo({
            ...currentDeviceData,
            region: number,
          })
          // 显示弹窗
          setInternalVisible(true)
        } else {
          // 未找到对应设备数据时不弹窗
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
                width: '560px',
                height: '640px',
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
            {/* 标题栏 */}
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

            {/* 内容区域 */}
            <div className={styles.content}>
              <div className={styles.dataGrid}>
                {/* 左侧列 */}
                <div className={styles.dataColumn}>
                  <div className={styles.dataItem}>
                    <span className={styles.label}>排水版设备名称</span>
                    <span className={styles.value}>{stationInfo?.device_name ?? '/'}</span>
                  </div>
                  <div className={styles.dataItem}>
                    <span className={styles.label}>区域号</span>
                    <span className={styles.value}>{stationInfo?.region ?? '/'}</span>
                  </div>
                  <div className={styles.dataItem}>
                    <span className={styles.label}>经度</span>
                    <span className={styles.value}>{formatValue(stationInfo?.rlongitude)}</span>
                  </div>
                  <div className={styles.dataItem}>
                    <span className={styles.label}>纬度</span>
                    <span className={styles.value}>{formatValue(stationInfo?.rlatitude)}</span>
                  </div>
                  <div className={styles.dataItem}>
                    <span className={styles.label}>组内根数</span>
                    <span className={styles.value}>{formatValue(stationInfo?.acc_num)}</span>
                  </div>
                  <div className={styles.dataItem}>
                    <span className={styles.label}>带长</span>
                    <span className={styles.value}>{formatValue(stationInfo?.acc_deep, 'm')}</span>
                  </div>
                </div>

                {/* 右侧列 */}
                <div className={styles.dataColumn}>
                  <div className={styles.dataItem}>
                    <span className={styles.label}>开始时间</span>
                    <span className={styles.value}>{stationInfo ? formatTimestamp(stationInfo.begin_time) : '/'}</span>
                  </div>
                  <div className={styles.dataItem}>
                    <span className={styles.label}>结束时间</span>
                    <span className={styles.value}>/</span>
                  </div>
                  <div className={styles.dataItem}>
                    <span className={styles.label}>X轴角度</span>
                    <span className={styles.value}>{formatValue(stationInfo?.x_angle)}</span>
                  </div>
                  <div className={styles.dataItem}>
                    <span className={styles.label}>Y轴角度</span>
                    <span className={styles.value}>{formatValue(stationInfo?.y_angle)}</span>
                  </div>
                  <div className={styles.dataItem}>
                    <span className={styles.label}>角度</span>
                    <span className={styles.value}>{formatValue(stationInfo?.angle)}</span>
                  </div>
                  <div className={styles.dataItem}>
                    <span className={styles.label}>压力</span>
                    <span className={styles.value}>{formatValue(stationInfo?.rpressure)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  )
}
export default Component
