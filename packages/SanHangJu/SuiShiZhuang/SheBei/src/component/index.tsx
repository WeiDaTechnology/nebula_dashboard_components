import type * as React from 'react'
import { useEffect, useState } from 'react'
import type { ContainerProps } from '..'
import useStyles from './styles'

declare const BlackHole3D: any
declare const __RUN_ON_LOCAL__: boolean

interface DataItem {
  桩号: string
  立柱倾角Y: string
  立柱倾角X: string
  桩尖高程: string
  累计加料体积: string
  振动锤电流: string
  打桩状态: string
  实际坐标X: string
  实际坐标Y: string
  _dbTime: string
  real_height: number
  设计桩顶: string
  上拔速度: string
  设计桩底: string
  实际桩顶: string
  设备名称: string
  平台倾角Y: string
  实际桩底: string
  下贯速度: string
  设备状态: string
  设计坐标Y: string
  设计坐标X: string
  平台倾角X: string
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

const deviceMap = ['UWDc9mDcDab2', 'Dsg5vJfPfOnt', '81dxLlYPs21f', 'SJTcSLX1oQuX', 'ePsl8aLOsuyB']

const Component: React.FC<ComponentProps> = props => {
  const { style, title = 'DWADRTO1', isOnline = true, visible: controlledVisible, onClose } = props
  const { styles } = useStyles()

  console.log('>>>>>> ')
  const [internalVisible, setInternalVisible] = useState(false)
  const [stationInfo, setStationInfo] = useState<any>({})
  const [deviceId, setDeviceId] = useState<string | null>(null)

  // 优先使用接口返回的设备状态和设备名称
  const deviceStatus: string | undefined = stationInfo['设备状态']
  const deviceName: string | undefined = stationInfo['设备名称']
  const isOnlineStatus = deviceStatus ? deviceStatus === '在线' : isOnline
  const statusText = deviceStatus || (isOnline ? '在线' : '离线')
  const titleText = deviceName || title

  const visible = controlledVisible !== undefined ? controlledVisible : internalVisible

  const handleClose = () => {
    if (controlledVisible === undefined) {
      setInternalVisible(false)
    }
    setDeviceId(null)
    setStationInfo({})
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

  useEffect(() => {
    if (deviceId) {
      setInternalVisible(true)
    }
  }, [deviceId])

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
      console.log('ancData >>>> ', ancData)
      // textInfo "4#碎石桩"
      if (!ancData.textInfo.includes('碎石桩')) return

      const number = ancData.textInfo.split('#')[0] // 设备号码，例如 "4"
      console.log('设备号码 >>>> ', number)

      try {
        const response: { data: DataItem[] } = await window.core.request('bjgraphicplatform/dataSet/executeQuery', {
          data: {
            dataSetUuid: '8f6a36717ac14d52b3740960a264998e',
          },
        })
        const data = response.data
        console.log('接口返回数据 >>>> ', data)

        // 根据设备号码匹配对应的设备数据
        // 设备号码 "4" 对应 "设备名称" 字段为 "设备4"
        const deviceName = `设备${number}`
        const currentDeviceData = data.find(item => item['设备名称'] === deviceName)

        if (currentDeviceData) {
          console.log('当前设备数据 >>>> ', currentDeviceData)
          // 设置当前设备的数据到 stationInfo，这样弹窗就会显示对应的数据
          setStationInfo(currentDeviceData)
          // 显示弹窗
          setInternalVisible(true)
        } else {
          console.warn(`未找到设备号码为 ${number} 的数据`)
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
                    <span className={styles.label}>桩号</span>
                    <span className={styles.value}>{stationInfo['桩号'] || '/'}</span>
                  </div>
                  <div className={styles.dataItem}>
                    <span className={styles.label}>设计坐标Y</span>
                    <span className={styles.value}>{formatValue(stationInfo['设计坐标Y'])}</span>
                  </div>
                  <div className={styles.dataItem}>
                    <span className={styles.label}>实际坐标Y</span>
                    <span className={styles.value}>{formatValue(stationInfo['实际坐标Y'])}</span>
                  </div>
                  <div className={styles.dataItem}>
                    <span className={styles.label}>实际桩长</span>
                    <span className={styles.value}>{formatValue(stationInfo['real_height'])}</span>
                  </div>
                  <div className={styles.dataItem}>
                    <span className={styles.label}>下贯速度</span>
                    <span className={styles.value}>{formatValue(stationInfo['下贯速度'])}</span>
                  </div>
                  <div className={styles.dataItem}>
                    <span className={styles.label}>振动锤电流</span>
                    <span className={styles.value}>{formatValue(stationInfo['振动锤电流'])}</span>
                  </div>
                  <div className={styles.dataItem}>
                    <span className={styles.label}>立柱倾角Y</span>
                    <span className={styles.value}>{stationInfo['立柱倾角Y'] || '/'}</span>
                  </div>
                  <div className={styles.dataItem}>
                    <span className={styles.label}>平台倾角Y</span>
                    <span className={styles.value}>{stationInfo['平台倾角Y'] || '/'}</span>
                  </div>
                </div>

                {/* 右侧列 */}
                <div className={styles.dataColumn}>
                  <div className={styles.dataItem}>
                    <span className={styles.label}>设计坐标X</span>
                    <span className={styles.value}>{formatValue(stationInfo['设计坐标X'])}</span>
                  </div>
                  <div className={styles.dataItem}>
                    <span className={styles.label}>实际坐标X</span>
                    <span className={styles.value}>{formatValue(stationInfo['实际坐标X'])}</span>
                  </div>
                  <div className={styles.dataItem}>
                    <span className={styles.label}>打桩状态</span>
                    <span className={styles.value}>{stationInfo['打桩状态'] || '/'}</span>
                  </div>
                  <div className={styles.dataItem}>
                    <span className={styles.label}>桩尖深度</span>
                    <span className={styles.value}>{formatValue(stationInfo['桩尖高程'], 'm')}</span>
                  </div>
                  <div className={styles.dataItem}>
                    <span className={styles.label}>上拔速度</span>
                    <span className={styles.value}>{formatValue(stationInfo['上拔速度'])}</span>
                  </div>
                  <div className={styles.dataItem}>
                    <span className={styles.label}>立柱倾角X</span>
                    <span className={styles.value}>{stationInfo['立柱倾角X'] || '/'}</span>
                  </div>
                  <div className={styles.dataItem}>
                    <span className={styles.label}>平台倾角X</span>
                    <span className={styles.value}>{stationInfo['平台倾角X'] || '/'}</span>
                  </div>
                  <div className={styles.dataItem}>
                    <span className={styles.label}>累计排出碎石量</span>
                    <span className={styles.value}>{formatValue(stationInfo['累计加料体积'], 'm3')}</span>
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
