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
  data?: dataItem
}
/** 映射后的数据类型 */
type LeftDetailItem = {
  pileNumber: string // 桩号
  pileLength: string | number // 桩长（m）
  pileDiameter: string | number // 桩径（m）
  pileTop: number // 桩顶标高
  pileBottom: number // 桩底标高
  cementContent?: string | number // 水泥掺量
  startTime: string // 开始时间
  endTime: string // 结束时间
  sinkingTime: number // 下沉用时（s）
  enhanceTime: number // 提升用时（s）
  constructionTime: number // 施工用时（s）
  current: string | number | null // 着底电流（A）
  speed: string | number | null // 钻杆转速（r/min）
  sinkingSpeed: string | number // 下沉速度（m/min）
  increaseSpeed: string | number // 提升速度（m/min）
  waterAsh: string | number // 水灰比
  instantaneous: string | number // 水泥浆流量（L/min）
  cumulative: string | number // 水泥用量（m³）
}

/** 接口返回的原始数据类型 */
type RawDetailItem = {
  pileNumber?: string // 桩号
  depth?: string | number // 桩长
  pileDiameter?: string | number // 桩径
  pileTop?: number // 桩顶标高
  pileLow?: number // 桩底标高
  startTime?: string // 开始时间
  endTime?: string // 结束时间
  sinkingTime?: number // 下沉用时
  enhanceUse?: number // 提升用时
  construction?: number // 施工用时
  current?: string | number | null // 着底电流
  speed?: string | number | null // 钻杆转速
  sinking_iift?: string | number // 下沉速度
  increaseSpeed?: string | number // 提升速度
  water_ash?: string | number // 水灰比
  instantaneous?: string | number // 水泥浆流量
  cumulative?: string | number // 水泥用量
}

/** 将原始数据映射为标准字段 */
function mapDetailItem(rawData: RawDetailItem): LeftDetailItem {
  return {
    pileNumber: rawData.pileNumber || '',
    pileLength: rawData.depth ?? '',
    pileDiameter: rawData.pileDiameter ?? '',
    pileTop: rawData.pileTop ?? 0,
    pileBottom: rawData.pileLow ?? 0,
    startTime: rawData.startTime || '',
    endTime: rawData.endTime || '',
    sinkingTime: rawData.sinkingTime ?? 0,
    enhanceTime: rawData.enhanceUse ?? 0,
    constructionTime: rawData.construction ?? 0,
    current: rawData.current ?? null,
    speed: rawData.speed ?? null,
    sinkingSpeed: rawData.sinking_iift ?? '',
    increaseSpeed: rawData.increaseSpeed ?? '',
    waterAsh: rawData.water_ash ?? '',
    instantaneous: rawData.instantaneous ?? '',
    cumulative: rawData.cumulative ?? '',
  }
}

// 图表接口返回数据类型
// { data: {time: string, depth: number, cumulative: number}[] }
type ChartSourceItem = {
  time?: string // 时间
  depth?: number // 深度
  cumulative?: number // 累计浆量
}

// 组件内统一的数据结构
type dataItem = LeftDetailItem & {
  chartData?: ChartSourceItem[]
}

// 图表数据点类型（ECharts 使用）
interface ChartDataPoint {
  time: string
  value: number
}

// 图表数据集合类型：深度 + 累计浆量
interface ChartsData {
  depth: ChartDataPoint[] // 深度变化
  cumulative: ChartDataPoint[] // 累计浆量
}

// 将接口返回的时间（如 "2025-10-23 10:00:00"）格式化为 "10-23 10:00"
function formatHourLabel(hourTime?: string): string {
  if (!hourTime) return ''
  // 简单切片，假设格式为 YYYY-MM-DD HH:mm:ss
  const datePart = hourTime.slice(5, 10) // "10-23"
  const timePart = hourTime.slice(11, 16) // "10:00"
  return `${datePart} ${timePart}`
}

// 将 API 返回的图表数据转换为 ECharts 需要的格式
function convertChartData(chartDataItems: ChartSourceItem[] = []): ChartsData {
  // 如果没有数据，返回空数组
  if (!chartDataItems || chartDataItems.length === 0) {
    return {
      depth: [],
      cumulative: [],
    }
  }

  const depth: ChartDataPoint[] = []
  const cumulative: ChartDataPoint[] = []

  chartDataItems.forEach(item => {
    const time = formatHourLabel(item.time)

    if (item.depth !== undefined) {
      depth.push({
        time,
        value: item.depth ?? 0,
      })
    }

    if (item.cumulative !== undefined) {
      cumulative.push({
        time,
        value: item.cumulative ?? 0,
      })
    }
  })

  return {
    depth,
    cumulative,
  }
}

/** 生成模拟图表数据（备用） */
function generateMockChartData(): ChartSourceItem[] {
  const now = new Date()
  const chartData: ChartSourceItem[] = []

  // 生成最近 8 小时的数据
  for (let i = 7; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 60 * 60 * 1000)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hour = String(date.getHours()).padStart(2, '0')
    const time = `${year}-${month}-${day} ${hour}:00:00`

    chartData.push({
      time,
      depth: Math.floor(Math.random() * 100) + 50,
      cumulative: Number(((8 - i) * 0.5 + Math.random() * 0.2).toFixed(2)),
    })
  }

  return chartData
}

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
    ?.flatMap?.((e: any) => e?.data || [])
    ?.find?.((e: any) => e?.paramName === '桩号')?.paramValue

  if (!zhanghao) {
    return null
  }

  // 获取左侧详情数据
  const response: { data: RawDetailItem[] } = await window.core.request('bjgraphicplatform/dataSet/executeQuery', {
    data: {
      dataSetUuid: '84a7ce9e3f354233855d99e90d7d35c5',
      params: {
        pileNumber: zhanghao,
      },
    },
  })

  // 获取右侧图表数据

  const chartResponse: { data: ChartSourceItem[] } = await window.core.request(
    'bjgraphicplatform/dataSet/executeQuery',
    {
      data: {
        dataSetUuid: '8d1d7c276e4841fe8caea245c38abb55',
        params: {
          pileDriverName: zhanghao,
        },
      },
    },
  )

  const rawData = response.data?.[0]
  const foundData = rawData ? mapDetailItem(rawData) : null

  if (!foundData) {
    return null
  }

  // 使用真实图表数据，如果没有则使用模拟数据
  const chartData = chartResponse.data?.length > 0 ? chartResponse.data : generateMockChartData()

  return {
    ...foundData,
    chartData,
  }
}

const Component: React.FC<ComponentProps> = props => {
  const { style, title, visible: controlledVisible, onClose, data } = props
  const { styles } = useStyles()

  const [internalVisible, setInternalVisible] = useState(false)
  const [stationInfo, setStationInfo] = useState<dataItem | null>(null)
  const [chartsData, setChartsData] = useState<ChartsData>({
    depth: [],
    cumulative: [],
  })

  const visible = controlledVisible !== undefined ? controlledVisible : internalVisible

  const handleClose = () => {
    if (controlledVisible === undefined) {
      setInternalVisible(false)
    }
    setStationInfo(null)
    onClose?.()
  }

  const formatValue = (value: string | number | null | undefined, unit?: string): string => {
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
      const chartData = data.chartData?.length ? data.chartData : generateMockChartData()
      setChartsData(convertChartData(chartData))
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
          fontSize: 11,
          rotate: 45,
          // 根据数据量动态计算间隔，保证最多显示约10个标签
          interval: Math.max(0, Math.floor(data.length / 10) - 1),
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
  // 折线图：深度变化
  const depthChartOption = useMemo(
    () =>
      createChartOption('深度（m）', chartsData.depth, 'm', {
        autoScale: true,
        yAxisMin: 0,
      }),
    [chartsData.depth],
  )

  // 柱状图：累计浆量
  const cumulativeChartOption = useMemo(
    () =>
      createChartOption('累计浆量（m³）', chartsData.cumulative, 'm³', {
        autoScale: true,
        chartType: 'bar',
        yAxisMin: 0,
      }),
    [chartsData.cumulative],
  )

  useEffect(() => {
    async function RESystemSelElement() {
      console.log('-- 鼠标探测模型事件 --', BlackHole3D.Probe.getCurCombProbeRet())
      const res = BlackHole3D.Probe.getCurCombProbeRet()
      const childNodeId = res.elemId
      const dataSetId = res.dataSetId
      // window.jiaoBanZhuangDatasetId
      if (dataSetId !== (window as any).jiaoBanZhuangDatasetId) return
      const data: dataItem | null | undefined = await fetchData(childNodeId, dataSetId)
      console.log('data', data)

      // 如果获取到数据，设置到状态并显示弹窗；否则不显示
      if (data) {
        setStationInfo(data)
        setChartsData(convertChartData(data.chartData || []))
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
                height: '750px',
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
                    <span className={styles.label}>桩长（m）</span>
                    <span className={styles.value}>{formatValue(stationInfo?.pileLength, 'm')}</span>
                  </div>
                  <div className={styles.dataItem}>
                    <span className={styles.label}>桩径（mm）</span>
                    <span className={styles.value}>{formatValue(stationInfo?.pileDiameter, 'mm')}</span>
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
                    <span className={styles.label}>开始时间</span>
                    <span className={styles.value}>{stationInfo?.startTime || '/'}</span>
                  </div>
                  <div className={styles.dataItem}>
                    <span className={styles.label}>结束时间</span>
                    <span className={styles.value}>{stationInfo?.endTime || '/'}</span>
                  </div>
                  <div className={styles.dataItem}>
                    <span className={styles.label}>下沉用时（s）</span>
                    <span className={styles.value}>{formatValue(stationInfo?.sinkingTime, 's')}</span>
                  </div>
                  <div className={styles.dataItem}>
                    <span className={styles.label}>提升用时（s）</span>
                    <span className={styles.value}>{formatValue(stationInfo?.enhanceTime, 's')}</span>
                  </div>
                  <div className={styles.dataItem}>
                    <span className={styles.label}>施工用时（s）</span>
                    <span className={styles.value}>{formatValue(stationInfo?.constructionTime, 's')}</span>
                  </div>
                  <div className={styles.dataItem}>
                    <span className={styles.label}>着底电流（A）</span>
                    <span className={styles.value}>{formatValue(stationInfo?.current, 'A')}</span>
                  </div>
                  <div className={styles.dataItem}>
                    <span className={styles.label}>钻杆转速（r/min）</span>
                    <span className={styles.value}>{formatValue(stationInfo?.speed, 'r/min')}</span>
                  </div>
                  <div className={styles.dataItem}>
                    <span className={styles.label}>下沉速度（m/min）</span>
                    <span className={styles.value}>{formatValue(stationInfo?.sinkingSpeed, 'm/min')}</span>
                  </div>
                  <div className={styles.dataItem}>
                    <span className={styles.label}>提升速度（m/min）</span>
                    <span className={styles.value}>{formatValue(stationInfo?.increaseSpeed, 'm/min')}</span>
                  </div>
                  <div className={styles.dataItem}>
                    <span className={styles.label}>水灰比</span>
                    <span className={styles.value}>{formatValue(stationInfo?.waterAsh)}</span>
                  </div>
                  <div className={styles.dataItem}>
                    <span className={styles.label}>水泥浆流量（L/min）</span>
                    <span className={styles.value}>{formatValue(stationInfo?.instantaneous, 'L/min')}</span>
                  </div>
                  <div className={styles.dataItem}>
                    <span className={styles.label}>水泥用量（m³）</span>
                    <span className={styles.value}>{formatValue(stationInfo?.cumulative, 'm³')}</span>
                  </div>
                </div>

                {/* 右侧图表区域 */}
                <div className={styles.rightPanel}>
                  {/* 折线图：深度变化 */}
                  <div className={styles.chartContainer}>
                    <ReactECharts
                      option={depthChartOption}
                      opts={{ renderer: 'canvas' }}
                      style={{ height: '100%', width: '100%' }}
                    />
                  </div>

                  {/* 柱状图：累计浆量 */}
                  <div className={styles.chartContainer}>
                    <ReactECharts
                      option={cumulativeChartOption}
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
