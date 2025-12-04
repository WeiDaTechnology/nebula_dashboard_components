import type * as React from 'react'
import { useEffect, useState } from 'react'
import type { ContainerProps } from '..'
import useStyles from './styles'

declare const BlackHole3D: any
declare const __RUN_ON_LOCAL__: boolean

// {
//     "桩号": "S11-1-12",
//     "立柱倾角Y": "-0.27",
//     "立柱倾角X": "-0.85",
//     "桩尖高程": "-1.23",
//     "累计加料体积": "30.00",
//     "振动锤电流": "325.5",
//     "打桩状态": "开始打桩",
//     "实际坐标X": "0.000",
//     "实际坐标Y": "0.000",
//     "real_height": 32,
//     "设计桩顶": "0.00",
//     "上拔速度": "1.67",
//     "设计桩底": "-32.00",
//     "实际桩顶": "0.00",
//     "平台倾角Y": "-0.00",
//     "实际桩底": "-32.00",
//     "下贯速度": "0.00",
//     "设备状态": "离线",
//     "设计坐标Y": "0.000",
//     "设计坐标X": "0.000",
//     "平台倾角X": "-0.03"
// }
interface DataItem {
  /** 区域号（组号） */
  区域号组号?: string
  /** 开始时间 */
  开始时间?: string
  /** 结束时间 */
  结束时间?: string
  /** 桩机编号 */
  桩机编号?: string
  /** 经度 */
  经度?: string | number
  /** 纬度 */
  纬度?: string | number
  /** 总带长（m） */
  总带长?: number
  /** 组内数量（根） */
  组内数量?: number
  /** 作业时长（小时） */
  作业时长?: number
  /** 允许透传其它字段，便于调试和扩展 */
  [key: string]: any
  /** 图表数据 */
  chartData?: DataItem[]
}

interface ChartsData {
  length: DataItem[]
  count: DataItem[]
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

  console.log('Component', props)
  const [internalVisible, setInternalVisible] = useState(false)
  const [stationInfo, setStationInfo] = useState<DataItem | null>(null)
  const [chartsData, setChartsData] = useState<ChartsData>({
    length: [],
    count: [],
  })

  // 如果接口里有设备状态、设备名称，优先使用接口返回值
  const deviceStatus: string | undefined = stationInfo?.['设备状态']
  const deviceName: string | undefined = stationInfo?.['设备名称']
  const isOnlineStatus = deviceStatus ? deviceStatus === '在线' : isOnline
  const statusText = deviceStatus || (isOnline ? '在线' : '离线')
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
      // textInfo "4#排水版"
      if (!ancData.textInfo.includes('排水版')) return

      const number = ancData.textInfo.split('#')[0] // 设备号码，例如 "4"
      console.log('设备号码 >>>> ', number)

      try {
        const response: { data: DataItem[] } = await window.core.request('bjgraphicplatform/dataSet/executeQuery', {
          data: {
            dataSetUuid: 'a4c871ac861b4b94864b98d8e288c0d4',
            params: {
              device_key: `DP0180802510000${number}`,
            },
          },
        })
        // 柱状图数据  过去十小时数据，没有的后端就不返回，需要前端补全
        /**
         * [
              {
                  "totalPile": 1,
                  "hour_time": "2025-10-23 10:00:00"
              }
          ]
         */
        const response2: { data: DataItem[] } = await window.core.request('bjgraphicplatform/dataSet/executeQuery', {
          data: {
            dataSetUuid: '7dc0c80fd7574f76b035fdbf951422d1',
            params: {
              piles_scribe: `A4-${number}`,
            },
          },
        })
        // 折线图 过去十小时数据，没有的后端就不返回，需要前端补全
        /**
         * [
    {
        "hour_time": "2025-10-23 10:00:00",
        "total_length": -0.22
    }
]
         */
        const response3: { data: DataItem[] } = await window.core.request('bjgraphicplatform/dataSet/executeQuery', {
          data: {
            dataSetUuid: '8aa08c5da0934acb885f7a74360d2466',
            params: {
              piles_scribe: `A4-${number}`,
            },
          },
        })
        const currentDeviceData = response.data?.[0]
        console.log('接口返回数据 >>>> ', currentDeviceData)

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
                width: '1000px',
                height: '650px',
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
              <div className={styles.mainLayout}>
                {/* 左侧数据列表 */}
                <div className={styles.leftPanel}>
                  <div className={styles.dataItem}>
                    <span className={styles.label}>区域号（组号）</span>
                    <span className={styles.value}>{stationInfo?.['区域号组号'] || '/'}</span>
                  </div>
                  <div className={styles.dataItem}>
                    <span className={styles.label}>开始时间</span>
                    <span className={styles.value}>{stationInfo?.['开始时间'] || '/'}</span>
                  </div>
                  <div className={styles.dataItem}>
                    <span className={styles.label}>结束时间</span>
                    <span className={styles.value}>{stationInfo?.['结束时间'] || '/'}</span>
                  </div>
                  <div className={styles.dataItem}>
                    <span className={styles.label}>桩机编号</span>
                    <span className={styles.value}>{stationInfo?.['桩机编号'] || '/'}</span>
                  </div>
                  <div className={styles.dataItem}>
                    <span className={styles.label}>经度</span>
                    <span className={styles.value}>{formatValue(stationInfo?.['经度'])}</span>
                  </div>
                  <div className={styles.dataItem}>
                    <span className={styles.label}>纬度</span>
                    <span className={styles.value}>{formatValue(stationInfo?.['纬度'])}</span>
                  </div>
                  <div className={styles.dataItem}>
                    <span className={styles.label}>总带长（m）</span>
                    <span className={styles.value}>{formatValue(stationInfo?.['总带长'], 'm')}</span>
                  </div>
                  <div className={styles.dataItem}>
                    <span className={styles.label}>组内数量（根）</span>
                    <span className={styles.value}>{formatValue(stationInfo?.['组内数量'], '根')}</span>
                  </div>
                  <div className={styles.dataItem}>
                    <span className={styles.label}>作业时长（小时）</span>
                    <span className={styles.value}>{formatValue(stationInfo?.['作业时长'], 'h')}</span>
                  </div>
                </div>

                {/* 右侧图表区域 */}
                <div className={styles.rightPanel}>
                  {/* 带长折线图 */}
                  <div className={styles.chartContainer}></div>

                  {/* 根数柱状图 */}
                  <div className={styles.chartContainer}></div>
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
