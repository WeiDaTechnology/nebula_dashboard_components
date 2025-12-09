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
/** 映射后的数据类型 */
type LeftDetailItem = {
  pileNumber: string // 桩号
  startTime: string // 开始时间
  endTime: string // 结束时间
  pileLength: number // 桩长
  pileTop: number // 桩顶标高
  pileBottom: number // 桩底标高
  pileDiameter: number // 桩径
  constructionTime: number // 施工用时
  mudUsage: number // 泥浆用量
  actualUsage: number // 实际用量
}

/** 接口返回的原始数据类型 */
type RawDetailItem = {
  input_oyigkl?: string // 桩号
  timepicker_9yn01y?: string // 开始时间
  timepicker_7y5tba?: string // 结束时间
  numberinput_ud2fax?: number // 桩长
  numberinput_tyhh44?: number // 桩顶标高
  numberinput_2yuqgd?: number // 桩底标高
  numberinput_adav79?: number // 桩径
  numberinput_u601gj?: number // 施工用时
  numberinput_euculc?: number // 泥浆用量
  numberinput_yhycce?: number // 实际用量
}

/** 字段映射表：原始字段名 -> 映射后字段名 */
const fieldMapping: Record<string, keyof LeftDetailItem> = {
  input_oyigkl: 'pileNumber',
  timepicker_9yn01y: 'startTime',
  timepicker_7y5tba: 'endTime',
  numberinput_ud2fax: 'pileLength',
  numberinput_tyhh44: 'pileTop',
  numberinput_2yuqgd: 'pileBottom',
  numberinput_adav79: 'pileDiameter',
  numberinput_u601gj: 'constructionTime',
  numberinput_euculc: 'mudUsage',
  numberinput_yhycce: 'actualUsage',
}

/** 将原始数据映射为标准字段 */
function mapDetailItem(rawData: RawDetailItem): LeftDetailItem {
  const result: Record<string, unknown> = {}
  for (const [rawKey, mappedKey] of Object.entries(fieldMapping)) {
    if (rawKey in rawData) {
      result[mappedKey] = rawData[rawKey as keyof RawDetailItem]
    }
  }
  return result as LeftDetailItem
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

/** 生成模拟图表数据 */
function generateMockChartData(): { barChartData: BarChartSourceItem[]; lineChartData: LineChartSourceItem[] } {
  const now = new Date()
  const barChartData: BarChartSourceItem[] = []
  const lineChartData: LineChartSourceItem[] = []

  // 生成最近 8 小时的数据
  for (let i = 7; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 60 * 60 * 1000)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hour = String(date.getHours()).padStart(2, '0')
    const hourTime = `${year}-${month}-${day} ${hour}:00:00`

    // 柱状图：深度数据，随机 50-150
    barChartData.push({
      total_volume: Math.floor(Math.random() * 100) + 50,
      hour_time: hourTime,
    })

    // 折线图：累计浆量，递增趋势 + 随机波动
    lineChartData.push({
      total_length: Math.floor((8 - i) * 100 + Math.random() * 50),
      hour_time: hourTime,
    })
  }

  return { barChartData, lineChartData }
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

  const response: { data: RawDetailItem[] } = await window.core.request('bjgraphicplatform/dataSet/executeQuery', {
    data: {
      dataSetUuid: '73b7a18253e9491db99c17858bf82eab',
      params: {
        pileNumber: zhanghao,
      },
    },
  })
  const rawData = response.data?.[0]
  // 将原始数据映射为标准字段
  const foundData = rawData ? mapDetailItem(rawData) : null

  if (!foundData) {
    return null
  }

  // 使用模拟的图表数据
  const { barChartData, lineChartData } = generateMockChartData()

  return {
    ...foundData,
    barChartData,
    lineChartData,
  }
}

const Component: React.FC<ComponentProps> = props => {
  const { style, title, visible: controlledVisible, onClose, data } = props
  const { styles } = useStyles()

  const [internalVisible, setInternalVisible] = useState(false)
  const [stationInfo, setStationInfo] = useState<dataItem | null>(null)
  const [chartsData, setChartsData] = useState<ChartsData>({
    bar: [],
    line: [],
  })

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

  // 外部传入数据模式
  useEffect(() => {
    if (data) {
      setStationInfo(data)
      // 如果外部数据有图表数据则使用，否则生成模拟数据
      const { barChartData, lineChartData } = data.barChartData || data.lineChartData
        ? { barChartData: data.barChartData, lineChartData: data.lineChartData }
        : generateMockChartData()
      const combinedChart = convertChartData([
        ...((barChartData || []) as ChartDataItem[]),
        ...((lineChartData || []) as ChartDataItem[]),
      ])
      setChartsData(combinedChart)
      setInternalVisible(true)
    }
  }, [data])

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
      const childNodeId = res.elemId
      const dataSetId = res.dataSetId
      if (dataSetId !== '3a1de1fd-6753-5904-22ec-5eba998b1105') return
      const data: dataItem | null | undefined = await fetchData(childNodeId, dataSetId)
      console.log('data', data)

      // 如果获取到数据，设置到状态并显示弹窗；否则不显示
      if (data) {
        setStationInfo(data)
        const mergedChartItems: ChartDataItem[] = [
          ...((data.barChartData || []) as ChartDataItem[]),
          ...((data.lineChartData || []) as ChartDataItem[]),
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
              <h2 className={styles.title}>{stationInfo?.pileNumber || title || '/'}</h2>
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
                    <span className={styles.value}>{stationInfo?.pileNumber || '/'}</span>
                  </div>
                  <div className={styles.dataItem}>
                    <span className={styles.label}>开始时间</span>
                    <span className={styles.value}>{stationInfo?.startTime || '/'}</span>
                  </div>
                  <div className={styles.dataItem}>
                    <span className={styles.label}>结束时间</span>
                    <span className={styles.value}>{stationInfo?.endTime || '/'}</span>
                  </div>
                  <div className={styles.dataItem}>
                    <span className={styles.label}>桩长（m）</span>
                    <span className={styles.value}>{formatValue(stationInfo?.pileLength, 'm')}</span>
                  </div>
                  <div className={styles.dataItem}>
                    <span className={styles.label}>桩顶标高（m）</span>
                    <span className={styles.value}>{formatValue(stationInfo?.pileTop, 'm')}</span>
                  </div>
                  <div className={styles.dataItem}>
                    <span className={styles.label}>桩底标高（m）</span>
                    <span className={styles.value}>{formatValue(stationInfo?.pileBottom, 'm')}</span>
                  </div>
                  <div className={styles.dataItem}>
                    <span className={styles.label}>桩径（m）</span>
                    <span className={styles.value}>{formatValue(stationInfo?.pileDiameter, 'm')}</span>
                  </div>
                  <div className={styles.dataItem}>
                    <span className={styles.label}>施工用时（min）</span>
                    <span className={styles.value}>{formatValue(stationInfo?.constructionTime, 'min')}</span>
                  </div>
                  <div className={styles.dataItem}>
                    <span className={styles.label}>泥浆用量（L）</span>
                    <span className={styles.value}>{formatValue(stationInfo?.mudUsage, 'L')}</span>
                  </div>
                  <div className={styles.dataItem}>
                    <span className={styles.label}>实际用量（m³）</span>
                    <span className={styles.value}>{formatValue(stationInfo?.actualUsage, 'm³')}</span>
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
