import Cookies from 'js-cookie'
import type * as React from 'react'
import { useEffect, useState } from 'react'
import type { ContainerProps } from '..'
import useStyles from './styles'

declare const BlackHole3D: any

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

type dataItem = {
    "设备号"?: string,
    "桩号": string,
    "成孔起止时间"?: string,
    "设计桩顶": string,
    "设计桩底": string,
    "实际桩顶": string,
    "实际桩底": string,
    "设计坐标X": string,
    "设计坐标Y": string,
    "成桩深度"?: number,
    "累计加料体积": string,
    "立柱倾角Y": string,
    "立柱倾角X": string,
    "桩尖高程": string,
    "振动锤电流": string,
    "实际坐标X": string,
    "实际坐标Y": string,
    "real_height": number,
    "上拔速度": string,
    "平台倾角Y": string,
    "下贯速度": string,
    "设备状态": string,
    "平台倾角X": string
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
async function fetchData(childNodeId: string, dataSetId: string) {
  const elementParam: any = await window.core.request('bjgraphicplatform/project/element/getElementParam', {
    data: {
            "dataSetId": dataSetId,
            "childNodeId": childNodeId
        },
    autoBoxParam: false,
    skipErrorThrower: true
  })
  const zhuanghao = elementParam?.elementParams?.find?.((e: any) => e.group === '用户定义属性')?.data?.find?.((e: any) => e?.paramName === "桩号")?.paramValue

  if (!zhuanghao) {
    return null
  }
  const a = [
    "fe8d03a9145e4df69a1f402f1a5cecb9",
    "a32e9cd0ab3244eb94fa61e6ce5fa623",
    "f6fba8efa2514d6d8515574aa941b607",
    "f7d110b01e114b76adbee5b1a3b3e9e4"
  ].map(datasetId => {
    return async () => {
      const response: { data: dataItem[] } = await window.core.request('bjgraphicplatform/dataSet/executeQuery', {
        data: {
            "dataSetUuid": datasetId, 
            "params": {
                // "zhaunghao": zhuanghao
                zhaunghao: 'S11-1-12'
            }
          }
        })
        return response.data?.[0]
      }
  })
  const b = await Promise.all(a.map(e => e()))
  return b.find(e => !!e)
}

const Component: React.FC<ComponentProps> = props => {
  const { style, title = 'DWADRTO1', isOnline = true, visible: controlledVisible, onClose } = props
  const { styles } = useStyles()

  console.log('Component', props)
  const [internalVisible, setInternalVisible] = useState(false)
  const [stationInfo, setStationInfo] = useState<dataItem | null>(null)

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
    async function RESystemSelElement() {
        console.log('-- 鼠标探测模型事件 --', BlackHole3D.Probe.getCurCombProbeRet());
        const res = BlackHole3D.Probe.getCurCombProbeRet()
        const childNodeId = res.elemId
        const dataSetId = res.dataSetId
        const data: dataItem | null | undefined = await fetchData(childNodeId, dataSetId)
        console.log('data', data)
        
        // 如果获取到数据，设置到状态并显示弹窗
        if (data) {
            setStationInfo(data)
            setInternalVisible(true)
        }
    }

    document.addEventListener("RESystemSelElement", RESystemSelElement);//鼠标探测模型事件（左键单击和右键单击）
    // 组件卸载时自动取消监听
    return () => {
      document.removeEventListener('RESystemSelShpElement', RESystemSelElement)
    }
  }, [])

  
  if (!visible) {
    return null
  }

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modalContainer} onClick={e => e.stopPropagation()}>
        {/* 标题栏 */}
        <div className={styles.header}>
          <div className={styles.statusIndicator}>
            <span className={styles.statusDot} style={{ backgroundColor: isOnline ? '#52c41a' : '#ff4d4f' }} />
            <span className={styles.statusText}>在线</span>
          </div>
          <h2 className={styles.title}>{title}</h2>
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
                <span className={styles.label}>设备号</span>
                <span className={styles.value}>{stationInfo?.['设备号'] || '/'}</span>
              </div>
              <div className={styles.dataItem}>
                <span className={styles.label}>桩号</span>
                <span className={styles.value}>{stationInfo?.['桩号'] || '/'}</span>
              </div>
              <div className={styles.dataItem}>
                <span className={styles.label}>成孔起止时间（时间区间）</span>
                <span className={styles.value}>{stationInfo?.['成孔起止时间'] || '/'}</span>
              </div>
              <div className={styles.dataItem}>
                <span className={styles.label}>设计框顶</span>
                <span className={styles.value}>{formatValue(stationInfo?.['设计桩顶'], 'm')}</span>
              </div>
              <div className={styles.dataItem}>
                <span className={styles.label}>设计框底</span>
                <span className={styles.value}>{formatValue(stationInfo?.['设计桩底'], 'm')}</span>
              </div>
              <div className={styles.dataItem}>
                <span className={styles.label}>实际框顶</span>
                <span className={styles.value}>{formatValue(stationInfo?.['实际桩顶'], 'm')}</span>
              </div>
              <div className={styles.dataItem}>
                <span className={styles.label}>实际框底</span>
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
                <span className={styles.value}>{formatValue(stationInfo?.['成桩深度'] || stationInfo?.['real_height'], 'm')}</span>
              </div>
              <div className={styles.dataItem}>
                <span className={styles.label}>累计加料体积</span>
                <span className={styles.value}>{formatValue(stationInfo?.['累计加料体积'], 'm³')}</span>
              </div>
            </div>

            {/* 右侧图表区域 - 暂时预留 */}
            <div className={styles.rightPanel}>
              {/* 后续添加图表 */}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Component
