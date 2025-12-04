// @ts-ignore
import Cookies from 'js-cookie'
import type * as React from 'react'
import { useEffect, useState } from 'react'
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

const deviceMap = ['UWDc9mDcDab2', 'Dsg5vJfPfOnt', '81dxLlYPs21f', 'SJTcSLX1oQuX', 'ePsl8aLOsuyB']

const sql = `SELECT
  设计桩顶 - 设计桩底 as real_height,
  累计加料体积,
  桩号,
  设计坐标X, 设计坐标Y,
  实际坐标X, 实际坐标Y,
  下贯速度, 上拔速度,
  振动锤电流,
  立柱倾角X, 立柱倾角Y,
  平台倾角X, 平台倾角Y,
  桩尖高程
FROM
  fdssz_sg01_001
ORDER BY
  _dbTime DESC
LIMIT 1;`
const sql002 = `SELECT
                  桩号,
                  设计坐标X,
                  设计坐标Y,
                  实际坐标X,
                  实际坐标Y,
                  下贯速度,
                  上拔速度,
                  振动锤电流,
                  立柱倾角X,
                  立柱倾角Y,
                  平台倾角X,
                  平台倾角Y
                FROM
                  fdssz_sg01_002
                ORDER BY
                  _dbTime DESC
LIMIT 1;`
const sql003 = `SELECT
  设计桩顶 - 设计桩底 as real_height,
  累计加料体积,
  桩号,
  设计坐标X, 设计坐标Y,
  实际坐标X, 实际坐标Y,
  下贯速度, 上拔速度,
  振动锤电流,
  立柱倾角X, 立柱倾角Y,
  平台倾角X, 平台倾角Y,
  桩尖高程
FROM
  fdssz_sg01_003
ORDER BY
  _dbTime DESC
LIMIT 1;`
const sql004 = `SELECT
  设计桩顶 - 设计桩底 as real_height,
  累计加料体积,
  桩号,
  设计坐标X, 设计坐标Y,
  实际坐标X, 实际坐标Y,
  下贯速度, 上拔速度,
  振动锤电流,
  立柱倾角X, 立柱倾角Y,
  平台倾角X, 平台倾角Y,
  桩尖高程
FROM
  fdssz_sg01_004
ORDER BY
  _dbTime DESC
LIMIT 1;`

const Component: React.FC<ComponentProps> = props => {
  const { style, title = 'DWADRTO1', isOnline = true, visible: controlledVisible, onClose } = props
  const { styles } = useStyles()

  console.log(">>>>>> ")
  const [internalVisible, setInternalVisible] = useState(false)
  const [stationInfo, setStationInfo] = useState<any>({})
  const [deviceId, setDeviceId] = useState<string | null>(null)

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
      getStationInfo()
    }
  }, [deviceId])

  useEffect(() => {
    const handler = async () => {
      const element = BlackHole3D?.Probe?.getCurCombProbeRet().elemId
      const ancData = BlackHole3D.Anchor.getAnc(element)
      console.log("ancData >>>> ", ancData)
      // textInfo "4#碎石桩"
      if(!ancData.textInfo.includes("碎石桩")) return
      
      const number = ancData.textInfo.split("#")[0] // 设备号码，例如 "4"
      console.log("设备号码 >>>> ", number)
      
      try {
        const response: any = await window.core.request('bjgraphicplatform/dataSet/executeQuery', {
          data: {
            dataSetUuid: '8f6a36717ac14d52b3740960a264998e',
          },
        })
        const data: any[] = response.data
        console.log("接口返回数据 >>>> ", data)
        
        // 根据设备号码匹配对应的设备数据
        // 设备号码 "4" 对应 "设备名称" 字段为 "设备4"
        const deviceName = `设备${number}`
        const currentDeviceData = data.find(item => item['设备名称'] === deviceName)
        
        if (currentDeviceData) {
          console.log("当前设备数据 >>>> ", currentDeviceData)
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

  function getStationInfo() {
    const companyId = localStorage.getItem('companyId')
    const token = Cookies.get('token')
    if (deviceId === deviceMap[0]) {
      fetch('http://zhgc.ltd:18080/graphapi/bjgraphicplatform/dataSet/previewData', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${token}`,
          'content-type': 'application/json',
          companyid: `${companyId}`,
          'proxy-connection': 'keep-alive',
        },
        body: JSON.stringify({
          param: {
            dataSetUuid: 'f6fba8efa2514d6d8515574aa941b607',
            dsUuid: '2f0d9742f0fc4a689ccfb7dc25a7da3a',
            sql,
          },
        }),
        mode: 'cors',
        credentials: 'include',
      })
        .then(async resp => {
          const value = await resp.json()
          setStationInfo(value.data[0])
        })
        .catch(err => {
          console.error('previewData error', err)
        })
    }
    if (deviceId === deviceMap[1]) {
      fetch('http://zhgc.ltd:18080/graphapi/bjgraphicplatform/dataSet/previewData', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${token}`,
          'content-type': 'application/json',
          companyid: `${companyId}`,
          'proxy-connection': 'keep-alive',
        },
        body: JSON.stringify({
          param: {
            dataSetUuid: 'f7d110b01e114b76adbee5b1a3b3e9e4',
            dsUuid: '2f0d9742f0fc4a689ccfb7dc25a7da3a',
            sql: sql002,
          },
        }),
        mode: 'cors',
        credentials: 'include',
      })
        .then(async resp => {
          const value = await resp.json()
          setStationInfo(value.data[0])
        })
        .catch(err => {
          console.error('previewData error', err)
        })
    }
    if (deviceId === deviceMap[2]) {
      fetch('http://zhgc.ltd:18080/graphapi/bjgraphicplatform/dataSet/previewData', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${token}`,
          'content-type': 'application/json',
          companyid: `${companyId}`,
          'proxy-connection': 'keep-alive',
        },
        body: JSON.stringify({
          param: {
            dataSetUuid: 'a32e9cd0ab3244eb94fa61e6ce5fa623',
            dsUuid: '2f0d9742f0fc4a689ccfb7dc25a7da3a',
            sql: sql003,
          },
        }),
        mode: 'cors',
        credentials: 'include',
      })
        .then(async resp => {
          const value = await resp.json()
          setStationInfo(value.data[0])
        })
        .catch(err => {
          console.error('previewData 003 error', err)
        })
    }
    if (deviceId === deviceMap[3]) {
      fetch('http://zhgc.ltd:18080/graphapi/bjgraphicplatform/dataSet/previewData', {
        method: 'POST',
        headers: {
          authorization: `Bearer ${token}`,
          'content-type': 'application/json',
          companyid: `${companyId}`,
          'proxy-connection': 'keep-alive',
        },
        body: JSON.stringify({
          param: {
            dataSetUuid: 'fe8d03a9145e4df69a1f402f1a5cecb9',
            dsUuid: '2f0d9742f0fc4a689ccfb7dc25a7da3a',
            sql: sql004,
          },
        }),
        mode: 'cors',
        credentials: 'include',
      })
        .then(async resp => {
          const value = await resp.json()
          setStationInfo(value.data[0])
        })
        .catch(err => {
          console.error('previewData 004 error', err)
        })
    }
  }

  return (
    visible && (<div
      style={
        __RUN_ON_LOCAL__
          ? {
              width: '100%',
              height: '100vh',
            }
          : {
              ...style,
              width: '448px',
              height: '513px',
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
    </div>)
  )
}

export default Component
