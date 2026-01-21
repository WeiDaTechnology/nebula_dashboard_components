import type * as React from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { DataSourceData } from '@/types/datasource'
import type { ContainerProps } from '..'
import {
  filterVehicles,
  getVehicleInitialRotation,
  hideAllFilteredVehicles,
  logDebugVehicleTrajectory,
  startAllVehicleAnimations,
  stopAllVehicleAnimations
} from './animationUtils'
import useStyles from './styles'
import type { TrajectoryDataFile, VehicleData } from './trajectoryTypes'
import {
  type Point3D,
  type TransformParams,
  DEFAULT_TRANSFORM_PARAMS,
  FIXED_Z,
  applyTransform,
  calculateOptimalTransform,
  calculateRectangleFrom3Points,
  calculateTrajectoryBoundingBox,
  calculateTrajectoryOBB
} from './transformUtils'

declare const BlackHole3D: any

// 轨迹数据 JSON 文件的 URL（可配置）
const TRAJECTORY_DATA_URL = 'http://127.0.0.1:5010/trajectoryData_test.json'
// const TRAJECTORY_DATA_URL = 'http://127.0.0.1:5010/trajectoryData.json'

// 预设的区域包围盒（旋转矩形，用于轨迹映射）
const PRESET_REGION_POINTS: Point3D[] = [
  [187.25, 711.84, FIXED_Z],    // A
  [-895.09, -200.23, FIXED_Z],  // B
  [-562.06, -595.43, FIXED_Z],  // C
  [520.28, 316.64, FIXED_Z]     // D
]

// 预设矩形坐标（与 PRESET_REGION_POINTS 相同）
const PRESET_RECTANGLE_POINTS: Point3D[] = [
  [187.25, 711.84, FIXED_Z],    // A
  [-895.09, -200.23, FIXED_Z],  // B
  [-562.06, -595.43, FIXED_Z],  // C
  [520.28, 316.64, FIXED_Z]     // D
]

interface ComponentProps extends ContainerProps {
  dataSourceData?: DataSourceData
  extraDataSourceData?: DataSourceData
  trajectoryDataUrl?: string
}

// ========== 组件 ==========

const Component: React.FC<ComponentProps> = props => {
  const { style, dataSourceData, extraDataSourceData, trajectoryDataUrl } = props
  const { styles } = useStyles()

  console.log('dataSourceData', dataSourceData, extraDataSourceData)

  // 轨迹数据
  const [trajectoryData, setTrajectoryData] = useState<TrajectoryDataFile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingStatus, setLoadingStatus] = useState<string>('等待加载数据')

  // 区域绘制
  const [isDrawingRegion, setIsDrawingRegion] = useState(false)
  const [regionPoints, setRegionPoints] = useState<Point3D[]>([])
  const regionPointsRef = useRef<Point3D[]>([])

  // 3 点绘制矩形
  const [isDrawingRectangle, setIsDrawingRectangle] = useState(false)
  const [rectPoints, setRectPoints] = useState<Point3D[]>([])
  const rectPointsRef = useRef<Point3D[]>([])
  const [calculatedRectangle, setCalculatedRectangle] = useState<Point3D[] | null>(null)

  // 坐标转换参数
  const [transformParams, setTransformParams] = useState<TransformParams>(DEFAULT_TRANSFORM_PARAMS)

  // 车辆与动画
  const [entitiesAdded, setEntitiesAdded] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    regionPointsRef.current = regionPoints
  }, [regionPoints])

  useEffect(() => {
    rectPointsRef.current = rectPoints
  }, [rectPoints])

  /**
   * 应用坐标转换（包装 transformUtils 的函数，绑定当前参数）
   */
  const applyTransformWithParams = useCallback((point: Parameters<typeof applyTransform>[0]): Point3D => {
    return applyTransform(point, transformParams)
  }, [transformParams])

  /**
   * 加载轨迹数据
   */
  const loadTrajectoryData = useCallback(async () => {
    const url = trajectoryDataUrl || TRAJECTORY_DATA_URL
    setIsLoading(true)
    setLoadingStatus('加载数据中...')

    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const data: TrajectoryDataFile = await response.json()
      setTrajectoryData(data)
      console.log('轨迹数据加载成功:', data.meta, data)

      // 计算轨迹坐标范围（用于日志输出）
      calculateTrajectoryBoundingBox(data)

      // 使用预设区域点自动计算转换参数
      console.log('=== 预设区域点 ===')
      console.log(PRESET_REGION_POINTS)
      console.log('==================')

      const params = calculateOptimalTransform(PRESET_REGION_POINTS, data)
      setTransformParams(params)
      setRegionPoints(PRESET_REGION_POINTS)

      const rotationDeg = (params.rotation * 180 / Math.PI).toFixed(1)
      console.log('=== 转换参数 ===')
      console.log('缩放:', params.scale)
      console.log('旋转:', rotationDeg, '度')
      console.log('平移 X:', params.translateX)
      console.log('平移 Y:', params.translateY)
      console.log('Z 偏移:', params.offsetZ)
      console.log('================')

      setLoadingStatus(`已加载 ${data.meta.totalVehicles} 辆车，缩放: ${params.scale.toFixed(3)}, 旋转: ${rotationDeg}°`)
    } catch (error) {
      console.error('加载轨迹数据失败:', error)
      setLoadingStatus('加载失败')
    } finally {
      setIsLoading(false)
    }
  }, [trajectoryDataUrl])

  /**
   * 绘制区域点击处理
   */
  const handleRegionSelElement = useCallback((e: any) => {
    const probe = BlackHole3D.Probe.getCurCombProbeRet()
    BlackHole3D.BIM.delAllSelElems()

    // 输出打点信息
    console.log('=== 打点信息 ===')
    console.log('鼠标按键:', e.detail.button === 0 ? '左键' : '右键')
    console.log('probe 完整数据:', probe)
    console.log('elemPos (点击位置):', probe.elemPos)
    console.log('坐标 X:', probe.elemPos?.[0])
    console.log('坐标 Y:', probe.elemPos?.[1])
    console.log('坐标 Z:', probe.elemPos?.[2])
    console.log('================')

    if (e.detail.button === 0) {
      const newPoint: Point3D = [probe.elemPos[0], probe.elemPos[1], probe.elemPos[2]]
      const newPoints = [...regionPointsRef.current, newPoint]
      regionPointsRef.current = newPoints
      setRegionPoints(newPoints)

      console.log(`✅ 第 ${newPoints.length} 个点已添加:`, newPoint)
      console.log('当前所有点:', newPoints)

      // 绘制辅助线
      const lineShpInfo = new BlackHole3D.RELineShpInfo()
      lineShpInfo.shpName = 'draw_region_line'
      lineShpInfo.potList = newPoints
      lineShpInfo.fillState = 0
      lineShpInfo.lineClr = new BlackHole3D.REColor(0, 255, 0, 200)
      BlackHole3D.Geometry.addPolylineShp(lineShpInfo)

      setLoadingStatus(`已添加 ${newPoints.length} 个区域点`)
    } else {
      // 右键结束
      if (regionPointsRef.current.length >= 2) {
        const closedPoints = [...regionPointsRef.current, regionPointsRef.current[0]]
        const lineShpInfo = new BlackHole3D.RELineShpInfo()
        lineShpInfo.shpName = 'draw_region_line'
        lineShpInfo.potList = closedPoints
        lineShpInfo.fillState = 0
        lineShpInfo.lineClr = new BlackHole3D.REColor(0, 255, 0, 200)
        BlackHole3D.Geometry.addPolylineShp(lineShpInfo)
        setLoadingStatus(`区域绘制完成，${regionPointsRef.current.length} 个点`)
      } else {
        setRegionPoints([])
        regionPointsRef.current = []
        BlackHole3D.Geometry.delShp('draw_region_line')
        setLoadingStatus('点数不足，已取消')
      }

      setIsDrawingRegion(false)
      document.removeEventListener('RESystemSelElement', handleRegionSelElement)
    }
  }, [])

  /**
   * 开始/结束绘制区域
   */
  const toggleDrawRegion = useCallback(() => {
    if (isDrawingRegion) {
      setIsDrawingRegion(false)
      document.removeEventListener('RESystemSelElement', handleRegionSelElement)
    } else {
      setRegionPoints([])
      regionPointsRef.current = []
      BlackHole3D.Geometry.delShp('draw_region_line')
      setIsDrawingRegion(true)
      setLoadingStatus('左键添加点，右键结束')
      document.addEventListener('RESystemSelElement', handleRegionSelElement)
    }
  }, [isDrawingRegion, handleRegionSelElement])

  /**
   * 绘制轨迹的旋转包围盒（OBB）
   */
  const drawTrajectoryOBB = useCallback(() => {
    if (!trajectoryData || !transformParams.configured) {
      console.warn('需要先加载轨迹数据')
      return
    }

    // 计算原始轨迹的 OBB
    const obbCorners = calculateTrajectoryOBB(trajectoryData)
    if (obbCorners.length !== 4) {
      console.warn('无法计算轨迹 OBB')
      return
    }

    // 将 OBB 角点应用坐标转换
    const transformedCorners: Point3D[] = obbCorners.map(corner => {
      const point = {
        t: 0, xo: 0, yo: 0, zo: 0,
        x: corner[0], y: corner[1], z: 0,
        a: 0, s: 0, ex: 0, ey: 0, ez: 0
      }
      return applyTransformWithParams(point)
    })

    // 闭合矩形
    const closedCorners = [...transformedCorners, transformedCorners[0]]

    // 删除旧的 OBB（如果存在）
    BlackHole3D.Geometry.delShp('trajectory_obb')

    // 绘制 OBB 矩形
    const lineShpInfo = new BlackHole3D.RELineShpInfo()
    lineShpInfo.shpName = 'trajectory_obb'
    lineShpInfo.potList = closedCorners
    lineShpInfo.fillState = 0
    lineShpInfo.lineClr = new BlackHole3D.REColor(0, 191, 255, 255) // 深天蓝色
    lineShpInfo.lineWidth = 3
    BlackHole3D.Geometry.addPolylineShp(lineShpInfo)

    console.log('=== 轨迹旋转包围盒 (OBB) ===')
    console.log('原始 OBB 角点:', obbCorners)
    console.log('转换后 OBB 角点:', transformedCorners)
    console.log('============================')

    setLoadingStatus('已绘制轨迹旋转包围盒')
  }, [trajectoryData, transformParams, applyTransformWithParams])

  /**
   * 绘制预设矩形
   */
  const drawPredefinedRectangle = useCallback(() => {
    // 闭合矩形（首尾相连）
    const closedPoints = [...PRESET_RECTANGLE_POINTS, PRESET_RECTANGLE_POINTS[0]]

    // 删除旧的矩形（如果存在）
    BlackHole3D.Geometry.delShp('predefined_rectangle')

    // 绘制矩形
    const lineShpInfo = new BlackHole3D.RELineShpInfo()
    lineShpInfo.shpName = 'predefined_rectangle'
    lineShpInfo.potList = closedPoints
    lineShpInfo.fillState = 0
    lineShpInfo.lineClr = new BlackHole3D.REColor(255, 165, 0, 255) // 橙色
    lineShpInfo.lineWidth = 3
    BlackHole3D.Geometry.addPolylineShp(lineShpInfo)

    console.log('=== 绘制预设矩形 ===')
    console.log('矩形坐标:', PRESET_RECTANGLE_POINTS)
    console.log('====================')

    setLoadingStatus('已绘制预设矩形')
  }, [])

  /**
   * 3 点绘制矩形 - 点击处理
   */
  const handleRectangleSelElement = useCallback((e: any) => {
    const probe = BlackHole3D.Probe.getCurCombProbeRet()
    BlackHole3D.BIM.delAllSelElems()

    if (e.detail.button !== 0) {
      // 右键取消
      setIsDrawingRectangle(false)
      setRectPoints([])
      rectPointsRef.current = []
      BlackHole3D.Geometry.delShp('rect_temp_line')
      setLoadingStatus('已取消绘制矩形')
      document.removeEventListener('RESystemSelElement', handleRectangleSelElement)
      return
    }

    // 左键添加点
    const newPoint: Point3D = [probe.elemPos[0], probe.elemPos[1], FIXED_Z]
    const newPoints = [...rectPointsRef.current, newPoint]
    rectPointsRef.current = newPoints
    setRectPoints(newPoints)

    console.log(`=== 矩形打点 ${newPoints.length}/3 ===`)
    console.log('点坐标:', newPoint)
    console.log('所有点:', newPoints)
    console.log('========================')

    // 绘制临时连线（用线段连接已打的点）
    const lineShpInfo = new BlackHole3D.RELineShpInfo()
    lineShpInfo.shpName = 'rect_temp_line'
    lineShpInfo.potList = newPoints
    lineShpInfo.fillState = 0
    lineShpInfo.lineClr = new BlackHole3D.REColor(255, 255, 0, 255) // 黄色
    lineShpInfo.lineWidth = 3
    BlackHole3D.Geometry.addPolylineShp(lineShpInfo)

    setLoadingStatus(`已添加第 ${newPoints.length} 个点 (共需 3 个)`)

    // 如果已收集 3 个点，计算并绘制矩形
    if (newPoints.length === 3) {
      const rectangle = calculateRectangleFrom3Points(newPoints[0], newPoints[1], newPoints[2])
      setCalculatedRectangle(rectangle)

      // 删除临时图形
      BlackHole3D.Geometry.delShp('rect_temp_line')

      // 绘制最终矩形（闭合）
      const closedRect = [...rectangle, rectangle[0]]
      const rectLineInfo = new BlackHole3D.RELineShpInfo()
      rectLineInfo.shpName = 'calculated_rectangle'
      rectLineInfo.potList = closedRect
      rectLineInfo.fillState = 0
      rectLineInfo.lineClr = new BlackHole3D.REColor(0, 255, 128, 255) // 青绿色
      rectLineInfo.lineWidth = 3
      BlackHole3D.Geometry.addPolylineShp(rectLineInfo)

      console.log('=== 矩形绘制完成 ===')
      console.log('4 个顶点:')
      console.log('  A:', rectangle[0])
      console.log('  B:', rectangle[1])
      console.log('  C:', rectangle[2])
      console.log('  D:', rectangle[3])
      console.log('=====================')

      setLoadingStatus('矩形绘制完成！')
      setIsDrawingRectangle(false)
      document.removeEventListener('RESystemSelElement', handleRectangleSelElement)
    }
  }, [])

  /**
   * 开始/取消 3 点绘制矩形
   */
  const toggleDrawRectangle = useCallback(() => {
    if (isDrawingRectangle) {
      // 取消绘制
      setIsDrawingRectangle(false)
      setRectPoints([])
      rectPointsRef.current = []
      BlackHole3D.Geometry.delShp('rect_temp_line')
      setLoadingStatus('已取消绘制')
      document.removeEventListener('RESystemSelElement', handleRectangleSelElement)
    } else {
      // 开始绘制
      setRectPoints([])
      rectPointsRef.current = []
      setCalculatedRectangle(null)
      BlackHole3D.Geometry.delShp('rect_temp_line')
      BlackHole3D.Geometry.delShp('calculated_rectangle')
      setIsDrawingRectangle(true)
      setLoadingStatus('点击 3 个点绘制矩形 (右键取消)')
      document.addEventListener('RESystemSelElement', handleRectangleSelElement)
    }
  }, [isDrawingRectangle, handleRectangleSelElement])

  /**
   * 计算并应用坐标转换
   */
  const applyRegionTransform = useCallback(() => {
    if (!trajectoryData) {
      alert('请先加载轨迹数据')
      return
    }

    if (regionPoints.length < 2) {
      alert('请先绘制至少 2 个点')
      return
    }

    const params = calculateOptimalTransform(regionPoints, trajectoryData)
    setTransformParams(params)

    const rotationDeg = (params.rotation * 180 / Math.PI).toFixed(1)
    console.log('转换参数:', params)
    setLoadingStatus(`缩放: ${params.scale.toFixed(3)}, 旋转: ${rotationDeg}°`)
  }, [trajectoryData, regionPoints])

  /**
   * 添加所有车辆实体
   */
  const addAllVehicleEntities = useCallback(() => {
    if (!trajectoryData || !transformParams.configured) return

    if (!BlackHole3D?.Entity) {
      console.warn('BlackHole3D.Entity 未就绪')
      return
    }

    setLoadingStatus('正在添加车辆实体...')

    try {
      const entityList: any[] = []
      BlackHole3D.Entity.enterEditMode()
      // 根据调试配置过滤车辆
      const vehiclesToAdd = filterVehicles(trajectoryData.vehicles)

      // 打印调试车辆的原始轨迹数据
      logDebugVehicleTrajectory(vehiclesToAdd)
      vehiclesToAdd.forEach((vehicle: VehicleData) => {

        const num = vehicle.type === 'car' ? Math.floor(Math.random() * 6) + 1 : 0;
        // const num = Math.floor(Math.random() * 6) + 1;
        console.log('--------- vehicle.type', vehicle.type , vehicle.type === 'car', num)
        const typeNamesHuoche = BlackHole3D.Entity.getAllTypeNames('huoche' + num)

        if (!typeNamesHuoche?.length) {
          setLoadingStatus('错误: 未找到车辆模型')
          BlackHole3D.Entity.exitEditMode()
          return
        }
        vehicle.dataSetId = 'huoche' + num
        const entity = new BlackHole3D.REEntityInfo()
        entity.dataSetId = 'huoche' + num
        entity.entityType = typeNamesHuoche[0]
        entity.elemId = vehicle.id
        // 缩小车辆模型
        entity.scale = [0.01, 0.01, 0.01]

        // 根据轨迹数据计算初始朝向
        entity.rotate = getVehicleInitialRotation(vehicle.trajectory, applyTransformWithParams)

        // 设置初始位置（第一个轨迹点）
        if (vehicle.trajectory.length > 0) {
          const [x, y, z] = applyTransformWithParams(vehicle.trajectory[0])
          entity.offset = [x, y, z]
        } else {
          entity.offset = [0, 0, 0]
        }
        entityList.push(entity)
      })

      BlackHole3D.Entity.addEntities(entityList)
      BlackHole3D.Entity.exitEditMode()

      // 添加后先隐藏所有车辆
      hideAllFilteredVehicles(trajectoryData)

      setEntitiesAdded(true)
      setLoadingStatus(`已添加 ${entityList.length} 辆车（已隐藏）`)
      console.log(`成功添加 ${entityList.length} 辆车辆实体（已隐藏）`)
    } catch (error) {
      console.error('添加车辆失败:', error)
      setLoadingStatus('添加车辆失败')
      try { BlackHole3D.Entity.exitEditMode() } catch { }
    }
  }, [trajectoryData, transformParams, applyTransformWithParams])

  /**
   * 开始/停止轨迹动画
   */
  const toggleAnimation = useCallback(() => {
    if (!trajectoryData || !entitiesAdded) return

    if (isAnimating) {
      // 停止所有动画
      stopAllVehicleAnimations(trajectoryData)
      setIsAnimating(false)
      setLoadingStatus('动画已停止')
      return
    }

    setLoadingStatus('启动轨迹动画...')

    // 启动所有车辆动画
    const processedCount = startAllVehicleAnimations(trajectoryData, applyTransformWithParams)

    setIsAnimating(true)
    setLoadingStatus(`${processedCount} 辆车动画播放中`)
  }, [trajectoryData, entitiesAdded, isAnimating, applyTransformWithParams])

  // 初始化
  useEffect(() => {
    function handleDataSetLoadFinish() {
      if (!BlackHole3D.Model.getAllDataSetId().includes('huoche1','huoche2','huoche3','huoche4','huoche5','huoche6','huoche7','huoche8')) {
        setLoadingStatus('加载车辆模型...')
        BlackHole3D.Model.loadDataSet([
        {
          dataSetId: 'huoche0',
          resourcesAddress: 'https://demo.bjblackhole.com/default.aspx?dir=url_res02&path=res_xiaoren',
          // resourcesAddress: 'https://enginegraph.weidax.com/engineweb/blackhole3D/EngineRes/RequestEngineRes?dir=url_res12&path=3a1418d005a03312f9590ea077c9fa82'
        },{
          dataSetId: 'huoche1',
          resourcesAddress: 'https://engine3.bjblackhole.com/engineweb/api/autoconvert/EngineRes/RequestEngineRes?dir=url_res04&path=3a19bfc351a3b69a8bb7ea6a375ed27a',
        },{
          dataSetId: 'huoche2',
          resourcesAddress: 'https://enginegraph.weidax.com/engineweb/blackhole3D/EngineRes/RequestEngineRes?dir=url_res12&path=3a1418d00b2561c89fcb9c7f5531040a'
        },{
          dataSetId: 'huoche3',
          resourcesAddress: 'https://enginegraph.weidax.com/engineweb/blackhole3D/EngineRes/RequestEngineRes?dir=url_res12&path=3a1418d007855cdf01e0b60236fb2777'
        },{
        //   dataSetId: 'huoche4444',
        //   resourcesAddress: 'https://enginegraph.weidax.com/engineweb/blackhole3D/EngineRes/RequestEngineRes?dir=url_res12&path=3a1418d005a03312f9590ea077c9fa82'
        // },{
        //   dataSetId: 'huoche555',
        //   resourcesAddress: 'https://enginegraph.weidax.com/engineweb/blackhole3D/EngineRes/RequestEngineRes?dir=url_res12&path=3a14155d10dcf501e9b7b3fc96cbd601'
        // },{
          dataSetId: 'huoche4',
          resourcesAddress: 'https://enginegraph.weidax.com/engineweb/blackhole3D/EngineRes/RequestEngineRes?dir=url_res12&path=3a14154f0a1f97bd4bc7c27b5ff7a246'
        },{
          dataSetId: 'huoche5',
          resourcesAddress: 'https://enginegraph.weidax.com/engineweb/blackhole3D/EngineRes/RequestEngineRes?dir=url_res12&path=3a140fe1fbc5c6b9fef90301e079f99b'
        },{
          dataSetId: 'huoche6',
          resourcesAddress: 'https://enginegraph.weidax.com/engineweb/blackhole3D/EngineRes/RequestEngineRes?dir=url_res12&path=3a140fddc50f0ad89760ae102524c42b'
        }], false)
      } else {
        setLoadingStatus('引擎就绪')
      }
    }

    document.addEventListener('REDataSetLoadFinish', handleDataSetLoadFinish)
    return () => {
      document.removeEventListener('REDataSetLoadFinish', handleDataSetLoadFinish)
      document.removeEventListener('RESystemSelElement', handleRegionSelElement)
      document.removeEventListener('RESystemSelElement', handleRectangleSelElement)
    }
  }, [handleRegionSelElement, handleRectangleSelElement])

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h2 className={styles.title} style={{ color: style?.color }}>
          多车辆轨迹动画
        </h2>
        <p className={styles.description}>{loadingStatus}</p>

        {/* 第一步：加载数据（自动应用预设区域转换） */}
        <div className={styles.buttonGroup}>
          <button
            className={styles.button}
            type="button"
            onClick={loadTrajectoryData}
            disabled={isLoading || !!trajectoryData}
          >
            {trajectoryData ? '✓ 数据已加载' : isLoading ? '加载中...' : '1. 加载轨迹数据'}
          </button>

          <button
            className={styles.button}
            type="button"
            onClick={drawPredefinedRectangle}
          >
            绘制预设矩形
          </button>

          <button
            className={styles.button}
            type="button"
            onClick={drawTrajectoryOBB}
            disabled={!trajectoryData || !transformParams.configured}
            style={{ backgroundColor: '#00bfff' }}
          >
            绘制轨迹包围盒
          </button>

          <button
            className={styles.button}
            type="button"
            onClick={toggleDrawRectangle}
            style={{ backgroundColor: isDrawingRectangle ? '#ff6b6b' : undefined }}
          >
            {isDrawingRectangle ? '取消打点' : '3点绘制矩形'}
          </button>
        </div>

        {/* 第二步：添加车辆并播放 */}
        {transformParams.configured && (
          <div className={styles.buttonGroup}>
            <button
              className={styles.button}
              type="button"
              onClick={addAllVehicleEntities}
              disabled={entitiesAdded}
            >
              {entitiesAdded ? '✓ 车辆已添加' : '2. 添加车辆'}
            </button>

            <button
              className={styles.button}
              type="button"
              onClick={toggleAnimation}
              disabled={!entitiesAdded}
            >
              {isAnimating ? '停止动画' : '3. 开始动画'}
            </button>
          </div>
        )}

        {/* 打点进度 */}
        {isDrawingRectangle && rectPoints.length > 0 && (
          <div className={styles.infoBox}>
            <p>打点进度: {rectPoints.length}/3</p>
            {rectPoints.map((p, i) => (
              <p key={i} style={{ fontSize: '12px', margin: '2px 0' }}>
                点{i + 1}: [{p[0].toFixed(2)}, {p[1].toFixed(2)}]
              </p>
            ))}
          </div>
        )}

        {/* 矩形坐标展示 */}
        {calculatedRectangle && !isDrawingRectangle && (
          <div className={styles.infoBox}>
            <p style={{ fontWeight: 'bold' }}>✓ 矩形 4 顶点 (Z={FIXED_Z}):</p>
            {calculatedRectangle.map((p, i) => (
              <p key={i} style={{ fontSize: '12px', margin: '2px 0' }}>
                {['A', 'B', 'C', 'D'][i]}: [{p[0].toFixed(2)}, {p[1].toFixed(2)}]
              </p>
            ))}
          </div>
        )}

        {/* 信息展示 */}
        {trajectoryData && (
          <div className={styles.infoBox}>
            <p>车辆: {trajectoryData.meta.totalVehicles} | 轨迹点: {trajectoryData.meta.totalPoints.toLocaleString()}</p>
            {transformParams.configured && (
              <p>
                缩放: {transformParams.scale.toFixed(4)} |
                旋转: {(transformParams.rotation * 180 / Math.PI).toFixed(1)}°
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Component
