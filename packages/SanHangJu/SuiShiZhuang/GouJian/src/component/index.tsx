import ReactECharts from 'echarts-for-react'
import type * as React from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
  /** 监控数据 */
  data?: {
    /** 桩号 */
    pileNumber?: string
    /** 设计坐标X */
    designCoordinateX?: number
    /** 设计坐标Y */
    designCoordinateY?: number
    /** 实际坐标X */
    actualCoordinateX?: number
    /** 实际坐标Y */
    actualCoordinateY?: number
    /** 实际桩长 */
    actualPileLength?: number
    /** 打桩状态 */
    pilingStatus?: string
    /** 桩尖深度 */
    pileTipDepth?: string
    /** 下贯速度 */
    penetrationSpeed?: number
    /** 上拔速度 */
    extractionSpeed?: number
    /** 振动锤电流 */
    vibratoryHammerCurrent?: number
    /** 立柱倾角X */
    columnTiltAngleX?: number
    /** 立柱倾角Y */
    columnTiltAngleY?: number
    /** 平台倾角X */
    platformTiltAngleX?: number
    /** 平台倾角Y */
    platformTiltAngleY?: number
    /** 累计排出碎石量 */
    accumulatedDischargedVolume?: string
    /** 管内压力 */
    pipeInternalPressure?: string
  }
}
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
type dataItem = {
  设备号?: string
  桩号: string
  成孔起止时间?: string
  设计桩顶: string
  设计桩底: string
  实际桩顶: string
  实际桩底: string
  设计坐标X: string
  设计坐标Y: string
  成桩深度?: number
  累计加料体积: string
  立柱倾角Y: string
  立柱倾角X: string
  桩尖高程: string
  振动锤电流: string
  实际坐标X: string
  实际坐标Y: string
  real_height: number
  上拔速度: string
  平台倾角Y: string
  下贯速度: string
  设备状态: string
  平台倾角X: string
  chartData?: ChartDataItem[] // 图表数据
}

// 图表数据点类型
interface ChartDataPoint {
  time: string
  value: number
}

// 图表数据集合类型
interface ChartsData {
  depth: ChartDataPoint[] // 深度数据
  volume: ChartDataPoint[] // 填料量数据
  current: ChartDataPoint[] // 电流量数据
}

// {
//   "桩号": "S11-9-68",
//   "平均频率": number,
//   "平均电流": number,
//   "时间段": string,
//   "平均填料量": number,
//   "数据来源表": string,
//   "平均深度": number
// }
type ChartDataItem = {
  桩号: string
  平均频率: number
  平均电流: number
  时间段: string
  平均填料量: number
  数据来源表: string
  平均深度: number
}

/** 设备编号 -> 桩号详情数据集 ID */
const DEVICE_DATASET_MAP: Record<number, string> = {
  1: 'f6fba8efa2514d6d8515574aa941b607',
  2: 'f7d110b01e114b76adbee5b1a3b3e9e4',
  3: 'a32e9cd0ab3244eb94fa61e6ce5fa623',
  4: 'fe8d03a9145e4df69a1f402f1a5cecb9',
}

interface DeviceOption {
  tableName: string
  deviceNum: number
  label: string
}

function getDeviceNumberFromTable(tableName: string): number {
  const suffix = tableName.split('_').pop() ?? ''
  return Number.parseInt(suffix, 10) || 0
}

function getDeviceLabel(deviceNum: number): string {
  return `建基${String(deviceNum).padStart(2, '0')}`
}

function groupChartDataByDevice(chartData: ChartDataItem[] = []): Record<string, ChartDataItem[]> {
  return chartData.reduce<Record<string, ChartDataItem[]>>((groups, item) => {
    const tableName = item['数据来源表']
    if (!tableName) return groups
    if (!groups[tableName]) {
      groups[tableName] = []
    }
    groups[tableName].push(item)
    return groups
  }, {})
}

function getDeviceOptions(groups: Record<string, ChartDataItem[]>): DeviceOption[] {
  return Object.keys(groups)
    .map(tableName => ({
      tableName,
      deviceNum: getDeviceNumberFromTable(tableName),
      label: getDeviceLabel(getDeviceNumberFromTable(tableName)),
    }))
    .sort((a, b) => a.deviceNum - b.deviceNum)
}
// 将API返回的图表数据转换为ECharts需要的格式
function convertChartData(chartDataItems: ChartDataItem[] = []): ChartsData {
  // 如果没有数据，返回空数组
  if (!chartDataItems || chartDataItems.length === 0) {
    return {
      depth: [],
      volume: [],
      current: [],
    }
  }

  // 转换数据格式
  const depth: ChartDataPoint[] = []
  const volume: ChartDataPoint[] = []
  const current: ChartDataPoint[] = []

  chartDataItems.forEach(item => {
    // 使用后端返回的最新字段「时间段」作为横轴
    const time = item['时间段'] || ''

    depth.push({
      time,
      // 使用「平均深度」作为深度曲线数据
      value: item['平均深度'] ?? 0,
    })

    volume.push({
      time,
      // 使用「平均填料量」作为填料量曲线数据
      value: item['平均填料量'] ?? 0,
    })

    current.push({
      time,
      // 使用「平均电流」作为电流曲线数据
      value: item['平均电流'] ?? 0,
    })
  })

  return {
    depth,
    volume,
    current,
  }
}

// 生成模拟图表数据（作为备用）
function generateMockChartsData(): ChartsData {
  const timePoints: string[] = []
  const now = new Date()

  // 生成12个时间点
  for (let i = 11; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 5 * 60 * 1000) // 每5分钟一个点
    timePoints.push(
      `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}:${time.getSeconds().toString().padStart(2, '0')}`,
    )
  }

  // 生成深度数据（5-20m范围）
  const depthData: ChartDataPoint[] = timePoints.map((time, index) => ({
    time,
    value: Number((10 + Math.sin(index * 0.5) * 5 + Math.random() * 2).toFixed(2)),
  }))

  // 生成填料量数据（50-250m³范围）
  const volumeData: ChartDataPoint[] = timePoints.map((time, index) => ({
    time,
    value: Number((150 + Math.sin(index * 0.4) * 50 + Math.random() * 20).toFixed(2)),
  }))

  // 生成电流量数据（20-50A范围，双波形）
  const currentData: ChartDataPoint[] = timePoints.map((time, index) => ({
    time,
    value: Number((35 + Math.sin(index * 0.8) * 10 + Math.cos(index * 0.6) * 5).toFixed(2)),
  }))

  return {
    depth: depthData,
    volume: volumeData,
    current: currentData,
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
async function fetchStationDataByDevice(zhuanghao: string, deviceNum: number): Promise<dataItem | null> {
  const dataSetUuid = DEVICE_DATASET_MAP[deviceNum]
  if (!dataSetUuid) {
    return null
  }

  const response: { data: dataItem[] } = await window.core.request('bjgraphicplatform/dataSet/executeQuery', {
    data: {
      dataSetUuid,
      params: {
        zhaunghao: zhuanghao,
      },
    },
  })

  return response.data?.[0] ?? null
}

interface FetchDataResult {
  zhuanghao: string
  stationInfo: dataItem | null
  chartDataGroups: Record<string, ChartDataItem[]>
  deviceOptions: DeviceOption[]
  selectedDeviceTable: string
}

async function fetchData(childNodeId: string, dataSetId: string): Promise<FetchDataResult | null> {
  const elementParam: any = await window.core.request('bjgraphicplatform/project/element/getElementParam', {
    data: {
      dataSetId,
      childNodeId,
    },
    autoBoxParam: false,
    skipErrorThrower: true,
  })
  const zhuanghao = elementParam?.elementParams
    ?.find?.((e: any) => e.group === '用户定义属性')
    ?.data?.find?.((e: any) => e?.paramName === '桩号')?.paramValue

  if (!zhuanghao) {
    return null
  }

  const chartResponse: { data: ChartDataItem[] } = await window.core.request('bjgraphicplatform/dataSet/executeQuery', {
    data: {
      dataSetUuid: '3d9098f1c0694abaa402514ce53dbd56',
      params: {
        zhuanghao,
      },
    },
  })

  const chartDataGroups = groupChartDataByDevice(chartResponse.data ?? [])
  const deviceOptions = getDeviceOptions(chartDataGroups)

  if (deviceOptions.length === 0) {
    return null
  }

  const defaultDevice = deviceOptions[0]
  const stationInfo = await fetchStationDataByDevice(zhuanghao, defaultDevice.deviceNum)

  return {
    zhuanghao,
    stationInfo,
    chartDataGroups,
    deviceOptions,
    selectedDeviceTable: defaultDevice.tableName,
  }
}

const Component: React.FC<ComponentProps> = props => {
  const { style, title, isOnline = true, visible: controlledVisible, onClose } = props
  const { styles } = useStyles()

  console.log('Component', props)
  const [internalVisible, setInternalVisible] = useState(false)
  const [stationInfo, setStationInfo] = useState<dataItem | null>(null)
  const [zhuanghao, setZhuanghao] = useState('')
  const [deviceOptions, setDeviceOptions] = useState<DeviceOption[]>([])
  const [selectedDeviceTable, setSelectedDeviceTable] = useState('')
  const [chartDataGroups, setChartDataGroups] = useState<Record<string, ChartDataItem[]>>({})
  const [chartsData, setChartsData] = useState<ChartsData>({
    depth: [],
    volume: [],
    current: [],
  })
  const [loading, setLoading] = useState(false)
  const [deviceLoading, setDeviceLoading] = useState(false)
  const requestIdRef = useRef(0)

  const visible = controlledVisible !== undefined ? controlledVisible : internalVisible
  const contentLoading = loading || deviceLoading

  const handleClose = () => {
    if (controlledVisible === undefined) {
      setInternalVisible(false)
    }
    requestIdRef.current += 1
    setLoading(false)
    setDeviceLoading(false)
    setStationInfo(null)
    setZhuanghao('')
    setDeviceOptions([])
    setSelectedDeviceTable('')
    setChartDataGroups({})
    onClose?.()
  }

  const handleDeviceChange = useCallback(
    async (device: DeviceOption) => {
      if (device.tableName === selectedDeviceTable || !zhuanghao || deviceLoading) {
        return
      }

      setSelectedDeviceTable(device.tableName)
      setChartsData(convertChartData(chartDataGroups[device.tableName]))
      setDeviceLoading(true)

      try {
        const nextStationInfo = await fetchStationDataByDevice(zhuanghao, device.deviceNum)
        setStationInfo(nextStationInfo)
      } finally {
        setDeviceLoading(false)
      }
    },
    [chartDataGroups, deviceLoading, selectedDeviceTable, zhuanghao],
  )

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
        left: '40',
        right: '8',
        top: '38',
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
          rotate: 0,
          interval: 0,
          formatter: (value: string) => {
            // 将 "10-23 10:00" 分成两行显示
            const parts = value.split(' ')
            if (parts.length === 2) {
              return `${parts[0]}\n${parts[1]}`
            }
            return value
          },
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
        splitNumber: 3,
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          color: '#fff',
          fontSize: 11,
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
  const depthChartOption = useMemo(
    () =>
      createChartOption('深度（m）', chartsData.depth, 'm', {
        autoScale: true, // 自动缩放
        yAxisMin: 0, // 最小值从0开始
      }),
    [chartsData.depth],
  )

  const volumeChartOption = useMemo(
    () =>
      createChartOption('填料量（m³）', chartsData.volume, 'm³', {
        autoScale: true, // 自动缩放
        yAxisMin: 0, // 最小值从0开始
      }),
    [chartsData.volume],
  )

  const currentChartOption = useMemo(
    () =>
      createChartOption('电流量（A）', chartsData.current, 'A', {
        autoScale: true, // 自动缩放
        yAxisMin: 0, // 最小值从0开始
      }),
    [chartsData.current],
  )

  useEffect(() => {
    async function RESystemSelElement() {
      console.log('-- 鼠标探测模型事件 --', BlackHole3D.Probe.getCurCombProbeRet())
      const res = BlackHole3D.Probe.getCurCombProbeRet()
      const childNodeId = res.elemId
      const dataSetId = res.dataSetId
      console.log('dataSetId', dataSetId)
      console.log('(window as any).suiShiZhuangDataSetId', (window as any).suiShiZhuangDataSetId)
      if (dataSetId !== (window as any).suiShiZhuangDataSetId) return

      const requestId = ++requestIdRef.current

      setInternalVisible(true)
      setLoading(true)
      setDeviceLoading(false)
      setStationInfo(null)
      setZhuanghao('')
      setDeviceOptions([])
      setSelectedDeviceTable('')
      setChartDataGroups({})
      setChartsData({ depth: [], volume: [], current: [] })

      try {
        const data = await fetchData(childNodeId, dataSetId)
        console.log('data', data)

        if (requestId !== requestIdRef.current) {
          return
        }

        if (data) {
          setZhuanghao(data.zhuanghao)
          setDeviceOptions(data.deviceOptions)
          setSelectedDeviceTable(data.selectedDeviceTable)
          setChartDataGroups(data.chartDataGroups)
          setStationInfo(data.stationInfo)
          setChartsData(convertChartData(data.chartDataGroups[data.selectedDeviceTable]))
        } else {
          setInternalVisible(false)
        }
      } catch (error) {
        console.error('fetchData failed', error)
        if (requestId === requestIdRef.current) {
          setInternalVisible(false)
        }
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false)
        }
      }
    }

    document.addEventListener('RESystemSelElement', RESystemSelElement) //鼠标探测模型事件（左键单击和右键单击）
    // 组件卸载时自动取消监听
    return () => {
      document.removeEventListener('RESystemSelShpElement', RESystemSelElement)
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
              {deviceOptions.length > 1 && (
                <div className={styles.deviceTabs}>
                  {deviceOptions.map(device => (
                    <button
                      aria-label={`切换到${device.label}`}
                      className={`${styles.deviceTab} ${selectedDeviceTable === device.tableName ? styles.deviceTabActive : ''}`}
                      key={device.tableName}
                      onClick={() => handleDeviceChange(device)}
                      type="button"
                    >
                      {device.label}
                    </button>
                  ))}
                </div>
              )}
              <h2 className={styles.title}>{loading ? '加载中...' : stationInfo?.['桩号'] || zhuanghao || '/'}</h2>
              <div className={styles.rightActions}>
                <span className={styles.trophyIcon}>🏆</span>
                <button aria-label="关闭" className={styles.closeButton} onClick={handleClose} type="button">
                  ×
                </button>
              </div>
            </div>

            {/* 内容区域 */}
            <div className={styles.content}>
              {contentLoading ? (
                <div className={styles.loadingWrapper}>
                  <div className={styles.loadingSpinner} />
                  <span className={styles.loadingText}>{loading ? '数据加载中...' : '切换设备中...'}</span>
                </div>
              ) : (
                <div className={styles.mainLayout}>
                  {/* 左侧数据列表 */}
                  <div className={styles.leftPanel}>
                    <div className={styles.dataItem}>
                      <span className={styles.label}>桩号</span>
                      <span className={styles.value}>{stationInfo?.['桩号'] || '/'}</span>
                    </div>
                    <div className={styles.dataItem}>
                      <span className={styles.label}>成孔起止时间（时间区间）</span>
                      <span className={styles.value}>{stationInfo?.['成孔起止时间'] || '/'}</span>
                    </div>
                    <div className={styles.dataItem}>
                      <span className={styles.label}>设计桩顶</span>
                      <span className={styles.value}>{formatValue(stationInfo?.['设计桩顶'], 'm')}</span>
                    </div>
                    <div className={styles.dataItem}>
                      <span className={styles.label}>设计桩底</span>
                      <span className={styles.value}>{formatValue(stationInfo?.['设计桩底'], 'm')}</span>
                    </div>
                    <div className={styles.dataItem}>
                      <span className={styles.label}>实际桩顶</span>
                      <span className={styles.value}>{formatValue(stationInfo?.['实际桩顶'], 'm')}</span>
                    </div>
                    <div className={styles.dataItem}>
                      <span className={styles.label}>实际桩底</span>
                      <span className={styles.value}>{formatValue(stationInfo?.['实际桩底'], 'm')}</span>
                    </div>
                    <div className={styles.dataItem}>
                      <span className={styles.label}>设计坐标X</span>
                      <span className={styles.value}>{formatValue(stationInfo?.['设计坐标X'])}</span>
                    </div>
                    <div className={styles.dataItem}>
                      <span className={styles.label}>设计坐标Y</span>
                      <span className={styles.value}>{formatValue(stationInfo?.['设计坐标Y'])}</span>
                    </div>
                    <div className={styles.dataItem}>
                      <span className={styles.label}>成桩深度</span>
                      <span className={styles.value}>
                        {formatValue(stationInfo?.['成桩深度'] || stationInfo?.['real_height'], 'm')}
                      </span>
                    </div>
                    <div className={styles.dataItem}>
                      <span className={styles.label}>累计加料体积</span>
                      <span className={styles.value}>{formatValue(stationInfo?.['累计加料体积'], 'm³')}</span>
                    </div>
                  </div>

                  {/* 右侧图表区域 */}
                  <div className={styles.rightPanel}>
                    {/* 深度图表 */}
                    <div className={styles.chartContainer}>
                      <ReactECharts
                        option={depthChartOption}
                        opts={{ renderer: 'canvas' }}
                        style={{ height: '100%', width: '100%' }}
                      />
                    </div>

                    {/* 填料量图表 */}
                    <div className={styles.chartContainer}>
                      <ReactECharts
                        option={volumeChartOption}
                        opts={{ renderer: 'canvas' }}
                        style={{ height: '100%', width: '100%' }}
                      />
                    </div>

                    {/* 电流量图表 */}
                    <div className={styles.chartContainer}>
                      <ReactECharts
                        option={currentChartOption}
                        opts={{ renderer: 'canvas' }}
                        style={{ height: '100%', width: '100%' }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  )
}

export default Component
