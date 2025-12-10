import ReactECharts from 'echarts-for-react'
import * as React from 'react'
import { useEffect, useMemo, useState } from 'react'
import type { ContainerProps } from '..'
import useStyles from './styles'

declare const BlackHole3D: any
declare const __RUN_ON_LOCAL__: boolean

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

// 真实的左侧详情数据
// [
//     {
//         "device_key": "DP01808025100001",
//         "depth": 173.06,
//         "piles_scribe": "A4-2",
//         "latitude": 0,
//         "end_time": 1761186120,
//         "begin_time": 1760602418,
//         "longitude": 0,
//         "part_count": 8,
//         "workDuration": 162.14
//     }
// ]
// 真正是字段：
// 区域号
// 开始时间
// 结束时间
// 桩机变化
// 经度
// 纬度
// 总带长
// 组内数量
// 作业时长

// 真实的柱状图数据
// [
//     {
//         "totalPile": 1,
//         "hour_time": "2025-10-23 10:00:00"
//     }
// ]

// 真实的折线图数据
// [
//     {
//         "hour_time": "2025-10-23 10:00:00",
//         "total_length": -0.22
//     }
// ]
// ----------------------------------------------------------------
// 左侧详情真实数据结构
// {
//   "device_key": "DP01808025100001",
//   "depth": 173.06,
//   "piles_scribe": "A4-2",
//   "latitude": 0,
//   "end_time": 1761186120,
//   "begin_time": 1760602418,
//   "longitude": 0,
//   "part_count": 8,
//   "workDuration": 162.14
// }
type LeftDetailItem = {
  device_key: string
  depth: number
  piles_scribe: string
  latitude: number
  end_time: number
  begin_time: number
  longitude: number
  part_count: number
  workDuration: number
  state: number // 1是在线，不是1是离线
}

// 柱状图原始数据
// {
//   "totalPile": 1,
//   "hour_time": "2025-10-23 10:00:00"
// }
type BarChartSourceItem = {
  totalPile?: number
  hour_time?: string
}

// 折线图原始数据
// {
//   "hour_time": "2025-10-23 10:00:00",
//   "total_length": -0.22
// }
type LineChartSourceItem = {
  hour_time?: string
  total_length?: number
}

// 组件内统一的数据结构
type dataItem = LeftDetailItem & {
  barChartData?: BarChartSourceItem[]
  lineChartData?: LineChartSourceItem[]
}

// 图表数据点类型（ECharts 使用）
interface ChartDataPoint {
  time: string
  value: number
}

// 图表数据集合类型：柱状图 + 折线图
interface ChartsData {
  bar: ChartDataPoint[] // 柱状图：每小时打桩数量
  line: ChartDataPoint[] // 折线图：深度变化
}

// 图表接口原始返回
type ChartDataItem = BarChartSourceItem & LineChartSourceItem

// 开发/联调开关：true 使用本地模拟数据，false 走真实接口
// TODO: 上线前请确认改为 false 或删除模拟数据逻辑
const USE_MOCK_DATA = false

// 本地调样式使用的模拟数据
const MOCK_STATION_INFO: dataItem = {
  device_key: 'DP01808025100001',
  depth: 173.06,
  piles_scribe: 'A4-2',
  latitude: 39.9042,
  end_time: 1761186120,
  begin_time: 1760602418,
  longitude: 116.4074,
  part_count: 8,
  workDuration: 162.14,
  barChartData: [
    {
      totalPile: 1,
      hour_time: '2025-10-23 10:00:00',
    },
    {
      totalPile: 3,
      hour_time: '2025-10-23 11:00:00',
    },
    {
      totalPile: 2,
      hour_time: '2025-10-23 12:00:00',
    },
  ],
  lineChartData: [
    {
      total_length: -0.22,
      hour_time: '2025-10-23 10:00:00',
    },
    {
      total_length: 0.5,
      hour_time: '2025-10-23 11:00:00',
    },
    {
      total_length: 1.2,
      hour_time: '2025-10-23 12:00:00',
    },
  ],
}

// 时间戳格式化工具（秒时间戳）
function formatTimestamp(timestamp?: number): string {
  if (!timestamp) return ''
  const date = new Date(timestamp * 1000)
  const Y = date.getFullYear()
  const M = String(date.getMonth() + 1).padStart(2, '0')
  const D = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const m = String(date.getMinutes()).padStart(2, '0')
  const s = String(date.getSeconds()).padStart(2, '0')
  return `${Y}-${M}-${D} ${h}:${m}:${s}`
}

// 将接口返回的 hour_time（如 "2025-10-23 10:00:00"）格式化为 "10-23 10:00"
function formatHourLabel(hourTime?: string): string {
  if (!hourTime) return ''
  // 简单切片，假设格式为 YYYY-MM-DD HH:mm:ss
  const datePart = hourTime.slice(5, 10) // "10-23"
  const timePart = hourTime.slice(11, 16) // "10:00"
  return `${datePart} ${timePart}`
}

// 将 API 返回的图表数据转换为 ECharts 需要的格式
function convertChartData(chartDataItems: ChartDataItem[] = []): ChartsData {
  // 如果没有数据，返回空数组
  if (!chartDataItems || chartDataItems.length === 0) {
    return {
      bar: [],
      line: [],
    }
  }

  const bar: ChartDataPoint[] = []
  const line: ChartDataPoint[] = []

  chartDataItems.forEach(item => {
    // 横轴统一使用 hour_time，并格式化为 "MM-DD HH:mm"
    const time = formatHourLabel(item.hour_time)

    if (item.totalPile !== undefined) {
      bar.push({
        time,
        value: item.totalPile ?? 0,
      })
    }

    if (item.total_length !== undefined) {
      line.push({
        time,
        value: item.total_length ?? 0,
      })
    }
  })

  return {
    bar,
    line,
  }
}

/**
     * bjgraphicplatform/componentGroup/searchComponentGroupRt
     * 
  window.core.request('bjgraphicplatform/componentGroup/searchComponentGroupRt', {
    data: {
        "componentGroupUuid": "67ab8cd4ca414a6f87440f37ff0cc538",
        "projectId": "7ba4853d2391e2ed21528cc1a15a6a37",
        "sceneId": "3a1d6fa5-3b00-4ad7-c6c3-544d8e3afba7"
    },
    skipErrorThrower: true
  })
     */
async function fetchData(childNodeId: string, dataSetId: string): Promise<dataItem | null> {
  const elementParam: any = await window.core.request('bjgraphicplatform/project/element/getElementParam', {
    data: {
      dataSetId,
      childNodeId,
    },
    autoBoxParam: false,
    skipErrorThrower: true,
  })
  let qukuaihao
  elementParam?.elementParams
    ?.find?.((group: any) => {
      console.log('group', group)
      const flag = group?.data?.find?.((e: any) => e?.paramName === '区块号')
      if(flag?.paramValue) {
        qukuaihao = flag?.paramValue
      }
      return !!flag
    })

  // qukuaihao = 'A4-2'
  if (!qukuaihao) {
    return null
  }

  const response: { data: LeftDetailItem[] } = await window.core.request('bjgraphicplatform/dataSet/executeQuery', {
    data: {
      dataSetUuid: '3fbfae9d47164c3a8ffb04a42f2ffe8b',
      params: {
        piles_scribe: qukuaihao,
      },
    },
  })
  const foundData = response.data?.[0]

  // 获取图表数据
  /**
   * [
    {
        "桩号": "S11-9-68",
        "平均频率": 44,
        "平均电流": 350.4,
        "时间段": "11-13 15:00",
        "平均填料量": 30,
        "数据来源表": "fdssz_sg01_002",
        "平均深度": -4.75
    },
    {
        "桩号": "S11-9-68",
        "平均频率": 44,
        "平均电流": 326.33,
        "时间段": "11-13 16:00",
        "平均填料量": 30,
        "数据来源表": "fdssz_sg01_002",
        "平均深度": 0.28
    }
  ]
   */
  // 根数 - 柱状图数据源
  const resBar: { data: BarChartSourceItem[] } = await window.core.request('bjgraphicplatform/dataSet/executeQuery', {
    data: {
      dataSetUuid: '7dc0c80fd7574f76b035fdbf951422d1',
      params: {
        piles_scribe: qukuaihao,
      },
    },
  })

  // 带长 - 折线图数据源
  const resLine: { data: LineChartSourceItem[] } = await window.core.request('bjgraphicplatform/dataSet/executeQuery', {
    data: {
      dataSetUuid: '8aa08c5da0934acb885f7a74360d2466',
      params: {
        piles_scribe: qukuaihao,
      },
    },
  })

  // 合并两个数据集后统一转换为图表数据
  return {
    ...(foundData as LeftDetailItem),
    barChartData: resBar.data,
    lineChartData: resLine.data,
  }
}

const Component: React.FC<ComponentProps> = props => {
  const { style, title, isOnline = true, visible: controlledVisible, onClose } = props
  const { styles } = useStyles()

  console.log('Component', props)
  const [internalVisible, setInternalVisible] = useState(false)
  const [stationInfo, setStationInfo] = useState<dataItem | null>(null)
  const [chartsData, setChartsData] = useState<ChartsData>({
    bar: [],
    line: [],
  })

  const visible = controlledVisible !== undefined ? controlledVisible : internalVisible
  // const visible = true

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

  // 创建图表配置
  const createChartOption = (
    title: string,
    data: ChartDataPoint[],
    unit: string,
    options?: {
      yAxisMin?: number
      yAxisMax?: number
      autoScale?: boolean
    },
  ) => {
    // 自动计算 Y 轴范围
    let yMin = options?.yAxisMin
    let yMax = options?.yAxisMax

    if (options?.autoScale && data.length > 0) {
      const values = data.map(d => d.value)
      const dataMin = Math.min(...values)
      const dataMax = Math.max(...values)
      const range = dataMax - dataMin

      // 如果数据变化很小，使用固定范围
      if (range < 1) {
        yMin = Math.floor(dataMin - 2)
        yMax = Math.ceil(dataMax + 2)
      } else {
        // 添加 10% 的边距
        const margin = range * 0.1
        yMin = Math.floor(dataMin - margin)
        yMax = Math.ceil(dataMax + margin)
      }
    }

    return {
      title: {
        text: title,
        left: 10,
        top: 10,
        textStyle: {
          color: '#fff',
          fontSize: 16,
          fontWeight: 500,
        },
      },
      grid: {
        left: '50',
        right: '20',
        top: '50',
        bottom: '40',
        containLabel: false,
      },
      xAxis: {
        type: 'category',
        data: data.map(d => d.time),
        axisLine: {
          lineStyle: {
            color: 'rgba(90, 159, 184, 0.5)',
          },
        },
        axisLabel: {
          color: '#fff',
          fontSize: 12,
          rotate: 45,
          interval: 0,
        },
        axisTick: {
          show: false,
        },
      },
      yAxis: {
        type: 'value',
        min: yMin,
        max: yMax,
        scale: true,
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          color: '#fff',
          fontSize: 12,
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(90, 159, 184, 0.1)',
            type: 'dashed',
          },
        },
      },
      series: [
        {
          type: 'line',
          data: data.map(d => d.value),
          smooth: true,
          lineStyle: {
            color: '#4dd9ff',
            width: 2,
          },
          itemStyle: {
            color: '#4dd9ff',
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: 'rgba(77, 217, 255, 0.3)',
                },
                {
                  offset: 1,
                  color: 'rgba(77, 217, 255, 0.05)',
                },
              ],
            },
          },
          symbol: 'circle',
          symbolSize: 4,
          emphasis: {
            focus: 'series',
            itemStyle: {
              color: '#4dd9ff',
              borderColor: '#fff',
              borderWidth: 2,
            },
          },
        },
      ],
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(20, 30, 50, 0.9)',
        borderColor: 'rgba(64, 150, 255, 0.5)',
        borderWidth: 1,
        textStyle: {
          color: '#fff',
          fontSize: 13,
        },
        formatter: (params: any) => {
          const param = params[0]
          return `${param.name}<br/>${param.seriesName || title}: ${param.value}${unit}`
        },
      },
    }
  }

  // 使用 useMemo 优化图表配置
  // 柱状图：每小时打桩数量
  const barChartOption = useMemo(
    () =>
      createChartOption('根数', chartsData.bar, '根', {
        autoScale: true,
        yAxisMin: 0,
      }),
    [chartsData.bar],
  )

  // 折线图：带长变化
  const lineChartOption = useMemo(
    () =>
      createChartOption('带长（m）', chartsData.line, 'm', {
        autoScale: true,
        // 带长可能出现负值，这里只做自动缩放，不强行从 0 开始
      }),
    [chartsData.line],
  )

  useEffect(() => {
    // 使用本地模拟数据：直接填充数据并显示弹窗，不绑定 BlackHole3D 事件
    if (USE_MOCK_DATA) {
      const mergedChartItems: ChartDataItem[] = [
        ...((MOCK_STATION_INFO.barChartData || []) as ChartDataItem[]),
        ...((MOCK_STATION_INFO.lineChartData || []) as ChartDataItem[]),
      ]
      const mockCharts = convertChartData(mergedChartItems)
      setStationInfo(MOCK_STATION_INFO)
      setChartsData(mockCharts)
      setInternalVisible(true)
      return
    }

    async function RESystemSelElement() {
      console.log('-- 鼠标探测模型事件 --', BlackHole3D.Probe.getCurCombProbeRet())
      const res = BlackHole3D.Probe.getCurCombProbeRet()
      const childNodeId = res.elemId
      const dataSetId = res.dataSetId
      const data: dataItem | null | undefined = await fetchData(childNodeId, dataSetId)
      console.log('data', data)

      // 如果获取到数据，设置到状态并显示弹窗
      if (data) {
        setStationInfo(data)
        // 使用真实图表数据（barChartData / lineChartData），如果没有则图表为空
        const hasRealCharts = data.barChartData || data.lineChartData
        const mergedChartItems: ChartDataItem[] = [
          ...((data.barChartData || []) as ChartDataItem[]),
          ...((data.lineChartData || []) as ChartDataItem[]),
        ]
        const realCharts = hasRealCharts
          ? convertChartData(mergedChartItems)
          : {
              bar: [],
              line: [],
            }
        setChartsData(realCharts)
        setInternalVisible(true)
      }
    }

    document.addEventListener('RESystemSelElement', RESystemSelElement) //鼠标探测模型事件（左键单击和右键单击）
    // 组件卸载时自动取消监听
    return () => {
      document.removeEventListener('RESystemSelElement', RESystemSelElement)
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
                <span className={styles.statusDot} style={{ backgroundColor: isOnline ? '#52c41a' : '#ff4d4f' }} />
                <span className={styles.statusText}>在线</span>
              </div>
              <h2 className={styles.title}>{stationInfo?.device_key || title || '/'}</h2>
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
                    <span className={styles.label}>区域号</span>
                    <span className={styles.value}>{stationInfo?.piles_scribe || '/'}</span>
                  </div>
                  <div className={styles.dataItem}>
                    <span className={styles.label}>开始时间</span>
                    <span className={styles.value}>
                      {stationInfo ? formatTimestamp(stationInfo.begin_time) || '/' : '/'}
                    </span>
                  </div>
                  <div className={styles.dataItem}>
                    <span className={styles.label}>结束时间</span>
                    <span className={styles.value}>
                      {stationInfo ? formatTimestamp(stationInfo.end_time) || '/' : '/'}
                    </span>
                  </div>
                  <div className={styles.dataItem}>
                    <span className={styles.label}>桩机编号</span>
                    <span className={styles.value}>{stationInfo?.device_key || '/'}</span>
                  </div>
                  <div className={styles.dataItem}>
                    <span className={styles.label}>经度</span>
                    <span className={styles.value}>{formatValue(stationInfo?.longitude)}</span>
                  </div>
                  <div className={styles.dataItem}>
                    <span className={styles.label}>纬度</span>
                    <span className={styles.value}>{formatValue(stationInfo?.latitude)}</span>
                  </div>
                  <div className={styles.dataItem}>
                    <span className={styles.label}>总带长</span>
                    <span className={styles.value}>{formatValue(stationInfo?.depth, 'm')}</span>
                  </div>
                  <div className={styles.dataItem}>
                    <span className={styles.label}>组内数量（根）</span>
                    <span className={styles.value}>{formatValue(stationInfo?.part_count)}</span>
                  </div>
                  <div className={styles.dataItem}>
                    <span className={styles.label}>作业时长（小时）</span>
                    <span className={styles.value}>{formatValue(stationInfo?.workDuration)}</span>
                  </div>
                </div>

                {/* 右侧图表区域 */}
                <div className={styles.rightPanel}>
                  {/* 柱状图：每小时打桩数量 */}
                  <div className={styles.chartContainer}>
                    <ReactECharts
                      option={barChartOption}
                      opts={{ renderer: 'canvas' }}
                      style={{ height: '100%', width: '100%' }}
                    />
                  </div>

                  {/* 折线图：深度变化 */}
                  <div className={styles.chartContainer}>
                    <ReactECharts
                      option={lineChartOption}
                      opts={{ renderer: 'canvas' }}
                      style={{ height: '100%', width: '100%' }}
                    />
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
