import type React from 'react'
import { useEffect, useMemo, useState } from 'react'
import type { ContainerProps } from '..'
import useStyles from './styles'

declare const BlackHole3D: any
declare const __RUN_ON_LOCAL__: boolean

interface MixerPileData {
  /** 桩号 */
  pileNumber: string
  /** 开始时间 */
  startTime: string
  /** 结束时间 */
  endTime: string
  /** 桩顶标高 */
  pileTopElevation: string
  /** 桩底标高 */
  pileBottomElevation: string
  /** 桩长（m） */
  pileLength: string | number
  /** 桩径（m） */
  pileDiameter: string | number
  /** 施工用时（分钟） */
  durationMinutes: string | number
  /** 泥浆用量 */
  slurryUsage: string | number
  /** 实际水泥用量 */
  cementUsage: string | number
  /** 设备名称，展示在标题处 */
  deviceName?: string
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
  /** 透传的设备数据，便于外部控制和本地调试 */
  data?: MixerPileData
}

const fallbackDataMap: Record<string, MixerPileData> = {
  '1': {
    pileNumber: 'JBZ-001',
    startTime: '2025-01-10 08:30',
    endTime: '2025-01-10 09:15',
    pileTopElevation: '12.50m',
    pileBottomElevation: '-8.20m',
    pileLength: 20.7,
    pileDiameter: 0.8,
    durationMinutes: 45,
    slurryUsage: '5.2m³',
    cementUsage: '4.6m³',
    deviceName: '1号机',
  },
  '2': {
    pileNumber: 'JBZ-002',
    startTime: '2025-01-10 09:40',
    endTime: '2025-01-10 10:28',
    pileTopElevation: '12.30m',
    pileBottomElevation: '-8.00m',
    pileLength: 20.3,
    pileDiameter: 0.8,
    durationMinutes: 48,
    slurryUsage: '5.0m³',
    cementUsage: '4.4m³',
    deviceName: '2号机',
  },
  '3': {
    pileNumber: 'JBZ-003',
    startTime: '2025-01-10 10:50',
    endTime: '2025-01-10 11:45',
    pileTopElevation: '12.10m',
    pileBottomElevation: '-8.10m',
    pileLength: 20.2,
    pileDiameter: 0.8,
    durationMinutes: 55,
    slurryUsage: '5.4m³',
    cementUsage: '4.7m³',
    deviceName: '3号机',
  },
}

const Component: React.FC<ComponentProps> = props => {
  const { style, title = '水泥搅拌桩', isOnline = true, visible: controlledVisible, onClose, data } = props
  const { styles } = useStyles()

  const [internalVisible, setInternalVisible] = useState(false)
  const [stationInfo, setStationInfo] = useState<MixerPileData | null>(null)

  const defaultData = useMemo(() => data || fallbackDataMap['1'], [data])

  const isOnlineStatus = isOnline
  const statusText = isOnline ? '在线' : '离线'
  const titleText = stationInfo?.deviceName || title

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
    if (typeof value === 'string' && value.startsWith('/')) {
      return value
    }
    return unit ? `${value}${unit}` : String(value)
  }

  // 本地调试：直接展示一条默认数据
  useEffect(() => {
    if (__RUN_ON_LOCAL__) {
      setStationInfo(defaultData)
      setInternalVisible(true)
    }
  }, [defaultData])

  // 现场模式：监听三维场景选中事件，按设备号匹配假数据
  useEffect(() => {
    const handler = () => {
      try {
        const element = BlackHole3D?.Probe?.getCurCombProbeRet?.()?.elemId
        const anchorNames = BlackHole3D?.Anchor?.getAllAnc?.()?.map((item: any) => item.ancName) || []
        if (!(element && anchorNames.includes(element))) return

        const ancData = BlackHole3D?.Anchor?.getAnc?.(element)
        const textInfo: string = ancData?.textInfo || ''
        if (!textInfo.includes('搅拌桩')) return

        const number = (textInfo.split('#')[0] || '').trim()
        const matchedData = fallbackDataMap[number] || defaultData

        setStationInfo(matchedData)
        setInternalVisible(true)
      } catch (error) {
        console.error('处理搅拌桩弹窗失败 >>> ', error)
      }
    }

    document.addEventListener('RESystemSelShpElement', handler)
    return () => {
      document.removeEventListener('RESystemSelShpElement', handler)
    }
  }, [defaultData])

  const rows = [
    { label: '桩号', value: stationInfo?.pileNumber },
    { label: '开始时间', value: stationInfo?.startTime },
    { label: '结束时间', value: stationInfo?.endTime },
    { label: '桩顶标高', value: stationInfo?.pileTopElevation },
    { label: '桩底标高', value: stationInfo?.pileBottomElevation },
    { label: '桩长（m）', value: stationInfo?.pileLength },
    { label: '桩径（m）', value: stationInfo?.pileDiameter },
    { label: '施工用时（分钟）', value: stationInfo?.durationMinutes },
    { label: '泥浆用量', value: stationInfo?.slurryUsage },
    { label: '实际水泥用量', value: stationInfo?.cementUsage },
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
