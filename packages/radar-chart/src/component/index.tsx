// biome-ignore lint/performance/noNamespaceImport: echarts requires namespace import
import * as echarts from 'echarts'
import type * as React from 'react'
import { useEffect, useRef } from 'react'
import type { ContainerProps } from '..'
import useStyles from './styles'

interface ChartDataItem {
  name: string
  type: string
  value: string
}

interface ComponentProps extends ContainerProps {
  /** 数据源数据 */
  chartData?: {
    constant?: {
      data?: ChartDataItem[]
    }
  }
  /** 维度配置 */
  dimensions?: Array<{
    name: string
    max?: number
  }>
  /** 系列配置 */
  series?: Array<{
    name: string
    data: number[]
    color?: string
    lineWidth?: number
    lineStyle?: 'solid' | 'dashed' | 'dotted'
    areaColor?: string
  }>
  /** 雷达图配置 */
  radarConfig?: {
    /** 形状：polygon（多边形）或 circle（圆形） */
    shape?: 'polygon' | 'circle'
    /** 中心位置 */
    center?: [string, string]
    /** 半径 */
    radius?: string | number
    /** 起始角度 */
    startAngle?: number
    /** 分割线数量 */
    splitNumber?: number
    /** 是否显示轴线 */
    axisLine?: boolean
    /** 是否显示分割线 */
    splitLine?: boolean
    /** 是否显示指示器标签 */
    indicatorName?: boolean
    /** 背景颜色 */
    backgroundColor?: string
    /** 分割线颜色 */
    splitLineColor?: string
    /** 轴线颜色 */
    axisLineColor?: string
    /** 指示器名称颜色 */
    nameColor?: string
    /** 是否显示刻度 */
    axisLabel?: boolean
    /** 刻度颜色 */
    axisLabelColor?: string
  }
  /** 图例配置 */
  legendConfig?: {
    /** 是否显示图例 */
    show?: boolean
    /** 图例位置 */
    position?: 'top' | 'bottom' | 'left' | 'right'
  }
  /** 提示框配置 */
  tooltipConfig?: {
    /** 是否显示提示框 */
    show?: boolean
  }
  /** 系列样式配置 */
  seriesStyleConfig?: {
    /** 默认线条颜色 */
    defaultColor?: string
    /** 默认线条粗细 */
    defaultLineWidth?: number
    /** 默认折线样式 */
    defaultLineStyle?: 'solid' | 'dashed' | 'dotted'
    /** 默认区域填充颜色 */
    defaultAreaColor?: string
  }
  /** 各系列样式配置（按系列名称） */
  seriesStyles?: Record<
    string,
    {
      color?: string
      lineWidth?: number
      lineStyle?: 'solid' | 'dashed' | 'dotted'
      areaColor?: string
    }
  >
  /** 自定义系列样式列表（支持动态增删） */
  customSeriesStyles?: Array<{
    id?: string
    name: string
    color?: string
    lineWidth?: number
    lineStyle?: 'solid' | 'dashed' | 'dotted'
    areaColor?: string
  }>
}

/**
 * 将 chartData 转换为 dimensions  and series
 */
const convertChartDataToRadarData = (
  chartData: ChartDataItem[],
  seriesStyleConfig?: {
    defaultColor?: string
    defaultLineWidth?: number
    defaultLineStyle?: 'solid' | 'dashed' | 'dotted'
    defaultAreaColor?: string
  },
  seriesStyles?: Record<
    string,
    {
      color?: string
      lineWidth?: number
      lineStyle?: 'solid' | 'dashed' | 'dotted'
      areaColor?: string
    }
  >,
  customSeriesStyles?: Array<{
    id?: string
    name: string
    color?: string
    lineWidth?: number
    lineStyle?: 'solid' | 'dashed' | 'dotted'
    areaColor?: string
  }>,
) => {
  if (!chartData || chartData.length === 0) {
    return { dimensions: [], series: [] }
  }

  // 提取所有唯一的维度（type），保持首次出现的顺序
  const uniqueDimensions: string[] = []
  const dimensionSet = new Set<string>()
  for (const item of chartData) {
    if (!dimensionSet.has(item.type)) {
      dimensionSet.add(item.type)
      uniqueDimensions.push(item.type)
    }
  }
  const dimensions = uniqueDimensions.map(dim => ({
    name: dim,
    max: 100, // 默认最大值，可以根据实际数据计算
  }))

  // 按系列（name）分组数据
  const seriesMap = new Map<string, Map<string, number>>()

  for (const item of chartData) {
    if (!seriesMap.has(item.name)) {
      seriesMap.set(item.name, new Map())
    }
    const seriesData = seriesMap.get(item.name)
    if (!seriesData) {
      continue
    }
    // 将 value 转换为数字，处理可能的逗号分隔符
    const numValue = Number.parseFloat(item.value.replace(/,/g, '')) || 0
    seriesData.set(item.type, numValue)
  }

  // 转换为系列数组，确保数据顺序与维度顺序一致
  const series = Array.from(seriesMap.entries()).map(([seriesName, dataMap], index) => {
    // 按照维度顺序提取数据值
    const data = uniqueDimensions.map(dim => dataMap.get(dim) || 0)

    // 默认颜色配置
    const defaultColors = [
      { color: '#5470c6', areaColor: 'rgba(84, 112, 198, 0.3)' },
      { color: '#91cc75', areaColor: 'rgba(145, 204, 117, 0.3)' },
      { color: '#fac858', areaColor: 'rgba(250, 200, 88, 0.3)' },
      { color: '#ee6666', areaColor: 'rgba(238, 102, 102, 0.3)' },
      { color: '#73c0de', areaColor: 'rgba(115, 192, 222, 0.3)' },
      { color: '#3ba272', areaColor: 'rgba(59, 162, 114, 0.3)' },
    ]
    const colorConfig = defaultColors[index % defaultColors.length]

    // 获取该系列的特定样式配置（如果存在）
    const seriesStyle = seriesStyles?.[seriesName]

    // 处理自定义样式逻辑：适配 ChartSeriesTab 的行为（倒序插入，最后一项为默认）
    type CustomSeriesStyle = {
      id?: string
      name: string
      color?: string
      lineWidth?: number
      lineStyle?: 'solid' | 'dashed' | 'dotted'
      areaColor?: string
    }
    let customStyle: CustomSeriesStyle | null = null
    let defaultSeriesStyle: CustomSeriesStyle | null = null

    if (customSeriesStyles && customSeriesStyles.length > 0) {
      // 最后一项视为"默认系列"配置
      defaultSeriesStyle = customSeriesStyles.at(-1) ?? null

      // 前面的项视为具体系列配置，因 Setter 倒序插入，故需反转以恢复“先添加先应用”的直觉顺序
      const specificStyles = customSeriesStyles.slice(0, customSeriesStyles.length - 1).reverse()

      // 1. 尝试按名称匹配
      const foundStyle = specificStyles.find(s => s.name === seriesName)
      customStyle = foundStyle ?? null

      // 2. 如果没有按名称匹配到，则按顺序匹配
      if (!customStyle && specificStyles[index]) {
        customStyle = specificStyles[index]
      }
    }

    // 优先级：特定自定义 > 默认自定义 > 传入的特定样式 > 传入的默认配置 > 内置默认颜色
    const finalColor =
      customStyle?.color ||
      seriesStyle?.color ||
      defaultSeriesStyle?.color ||
      seriesStyleConfig?.defaultColor ||
      colorConfig.color
    const finalAreaColor =
      customStyle?.areaColor ||
      seriesStyle?.areaColor ||
      defaultSeriesStyle?.areaColor ||
      seriesStyleConfig?.defaultAreaColor ||
      colorConfig.areaColor
    const finalLineWidth =
      customStyle?.lineWidth ||
      seriesStyle?.lineWidth ||
      defaultSeriesStyle?.lineWidth ||
      seriesStyleConfig?.defaultLineWidth ||
      2
    const finalLineStyle = (customStyle?.lineStyle ||
      seriesStyle?.lineStyle ||
      defaultSeriesStyle?.lineStyle ||
      seriesStyleConfig?.defaultLineStyle ||
      'solid') as 'solid' | 'dashed' | 'dotted'

    return {
      name: seriesName,
      data,
      color: finalColor,
      areaColor: finalAreaColor,
      lineWidth: finalLineWidth,
      lineStyle: finalLineStyle,
    }
  })

  return { dimensions, series }
}

// 创建 tooltip formatter
const createTooltipFormatter =
  (
    defaultDimensions: Array<{ name: string; max?: number }>,
    defaultSeries: Array<{ name: string; data: number[]; color?: string }>,
    currentDimensionIndexRef: React.RefObject<number>,
  ) =>
  (_params: unknown) => {
    const dimensionIndex = currentDimensionIndexRef.current ?? 0
    const dimensionNames = defaultDimensions.map(d => d.name)
    const currentDimensionName = dimensionNames[dimensionIndex] || `维度${dimensionIndex + 1}`

    let result = `<div style="padding: 4px 0;">
    <div style="font-weight: bold; margin-bottom: 8px; color: #fff; font-size: 14px; border-bottom: 1px solid rgba(255, 255, 255, 0.2); padding-bottom: 6px;">
      ${currentDimensionName}
    </div>`

    for (let idx = 0; idx < defaultSeries.length; idx++) {
      const seriesItem = defaultSeries[idx]
      const seriesName = seriesItem.name || ''
      const seriesValue = seriesItem.data[dimensionIndex] ?? 0
      const seriesColor = seriesItem.color || '#5470c6'

      if (idx > 0) {
        result += `<div style="margin-top: 6px;"></div>`
      }

      result += `<div style="padding: 3px 0; display: flex; justify-content: space-between; align-items: center;">
      <span style="display: flex; align-items: center; color: rgba(255, 255, 255, 0.9);">
        <span style="display: inline-block; width: 8px; height: 8px; background-color: ${seriesColor}; border-radius: 2px; margin-right: 6px;"></span>
        ${seriesName}:
      </span>
      <span style="font-weight: bold; color: ${seriesColor}; margin-left: 16px; font-size: 13px;">${seriesValue}</span>
    </div>`
    }

    result += '</div>'
    return result
  }

// 创建 legend 配置
const createLegendConfig = (
  legendConfig: { show?: boolean; position?: 'top' | 'bottom' | 'left' | 'right' },
  defaultSeries: Array<{ name: string }>,
) => {
  const getLeft = () => {
    if (legendConfig.position === 'left') {
      return 'left'
    }
    if (legendConfig.position === 'right') {
      return 'right'
    }
    return 'center'
  }

  const getTop = () => {
    if (legendConfig.position === 'top') {
      return 'top'
    }
    if (legendConfig.position === 'bottom') {
      return 'bottom'
    }
    return 'auto'
  }

  const orient: 'vertical' | 'horizontal' =
    legendConfig.position === 'left' || legendConfig.position === 'right' ? 'vertical' : 'horizontal'

  return {
    show: legendConfig.show !== false,
    orient,
    left: getLeft(),
    top: getTop(),
    bottom: legendConfig.position === 'bottom' ? 'bottom' : 'auto',
    itemGap: 20,
    textStyle: {
      color: '#fff',
      fontSize: 12,
    },
    data: defaultSeries.map(s => s.name),
  }
}

// 创建鼠标移动处理函数
interface MouseMoveHandlerParams {
  chartRef: React.RefObject<HTMLDivElement | null>
  chart: echarts.ECharts
  radarConfig: ComponentProps['radarConfig']
  defaultDimensions: Array<{ name: string }>
  currentDimensionIndexRef: React.RefObject<number>
}

const createMouseMoveHandler = (params: MouseMoveHandlerParams) => {
  const { chartRef, chart, radarConfig, defaultDimensions, currentDimensionIndexRef } = params
  return (e: { offsetX: number; offsetY: number }) => {
    const zr = chart.getZr()
    if (!chartRef.current) {
      return
    }
    if (!zr) {
      return
    }

    const width = chart.getWidth()
    const height = chart.getHeight()

    const centerConfig = radarConfig?.center || ['50%', '50%']
    const parsePercent = (val: string | number, total: number) => {
      if (typeof val === 'number') {
        return val
      }
      if (typeof val === 'string' && val.endsWith('%')) {
        return (Number.parseFloat(val) / 100) * total
      }
      return Number.parseFloat(val as string) || total / 2
    }

    const centerX = parsePercent(centerConfig[0], width)
    const centerY = parsePercent(centerConfig[1], height)

    const dx = e.offsetX - centerX
    const dy = -(e.offsetY - centerY)

    let mouseAngle = Math.atan2(dy, dx) * (180 / Math.PI)
    mouseAngle = (mouseAngle + 360) % 360

    const startAngle = radarConfig?.startAngle || 90
    const diff = (mouseAngle - startAngle + 360) % 360

    const dimensionCount = defaultDimensions.length
    const anglePerDimension = 360 / dimensionCount

    let dimensionIndex = Math.round(diff / anglePerDimension) % dimensionCount

    if (dimensionIndex < 0) {
      dimensionIndex = 0
    }
    if (dimensionIndex >= dimensionCount) {
      dimensionIndex = dimensionCount - 1
    }

    currentDimensionIndexRef.current = dimensionIndex
  }
}

// 准备数据
interface PrepareDataParams {
  chartData: ComponentProps['chartData']
  dimensions: ComponentProps['dimensions']
  series: ComponentProps['series']
  seriesStyleConfig: ComponentProps['seriesStyleConfig']
  seriesStyles: ComponentProps['seriesStyles']
  customSeriesStyles: ComponentProps['customSeriesStyles']
}

const prepareData = (params: PrepareDataParams) => {
  const { chartData, dimensions, series, seriesStyleConfig, seriesStyles, customSeriesStyles } = params
  let finalDimensions = dimensions || []
  let finalSeries = series || []

  if (chartData?.constant?.data && chartData.constant.data.length > 0) {
    const converted = convertChartDataToRadarData(
      chartData.constant.data,
      seriesStyleConfig,
      seriesStyles,
      customSeriesStyles,
    )
    finalDimensions = converted.dimensions
    finalSeries = converted.series
  }

  const defaultDimensions =
    finalDimensions.length > 0
      ? finalDimensions
      : [
          { name: '维度一', max: 100 },
          { name: '维度二', max: 100 },
          { name: '维度三', max: 100 },
          { name: '维度四', max: 100 },
          { name: '维度五', max: 100 },
          { name: '维度六', max: 100 },
        ]

  const defaultSeries =
    finalSeries.length > 0
      ? finalSeries
      : [
          {
            name: '系列1',
            data: [80, 85, 40, 90, 50, 70],
            color: '#5470c6',
            areaColor: 'rgba(84, 112, 198, 0.3)',
          },
          {
            name: '系列2',
            data: [50, 60, 85, 40, 90, 80],
            color: '#91cc75',
            areaColor: 'rgba(145, 204, 117, 0.3)',
          },
        ]

  return { defaultDimensions, defaultSeries }
}

// 创建雷达图配置
const createRadarOption = (
  radarConfig: ComponentProps['radarConfig'],
  indicator: Array<{ name: string; max: number }>,
) => ({
  shape: radarConfig?.shape || 'polygon',
  center: radarConfig?.center || ['50%', '50%'],
  radius: radarConfig?.radius || '70%',
  startAngle: radarConfig?.startAngle || 90,
  splitNumber: radarConfig?.splitNumber || 4,
  scale: false,
  axisLine: {
    show: radarConfig?.axisLine !== false,
    lineStyle: {
      color: radarConfig?.axisLineColor || 'rgba(255, 255, 255, 0.3)',
    },
  },
  splitLine: {
    show: radarConfig?.splitLine !== false,
    lineStyle: {
      color: radarConfig?.splitLineColor || 'rgba(255, 255, 255, 0.2)',
    },
  },
  splitArea: {
    show: true,
    areaStyle: {
      color: ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)'],
    },
  },
  indicator,
  axisName: {
    show: radarConfig?.indicatorName !== false,
    color: radarConfig?.nameColor || '#fff',
    fontSize: 12,
  },
  axisLabel: {
    show: radarConfig?.axisLabel === true,
    fontSize: 12,
    color: radarConfig?.axisLabelColor || '#ccc',
    showMaxLabel: true,
    showMinLabel: false,
  },
})

// 创建系列数据配置
const createSeriesData = (
  defaultSeries: Array<{
    name: string
    data: number[]
    color?: string
    areaColor?: string
    lineWidth?: number
    lineStyle?: 'solid' | 'dashed' | 'dotted'
  }>,
  seriesStyleConfig: ComponentProps['seriesStyleConfig'],
) =>
  defaultSeries.map(s => ({
    name: s.name,
    value: s.data,
    itemStyle: {
      color: s.color || seriesStyleConfig?.defaultColor || '#5470c6',
    },
    areaStyle: {
      color: s.areaColor || seriesStyleConfig?.defaultAreaColor || 'rgba(84, 112, 198, 0.3)',
    },
    lineStyle: {
      width: s.lineWidth || seriesStyleConfig?.defaultLineWidth || 2,
      type: s.lineStyle || seriesStyleConfig?.defaultLineStyle || 'solid',
      color: s.color || seriesStyleConfig?.defaultColor || '#5470c6',
    },
  }))

const Component: React.FC<ComponentProps> = props => {
  const {
    style,
    chartData,
    dimensions = [],
    series = [],
    radarConfig = {},
    legendConfig = {},
    tooltipConfig = {},
    seriesStyleConfig = {},
    seriesStyles = {},
    customSeriesStyles = [],
  } = props
  const { styles } = useStyles()
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstanceRef = useRef<echarts.ECharts | null>(null)
  const currentDimensionIndexRef = useRef<number>(0)

  useEffect(() => {
    if (!chartRef.current) {
      return
    }

    // 初始化图表
    if (!chartInstanceRef.current) {
      chartInstanceRef.current = echarts.init(chartRef.current)
    }

    const chart = chartInstanceRef.current

    // 准备数据
    const { defaultDimensions, defaultSeries } = prepareData({
      chartData,
      dimensions,
      series,
      seriesStyleConfig,
      seriesStyles,
      customSeriesStyles,
    })

    // 雷达图指示器配置
    const indicator = defaultDimensions.map(dim => ({
      name: dim.name,
      max: dim.max || 100,
    }))

    // 系列数据配置
    const seriesData = createSeriesData(defaultSeries, seriesStyleConfig)

    // 雷达图配置
    const radarOption = createRadarOption(radarConfig, indicator)

    // ECharts 配置
    const option: echarts.EChartsOption = {
      backgroundColor: radarConfig.backgroundColor || 'transparent',
      radar: radarOption,
      // 禁用 alignTicks 以避免 ticks 警告
      alignTicks: false,
      tooltip: {
        show: tooltipConfig.show !== false,
        trigger: 'item',
        backgroundColor: 'rgba(50, 50, 50, 0.95)',
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderWidth: 1,
        borderRadius: 4,
        padding: [8, 12],
        textStyle: {
          color: '#fff',
          fontSize: 12,
        },
        formatter: createTooltipFormatter(defaultDimensions, defaultSeries, currentDimensionIndexRef),
      },
      legend: createLegendConfig(legendConfig, defaultSeries),
      series: [
        {
          type: 'radar',
          data: seriesData,
        },
      ],
    }

    chart.setOption(option, true)

    // 使用 ECharts 的事件系统监听鼠标移动，计算当前悬停的维度
    const zr = chart.getZr()
    const handleMouseMove = createMouseMoveHandler({
      chartRef,
      chart,
      radarConfig,
      defaultDimensions,
      currentDimensionIndexRef,
    })

    // 添加鼠标移动事件监听
    if (zr) {
      zr.on('mousemove', handleMouseMove)
    }

    // 使用 ResizeObserver 监听容器大小变化，实现响应式缩放
    const resizeObserver = new ResizeObserver(() => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.resize()
      }
    })

    if (chartRef.current) {
      resizeObserver.observe(chartRef.current)
    }

    // 同时监听窗口大小变化（作为备用）
    const handleResize = () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.resize()
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', handleResize)
      if (zr) {
        zr.off('mousemove', handleMouseMove)
      }
    }
  }, [
    chartData,
    dimensions,
    series,
    radarConfig,
    legendConfig,
    tooltipConfig,
    seriesStyleConfig,
    seriesStyles,
    customSeriesStyles,
  ])

  // 组件卸载时销毁图表
  useEffect(
    () => () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.dispose()
        chartInstanceRef.current = null
      }
    },
    [],
  )

  return (
    <div className={styles.container} style={style}>
      <div className={styles.chartWrapper} ref={chartRef} />
    </div>
  )
}

export default Component
