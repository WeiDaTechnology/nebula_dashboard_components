/** 处理后的数据项 */
export interface ProcessedDataItem {
  displayName: string
  fieldName: string
  value: string
}

/** API 配置 */
export interface ApiConfig {
  apiUuid: string
  requestParam: unknown[]
  requestBody: string
  headers: unknown[]
  processFunction: string
  fieldList: unknown[]
}

/** 字段定义 */
export interface FieldDefinition {
  fieldName: string
  fieldDisplayName: string
  fieldType: string
}

/** 常量数据项 */
export interface ConstantDataItem {
  name: string
  type: string
  value: string
}

/** 常量数据配置 */
export interface ConstantConfig {
  data: ConstantDataItem[]
  originalData: ConstantDataItem[]
  fieldList: FieldDefinition[]
}

/** 表单配置 */
export interface FormConfig {
  formPermType: string
  formName: string
  formUuid: string
  commonConditionGroupDTO: Record<string, unknown>
}

/** 数据集配置 */
export interface DataSetConfig {
  dataSetUuid: string
  fieldList: unknown[]
}

/** 字段数据配置 */
export interface FieldDataConfig {
  chartDisplayName: string
  orderby: string | null
  calculateType: string
  nullValue: unknown
}

/** 指标配置 */
export interface IndicatorConfig {
  fieldName: string
  fieldType: string
  fieldDisplayName: string
  fieldDataConfig: FieldDataConfig
}

/** 图表数据配置 */
export interface ChartDataConfig {
  api: ApiConfig
  constant: ConstantConfig
  form: FormConfig
  isPolling: boolean
  polling: number
  dataSet: DataSetConfig
  sourceType: string
  dimension: unknown[]
  indicator: IndicatorConfig[]
}

/** 原始图表数据项 */
export interface RawChartDataItem {
  name: string
  type: string
  value: string
}

/** 数据源数据 */
export interface DataSourceData {
  /** 图表状态 */
  chartStatus: string
  /** 处理后的数据 */
  processedData: ProcessedDataItem[][]
  /** 图表数据配置 */
  chartDataConfig: ChartDataConfig
  /** 原始图表数据 */
  rawChartData: RawChartDataItem[]
  /** 刷新当前图表数据 */
  refreshData: () => void
  /** 刷新数据源数据 */
  refreshDataSource: () => void
}
