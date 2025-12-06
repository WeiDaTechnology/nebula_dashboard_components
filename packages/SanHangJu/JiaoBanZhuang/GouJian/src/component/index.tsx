import ReactECharts from 'echarts-for-react'
import type React from 'react'
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
  /** 外部传入的构建数据（便于本地调试或强制展示） */
  data?: dataItem & {
    barChartData?: BarChartSourceItem[]
    lineChartData?: LineChartSourceItem[]
  }
}
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
}

// 柱状图原始数据
// {
//   "totalPile": 1,
//   "hour_time": "2025-10-23 10:00:00"
// }
type BarChartSourceItem = {
  /** 累计浆量（m³）或累计桩量（兼容旧字段 totalPile） */
  total_volume?: number
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

    const volumeValue = item.total_volume ?? item.totalPile
    if (volumeValue !== undefined) {
      bar.push({
        time,
        value: volumeValue ?? 0,
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

// 兜底模拟数据，便于本地演示和在无接口时回显
const fallbackDataMap: Record<string, dataItem> = {
  A402: {
    device_key: 'DP01808025100001',
    depth: 173.06,
    piles_scribe: 'A4-2',
    latitude: 0,
    end_time: 1_761_186_120,
    begin_time: 1_760_602_418,
    longitude: 0,
    part_count: 8,
    workDuration: 162.14,
    barChartData: [
      { total_volume: 120, hour_time: '2025-10-23 10:00:00' },
      { total_volume: 260, hour_time: '2025-10-23 11:00:00' },
      { total_volume: 320, hour_time: '2025-10-23 12:00:00' },
    ],
    lineChartData: [
      { total_length: 26, hour_time: '2025-10-23 10:00:00' },
      { total_length: 35, hour_time: '2025-10-23 11:00:00' },
      { total_length: 28, hour_time: '2025-10-23 12:00:00' },
    ],
  },
  A403: {
    device_key: 'DP01808025100002',
    depth: 168.5,
    piles_scribe: 'A4-3',
    latitude: 0,
    end_time: 1_761_200_000,
    begin_time: 1_760_700_000,
    longitude: 0,
    part_count: 6,
    workDuration: 120.5,
    barChartData: [
      { total_volume: 90, hour_time: '2025-10-24 09:00:00' },
      { total_volume: 140, hour_time: '2025-10-24 10:00:00' },
      { total_volume: 210, hour_time: '2025-10-24 11:00:00' },
    ],
    lineChartData: [
      { total_length: 24, hour_time: '2025-10-24 09:00:00' },
      { total_length: 30, hour_time: '2025-10-24 10:00:00' },
      { total_length: 32, hour_time: '2025-10-24 11:00:00' },
    ],
  },
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
  const zhanghao = elementParam?.elementParams
    ?.find?.((e: any) => e.group === '用户定义属性')
    ?.data?.find?.((e: any) => e?.paramName === '桩号')?.paramValue

  // zhuanghao = "SN-10-147"
  if (!zhanghao) {
    return null
  }

  const response: { data: LeftDetailItem[] } = await window.core.request('bjgraphicplatform/dataSet/executeQuery', {
    data: {
      dataSetUuid: '73b7a18253e9491db99c17858bf82eab',
      params: {
        piles_scribe: zhanghao,
      },
    },
  })
  const foundData = response.data?.[0]

  // 根数 - 柱状图数据源
  const resBar: { data: BarChartSourceItem[] } = await window.core.request('bjgraphicplatform/dataSet/executeQuery', {
    data: {
      dataSetUuid: '7dc0c80fd7574f76b035fdbf951422d1',
      params: {
        piles_scribe: zhanghao,
      },
    },
  })

  // 带长 - 折线图数据源
  const resLine: { data: LineChartSourceItem[] } = await window.core.request('bjgraphicplatform/dataSet/executeQuery', {
    data: {
      dataSetUuid: '73b7a18253e9491db99c17858bf82eab',
      params: {
        piles_scribe: zhanghao,
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
  const { style, title, isOnline = true, visible: controlledVisible, onClose, data } = props
  const { styles } = useStyles()

  const [internalVisible, setInternalVisible] = useState(false)
  const [stationInfo, setStationInfo] = useState<dataItem | null>(null)
  const [chartsData, setChartsData] = useState<ChartsData>({
    bar: [],
    line: [],
  })

  const defaultData = useMemo(() => {
    if (data) return data
    // 默认取 A4-2 这一组兜底数据
    return fallbackDataMap.A402
  }, [data])

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

  // 本地 / 外部强制数据模式
  useEffect(() => {
    if (__RUN_ON_LOCAL__ || data) {
      setStationInfo(defaultData)
      const combinedChart = convertChartData([
        ...((defaultData.barChartData || []) as ChartDataItem[]),
        ...((defaultData.lineChartData || []) as ChartDataItem[]),
      ])
      setChartsData(combinedChart)
      setInternalVisible(true)
    }
  }, [data, defaultData])

  // 创建图表配置
  const createChartOption = (
    title: string,
    data: ChartDataPoint[],
    unit: string,
    options?: {
      yAxisMin?: number
      yAxisMax?: number
      autoScale?: boolean
      chartType?: 'line' | 'bar'
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

    const chartType = options?.chartType || 'line'

    // 根据图表类型创建不同的 series 配置
    const seriesConfig =
      chartType === 'bar'
        ? {
          type: 'bar',
          data: data.map(d => d.value),
          itemStyle: {
            color: '#4dd9ff',
          },
          emphasis: {
            focus: 'series',
            itemStyle: {
              color: '#4dd9ff',
              borderColor: '#fff',
              borderWidth: 2,
            },
          },
        }
        : {
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
      series: [seriesConfig],
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
      createChartOption('深度（m）', chartsData.bar, 'm', {
        autoScale: true,
        yAxisMin: 0,
      }),
    [chartsData.bar],
  )

  // 柱状图：累计浆量
  const lineChartOption = useMemo(
    () =>
      createChartOption('累计浆量（m³）', chartsData.line, 'm³', {
        autoScale: true,
        chartType: 'bar',
        yAxisMin: 0,
      }),
    [chartsData.line],
  )

  useEffect(() => {
    async function RESystemSelElement() {
      console.log('-- 鼠标探测模型事件 --', BlackHole3D.Probe.getCurCombProbeRet())
      const res = BlackHole3D.Probe.getCurCombProbeRet()

      // 如果是搅拌桩设备，交由 SheBei 组件处理，此处不弹窗
      if (res?.ancText?.includes('搅拌桩')) {
        return
      }

      const childNodeId = res.elemId
      const dataSetId = res.dataSetId
      const data: dataItem | null | undefined = await fetchData(childNodeId, dataSetId)
      console.log('data', data)

      // 如果获取到数据，设置到状态并显示弹窗
      if (data) {
        setStationInfo(data)
        const mergedChartItems: ChartDataItem[] = [
          ...((data.barChartData || []) as ChartDataItem[]),
          ...((data.lineChartData || []) as ChartDataItem[]),
        ]
        setChartsData(convertChartData(mergedChartItems))
        setInternalVisible(true)
      } else {
        // 如果接口无数据，则尝试使用兜底数据（基于桩号）
        const zhuanghao = res?.ancText || '' // 期望格式如 "SN-10-147"，没有则为空
        const key = (zhuanghao || '').replace(/[^0-9a-z]/gi, '').toUpperCase()
        const fallback = key ? fallbackDataMap[key] : defaultData
        setStationInfo(fallback || defaultData)
        const mergedChartItems: ChartDataItem[] = [
          ...(((fallback || defaultData).barChartData || []) as ChartDataItem[]),
          ...(((fallback || defaultData).lineChartData || []) as ChartDataItem[]),
        ]
        setChartsData(convertChartData(mergedChartItems))
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
                    <span className={styles.label}>桩号</span>
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
                    <span className={styles.label}>桩长</span>
                    <span className={styles.value}>{stationInfo?.device_key || '/'}</span>
                  </div>
                  <div className={styles.dataItem}>
                    <span className={styles.label}>累计浆量</span>
                    <span className={styles.value}>{formatValue(stationInfo?.longitude)}</span>
                  </div>
                  <div className={styles.dataItem}>
                    <span className={styles.label}>纬度</span>
                    <span className={styles.value}>{formatValue(stationInfo?.latitude)}</span>
                  </div>
                  <div className={styles.dataItem}>
                    <span className={styles.label}>总带长（m）</span>
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
