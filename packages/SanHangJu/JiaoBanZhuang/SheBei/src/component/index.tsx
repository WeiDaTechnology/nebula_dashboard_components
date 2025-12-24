import type React from 'react'
import { useEffect, useState } from 'react'
import type { ContainerProps } from '..'
import useStyles from './styles'

declare const BlackHole3D: any
declare const __RUN_ON_LOCAL__: boolean

interface DataItem {
  /** 桩号 */
  pileNumber: string
  /** 桩径（mm） */
  pileDiameter: string | number
  /** 钻孔深度（m） */
  depth: string | number
  /** 开始时间 */
  time: string
  /** 下沉/提升速度（m/min） */
  sinkingLift: string | number
  /** 瞬时浆量（L/min） */
  instantaneous: string | number
  /** 累计浆量（m³） */
  cumulative: string | number
  /** 倾斜角度X（°） */
  tiltX: string | number
  /** 倾斜角度Y（°） */
  tiltY: string | number
  /** 钻杆电流（A） */
  current: string | number
  /** 钻杆转速（r/min） */
  speed: string | number
  /** 设备名称，展示在标题处 */
  deviceName?: string
}

/**
 * 后端返回字段映射：
 * pileNumber    -> pileNumber      (桩号)           e.g. "SN-15-47"
 * pileDiameter  -> pileDiameter    (桩径)           e.g. "1000"
 * depth         -> depth           (钻孔深度)       e.g. "8.59"
 * time          -> time            (开始时间)       e.g. "2025-12-23 12:53:11"
 * sinkingIift   -> sinkingLift     (下沉/提升速度)  e.g. "0.46"
 * instantaneous -> instantaneous   (瞬时浆量)       e.g. "100"
 * cumulative    -> cumulative      (累计浆量)       e.g. "1.7075"
 * tiltX         -> tiltX           (倾斜角度X)      e.g. "-0.23"
 * tiltY         -> tiltY           (倾斜角度Y)      e.g. "-0.23"
 * current       -> current         (钻杆电流)       e.g. "39.7"
 * speed         -> speed           (钻杆转速)       e.g. "19.0"
 */

/** 后端原始返回数据结构 */
interface BackendDataItem {
  pileNumber: string // 桩号
  pileDiameter: string // 桩径
  depth: string // 钻孔深度
  time: string // 开始时间
  sinkingIift: string // 下沉/提升速度（注意后端拼写）
  instantaneous: string // 瞬时浆量
  cumulative: string // 累计浆量
  tiltX: string // 倾斜角度X
  tiltY: string // 倾斜角度Y
  current: string // 钻杆电流
  speed: string // 钻杆转速
}

/** 连接状态接口返回数据结构 */
interface ConnectionStatusItem {
  /** 连接状态：0-未知, 1-已连接, 2-超时, 3-断开 */
  connection_state: number
}

/** 连接状态枚举 */
const CONNECTION_STATE = {
  UNKNOWN: 0,
  CONNECTED: 1,
  TIMEOUT: 2,
  DISCONNECTED: 3,
} as const

/** 获取连接状态文本 */
const getConnectionStatusText = (state: number): string => {
  switch (state) {
    case CONNECTION_STATE.CONNECTED:
      return '在线'
    case CONNECTION_STATE.TIMEOUT:
      return '超时'
    case CONNECTION_STATE.DISCONNECTED:
      return '离线'
    case CONNECTION_STATE.UNKNOWN:
    default:
      return '未知'
  }
}

/** 获取连接状态颜色 */
const getConnectionStatusColor = (state: number): string => {
  switch (state) {
    case CONNECTION_STATE.CONNECTED:
      return '#52c41a' // 绿色
    case CONNECTION_STATE.TIMEOUT:
      return '#faad14' // 橙色
    case CONNECTION_STATE.DISCONNECTED:
      return '#ff4d4f' // 红色
    case CONNECTION_STATE.UNKNOWN:
    default:
      return '#8c8c8c' // 灰色
  }
}

/** 将后端数据转换为前端数据格式 */
const transformBackendData = (backendData: BackendDataItem): DataItem => ({
  pileNumber: backendData.pileNumber,
  pileDiameter: backendData.pileDiameter,
  depth: backendData.depth,
  time: backendData.time,
  sinkingLift: backendData.sinkingIift, // 注意后端字段拼写为 sinkingIift
  instantaneous: backendData.instantaneous,
  cumulative: backendData.cumulative,
  tiltX: backendData.tiltX,
  tiltY: backendData.tiltY,
  current: backendData.current,
  speed: backendData.speed,
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
  const [connectionState, setConnectionState] = useState<number>(CONNECTION_STATE.UNKNOWN)

  // 优先显示传入的数据，否则显示接口获取的数据
  const currentData = data || stationInfo

  // 状态处理：使用接口返回的连接状态
  const statusText = getConnectionStatusText(connectionState)
  const statusColor = getConnectionStatusColor(connectionState)
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
      if (!ancData.textInfo.startsWith('桩')) return

      try {
        // 请求接口数据
        const response: { data: BackendDataItem[] } = await window.core.request(
          'bjgraphicplatform/dataSet/executeQuery',
          {
            data: {
              dataSetUuid: 'bd458c39684946c7a634fa3b5aeb9328',
              params: {
                pileDriverName: ancData.textInfo,
              },
            },
          },
        )
        const statusResponse: { data: ConnectionStatusItem[] } = await window.core.request(
          'bjgraphicplatform/dataSet/executeQuery',
          {
            data: {
              dataSetUuid: 'e9a0c2b9904140a8b2ddf7ed304c1bfe',
              params: {
                boxName: ancData.textInfo,
              },
            },
          },
        )

        const backendData = response.data?.[0]
        const statusData = statusResponse.data?.[0]
        console.log('搅拌桩接口返回数据:', backendData)
        console.log('连接状态接口返回数据:', statusData)

        // 更新连接状态
        if (statusData?.connection_state !== undefined) {
          setConnectionState(statusData.connection_state)
        } else {
          setConnectionState(CONNECTION_STATE.UNKNOWN)
        }

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
    { label: '桩径', value: currentData?.pileDiameter, unit: 'mm' },
    { label: '钻孔深度', value: currentData?.depth, unit: 'm' },
    { label: '开始时间', value: currentData?.time },
    { label: '下沉/提升速度', value: currentData?.sinkingLift, unit: 'm/min' },
    { label: '瞬时浆量', value: currentData?.instantaneous, unit: 'L/min' },
    { label: '累计浆量', value: currentData?.cumulative, unit: 'm³' },
    { label: '倾斜角度X', value: currentData?.tiltX, unit: '°' },
    { label: '倾斜角度Y', value: currentData?.tiltY, unit: '°' },
    { label: '钻杆电流', value: currentData?.current, unit: 'A' },
    { label: '钻杆转速', value: currentData?.speed, unit: 'r/min' },
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
                height: '680px',
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
                <span className={styles.statusDot} style={{ backgroundColor: statusColor }} />
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
                    <span className={styles.value}>{formatValue(item.value, item.unit)}</span>
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
