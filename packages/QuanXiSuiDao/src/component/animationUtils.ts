/**
 * 动画相关工具函数
 */
import type { TrajectoryDataFile, TrajectoryPoint, VehicleData } from './trajectoryTypes'
import type { Point3D } from './transformUtils'

declare const BlackHole3D: any

// ========== 调试配置 ==========
// 设置需要显示的车辆 ID，空数组 [] 表示显示所有车辆
export const DEBUG_VEHICLE_IDS: number[] = []
// export const DEBUG_VEHICLE_IDS: number[] = [200001, 200002, 200003]  // 多辆车
// export const DEBUG_VEHICLE_IDS: number[] = []  // 显示所有车辆

// 时间压缩比例：原始延迟时间 / 压缩比例 = 实际延迟时间
// 例如：100 表示 175 秒压缩成 1.75 秒
export const DEBUG_TIME_SCALE = 10

// 是否输出调试日志
export const DEBUG_LOG_ENABLED = true

// 动画脚本 ID
const ANIMATION_SCRIPT_ID = 'vehicle_trajectory_script'

// 默认车辆速度（米/秒）
const DEFAULT_VEHICLE_SPEED = 100.0

// 车辆数据集 ID
const VEHICLE_DATASET_ID = 'huoche'

// 存储显示/隐藏定时器，用于停止时清理
let visibilityTimers: number[] = []

/**
 * 隐藏单个车辆（设置为全透明）
 */
function hideVehicle(vehicleId: number): void {
  try {
    const elemAttr = new BlackHole3D.REElemAttr()
    elemAttr.dataSetId = VEHICLE_DATASET_ID
    elemAttr.elemIdList = [vehicleId]
    elemAttr.elemClr = new BlackHole3D.REColor(255, 255, 255, 0)
    elemAttr.useNewAlpha = true
    elemAttr.useNewClr = false
    BlackHole3D.BIM.setElemAttr(elemAttr)
  } catch (e) {
    console.error(`隐藏车辆 ${vehicleId} 失败:`, e)
  }
}

/**
 * 显示单个车辆（恢复原始透明度）
 */
function showVehicle(vehicleId: number): void {
  try {
    BlackHole3D.BIM.resetElemAttr(VEHICLE_DATASET_ID + '1', [vehicleId])
    BlackHole3D.BIM.resetElemAttr(VEHICLE_DATASET_ID + '2', [vehicleId])
    BlackHole3D.BIM.resetElemAttr(VEHICLE_DATASET_ID + '3', [vehicleId])
    BlackHole3D.BIM.resetElemAttr(VEHICLE_DATASET_ID + '4', [vehicleId])
    BlackHole3D.BIM.resetElemAttr(VEHICLE_DATASET_ID + '5', [vehicleId])
    BlackHole3D.BIM.resetElemAttr(VEHICLE_DATASET_ID + '6', [vehicleId])
    // BlackHole3D.BIM.resetElemAttr(VEHICLE_DATASET_ID + '7', [vehicleId])
    // BlackHole3D.BIM.resetElemAttr(VEHICLE_DATASET_ID + '8', [vehicleId])
    BlackHole3D.BIM.resetElemAttr(VEHICLE_DATASET_ID + '0', [vehicleId])
  } catch (e) {
    console.error(`显示车辆 ${vehicleId} 失败:`, e)
  }
}

/**
 * 隐藏多个车辆
 */
export function hideVehicles(vehicleIds: number[]): void {
  if (vehicleIds.length === 0) return
  for (let i = 0; i < 7; i++) {
    try {
      const elemAttr = new BlackHole3D.REElemAttr()
      elemAttr.dataSetId = VEHICLE_DATASET_ID + i
      elemAttr.elemIdList = vehicleIds
      elemAttr.elemClr = new BlackHole3D.REColor(255, 255, 255, 0)
      elemAttr.useNewAlpha = true
      elemAttr.useNewClr = false
      BlackHole3D.BIM.setElemAttr(elemAttr)
      debugLog(`已隐藏 ${vehicleIds.length} 辆车`)
    } catch (e) {
      console.error('隐藏车辆失败:', e)
    }
  }
}

/**
 * 显示多个车辆
 */
export function showVehicles(vehicleIds: number[]): void {
  if (vehicleIds.length === 0) return
  for (let i = 0; i < 7; i++) {
    try {
      BlackHole3D.BIM.resetElemAttr(VEHICLE_DATASET_ID + i, vehicleIds)
      debugLog(`已显示 ${vehicleIds.length} 辆车`)
    } catch (e) {
      console.error('显示车辆失败:', e)
    }
  }
}

/**
 * 隐藏所有过滤后的车辆
 */
export function hideAllFilteredVehicles(trajectoryData: TrajectoryDataFile): void {
  const vehicles = filterVehicles(trajectoryData.vehicles)
  const vehicleIds = vehicles.map(v => v.id)
  hideVehicles(vehicleIds)
}

/**
 * 显示所有过滤后的车辆
 */
export function showAllFilteredVehicles(trajectoryData: TrajectoryDataFile): void {
  const vehicles = filterVehicles(trajectoryData.vehicles)
  const vehicleIds = vehicles.map(v => v.id)
  showVehicles(vehicleIds)
}

/**
 * 清除所有可见性定时器
 */
function clearVisibilityTimers(): void {
  visibilityTimers.forEach(timerId => clearTimeout(timerId))
  visibilityTimers = []
}

/**
 * 根据调试配置过滤车辆
 */
export function filterVehicles(vehicles: VehicleData[]): VehicleData[] {
  if (DEBUG_VEHICLE_IDS.length === 0) {
    return vehicles
  }
  return vehicles.filter(v => DEBUG_VEHICLE_IDS.includes(v.id))
}

/**
 * 调试日志输出
 */
function debugLog(...args: any[]): void {
  if (DEBUG_LOG_ENABLED) {
    console.log(...args)
  }
}

/**
 * 打印调试车辆的轨迹数据
 */
export function logDebugVehicleTrajectory(vehicles: VehicleData[]): void {
  if (!DEBUG_LOG_ENABLED || DEBUG_VEHICLE_IDS.length === 0) return

  const formatTrajectoryPoint = (point: TrajectoryPoint) => ({
    ...point,
    time: new Date(point.t).toLocaleString('zh-CN'),
    t: point.t
  })

  debugLog('=== 调试车辆原始轨迹数据 ===')
  vehicles.forEach((vehicle: VehicleData) => {
    debugLog(`车辆 ID: ${vehicle.id}`)
    debugLog(`类型: ${vehicle.typeCode}, 颜色: ${vehicle.color}, ${vehicle.type}`)
    debugLog(`尺寸: [${vehicle.size.join(', ')}]`)
    debugLog(`轨迹点数: ${vehicle.trajectory.length}`)

    if (vehicle.trajectory.length > 0) {
      const startTime = new Date(vehicle.trajectory[0].t)
      const endTime = new Date(vehicle.trajectory[vehicle.trajectory.length - 1].t)
      const durationMs = vehicle.trajectory[vehicle.trajectory.length - 1].t - vehicle.trajectory[0].t
      const durationSec = (durationMs / 1000).toFixed(1)
      debugLog(`时间范围: ${startTime.toLocaleString('zh-CN')} ~ ${endTime.toLocaleString('zh-CN')}`)
      debugLog(`持续时间: ${durationSec} 秒`)
    }

    debugLog('前 5 个轨迹点:', vehicle.trajectory.slice(0, 5).map(formatTrajectoryPoint))
    debugLog('后 5 个轨迹点:', vehicle.trajectory.slice(-5).map(formatTrajectoryPoint))
    debugLog('完整轨迹数据:', vehicle.trajectory)
    debugLog('---')
  })
  debugLog('=============================')
}

/**
 * 计算两点之间的方向向量（归一化）
 */
function calculateDirection(from: Point3D, to: Point3D): Point3D {
  const dx = to[0] - from[0]
  const dy = to[1] - from[1]
  const dz = to[2] - from[2]
  const len = Math.sqrt(dx * dx + dy * dy + dz * dz)
  if (len < 0.0001) {
    return [0.0, -1.0, 0.0] // 默认朝向
  }
  return [dx / len, dy / len, dz / len]
}

/**
 * 从欧拉角（度）转换为四元数 [x, y, z, w]
 * 欧拉角顺序: ZYX (yaw-pitch-roll)
 */
function eulerToQuaternion(ex: number, ey: number, ez: number): [number, number, number, number] {
  // 转换为弧度
  const rx = (ex * Math.PI) / 180
  const ry = (ey * Math.PI) / 180
  const rz = (ez * Math.PI) / 180

  const cx = Math.cos(rx / 2)
  const sx = Math.sin(rx / 2)
  const cy = Math.cos(ry / 2)
  const sy = Math.sin(ry / 2)
  const cz = Math.cos(rz / 2)
  const sz = Math.sin(rz / 2)

  // ZYX 顺序
  const qw = cx * cy * cz + sx * sy * sz
  const qx = sx * cy * cz - cx * sy * sz
  const qy = cx * sy * cz + sx * cy * sz
  const qz = cx * cy * sz - sx * sy * cz

  return [qx, qy, qz, qw]
}

/**
 * 从方向向量计算朝向四元数
 * 假设模型默认朝向为 Y 负方向
 */
function directionToQuaternion(dir: Point3D): [number, number, number, number] {
  // 计算 Y 轴旋转角度（偏航角）
  const yaw = Math.atan2(dir[0], -dir[1])
  return eulerToQuaternion(0, 0, (yaw * 180) / Math.PI)
}

/**
 * 获取车辆初始旋转四元数
 */
export function getVehicleInitialRotation(
  trajectory: TrajectoryPoint[],
  applyTransform: (point: TrajectoryPoint) => Point3D
): [number, number, number, number] {
  if (trajectory.length === 0) {
    return [0, 0, 0, 1]
  }

  const firstPoint = trajectory[0]

  // 优先使用数据中的欧拉角
  if (firstPoint.ez !== undefined && firstPoint.ez !== 0) {
    // 使用数据中的欧拉角（主要是 Z 轴旋转）
    return eulerToQuaternion(firstPoint.ex || 0, firstPoint.ey || 0, firstPoint.ez || 0)
  }

  // 如果欧拉角不可用，使用角度字段
  if (firstPoint.a !== undefined && firstPoint.a !== 0) {
    return eulerToQuaternion(0, 0, firstPoint.a)
  }

  // 如果角度也不可用，根据前两个轨迹点计算方向
  if (trajectory.length >= 2) {
    const pos1 = applyTransform(trajectory[0])
    const pos2 = applyTransform(trajectory[1])
    const dir = calculateDirection(pos1, pos2)
    return directionToQuaternion(dir)
  }

  return [0, 0, 0, 1]
}

/**
 * 计算轨迹的总长度（米）
 */
function calculateTrajectoryLength(positions: Point3D[]): number {
  let totalLength = 0
  for (let i = 1; i < positions.length; i++) {
    const dx = positions[i][0] - positions[i - 1][0]
    const dy = positions[i][1] - positions[i - 1][1]
    const dz = positions[i][2] - positions[i - 1][2]
    totalLength += Math.sqrt(dx * dx + dy * dy + dz * dz)
  }
  return totalLength
}

/**
 * 构建轨迹点列表
 * 所有点使用固定的 selfVect，让引擎自动根据路径调整车头朝向
 */
export function buildTrackPointList(
  trajectory: TrajectoryPoint[],
  applyTransform: (point: TrajectoryPoint) => Point3D
): Array<{ pos: Point3D; selfVect: Point3D }> {
  // 转换所有点的位置
  const positions = trajectory.map(point => applyTransform(point))

  // debugLog('=== 轨迹点列表构建 ===')
  // debugLog(`总点数: ${positions.length}`)
  // debugLog('selfVect: 固定 [0, -1, 0]（让引擎自动调整朝向）')

  // 所有点使用固定的 selfVect = [0, -1, 0]
  // 这样引擎会自动根据路径调整车头朝向
  const result = positions.map(pos => ({
    pos,
    selfVect: [0.0, -1.0, 0.0] as Point3D
  }))

  // 打印转换后的前几个点
  // debugLog('转换后前 5 点:')
  // result.slice(0, 5).forEach((pt, i) => {
  //   debugLog(`  [${i}] pos: (${pt.pos[0].toFixed(2)}, ${pt.pos[1].toFixed(2)}, ${pt.pos[2].toFixed(2)})`)
  // })
  // debugLog('========================')

  return result
}

/**
 * 为单个车辆设置轨迹动画（只设置轨迹，不播放）
 */
function setupVehicleTrackAnim(
  vehicle: VehicleData,
  applyTransform: (point: TrajectoryPoint) => Point3D,
  speed: number
): { trackLength: number; duration: number } {
  const trackPointList = buildTrackPointList(vehicle.trajectory, applyTransform)

  // 计算轨迹长度
  const positions = trackPointList.map(p => p.pos)
  const trackLength = calculateTrajectoryLength(positions)

  // 计算动画时长（秒）
  const duration = trackLength / speed

  // 设置轨迹动画
  const trackInfo = new BlackHole3D.REEntityTrackAnimInfo()
  trackInfo.dataSetId = vehicle.dataSetId
  trackInfo.elemId = vehicle.id
  trackInfo.trackPointList = trackPointList
  trackInfo.pathColsed = false
  trackInfo.speed = speed
  trackInfo.selfVect = [0.0, -1.0, 0.0]  // 模型的 Y 负方向是前进方向

  BlackHole3D.Entity.setTrackAnim(trackInfo)

  debugLog(`车辆 ${vehicle.id} 轨迹已设置，长度: ${trackLength.toFixed(1)}m，预计时长: ${duration.toFixed(1)}s`)

  return { trackLength, duration }
}

/**
 * 创建单个车辆的动画播放器配置（路径动画）
 */
function createPathPlayerSet(
  vehicleId: number,
  startTime: number,
  duration: number,
  dataSetId: string
): any {
  const playerSetInfo = new BlackHole3D.REPlayerSetInfo()
  playerSetInfo.dataSetId = dataSetId
  playerSetInfo.elemId = vehicleId
  playerSetInfo.animLevel = 0
  playerSetInfo.animPlayMode = BlackHole3D.REEntityAnimPlayModeEm.ONCE
  playerSetInfo.animName = ''
  playerSetInfo.startTime = startTime
  playerSetInfo.timeLen = duration
  playerSetInfo.playSetList = []

  // 开始时播放
  const playStart = new BlackHole3D.REPlaySetInfo()
  playStart.time = 0.0
  playStart.state = BlackHole3D.REEntityAnimPlayStateEm.PLAY
  playerSetInfo.playSetList.push(playStart)

  // 结束时暂停
  const playEnd = new BlackHole3D.REPlaySetInfo()
  playEnd.time = duration
  playEnd.state = BlackHole3D.REEntityAnimPlayStateEm.PAUSE
  playerSetInfo.playSetList.push(playEnd)

  return playerSetInfo
}

/**
 * 创建单个车辆的动画播放器配置（车轮动画）
 */
function createWheelPlayerSet(
  vehicleId: number,
  startTime: number,
  duration: number,
  dataSetId: string
): any {
  const playerSetInfo = new BlackHole3D.REPlayerSetInfo()
  playerSetInfo.dataSetId = dataSetId
  playerSetInfo.elemId = vehicleId
  playerSetInfo.animLevel = 1
  playerSetInfo.animPlayMode = BlackHole3D.REEntityAnimPlayModeEm.REPEAT
  playerSetInfo.animName = 'run'
  playerSetInfo.startTime = startTime
  playerSetInfo.timeLen = duration
  playerSetInfo.playSetList = []

  // 开始时播放
  const playStart = new BlackHole3D.REPlaySetInfo()
  playStart.time = 0.0
  playStart.state = BlackHole3D.REEntityAnimPlayStateEm.PLAY
  playerSetInfo.playSetList.push(playStart)

  // 结束时停止
  const playEnd = new BlackHole3D.REPlaySetInfo()
  playEnd.time = duration
  playEnd.state = BlackHole3D.REEntityAnimPlayStateEm.STOPMIN
  playerSetInfo.playSetList.push(playEnd)

  return playerSetInfo
}

/**
 * 停止单个车辆的动画（保留用于兼容）
 */
export function stopVehicleAnimation(vehicleId: number, dataSetId: string): void {
  // 停止路径动画
  const animPlayInfo = new BlackHole3D.REEntitySingleAnimPlayInfo()
  animPlayInfo.dataSetId = dataSetId
  animPlayInfo.elemId = vehicleId
  animPlayInfo.animName = ''
  animPlayInfo.animLevel = 0
  animPlayInfo.animPlayMode = BlackHole3D.REEntityAnimPlayModeEm.ONCE
  animPlayInfo.animPlayState = BlackHole3D.REEntityAnimPlayStateEm.PAUSE
  BlackHole3D.Entity.setAnimPlayModeSingle(animPlayInfo)

  // 停止车轮动画
  const runAnimInfo = new BlackHole3D.REEntitySingleAnimPlayInfo()
  runAnimInfo.dataSetId = dataSetId
  runAnimInfo.elemId = vehicleId
  runAnimInfo.animName = 'run'
  runAnimInfo.animLevel = 1
  runAnimInfo.animPlayMode = BlackHole3D.REEntityAnimPlayModeEm.ONCE
  runAnimInfo.animPlayState = BlackHole3D.REEntityAnimPlayStateEm.PAUSE
  BlackHole3D.Entity.setAnimPlayModeSingle(runAnimInfo)
}

/**
 * 启动单个车辆的动画（保留用于兼容）
 */
export function startVehicleAnimation(
  vehicle: VehicleData,
  applyTransform: (point: TrajectoryPoint) => Point3D
): void {
  // 构建轨迹点列表
  const trackPointList = buildTrackPointList(vehicle.trajectory, applyTransform)

  // 设置轨迹动画
  const trackInfo = new BlackHole3D.REEntityTrackAnimInfo()
  trackInfo.dataSetId = 'huoche'
  trackInfo.elemId = vehicle.id
  trackInfo.trackPointList = trackPointList
  trackInfo.pathColsed = false
  trackInfo.speed = DEFAULT_VEHICLE_SPEED
  trackInfo.selfVect = [0.0, -1.0, 0.0]  // 模型的 Y 负方向是前进方向

  BlackHole3D.Entity.setTrackAnim(trackInfo)

  // 播放路径动画
  const animPlayInfo = new BlackHole3D.REEntitySingleAnimPlayInfo()
  animPlayInfo.dataSetId = 'huoche'
  animPlayInfo.elemId = vehicle.id
  animPlayInfo.animName = ''
  animPlayInfo.animLevel = 0
  animPlayInfo.animPlayMode = BlackHole3D.REEntityAnimPlayModeEm.ONCE
  animPlayInfo.animPlayState = BlackHole3D.REEntityAnimPlayStateEm.PLAY
  BlackHole3D.Entity.setAnimPlayModeSingle(animPlayInfo)

  // 播放车轮动画
  const runAnimInfo = new BlackHole3D.REEntitySingleAnimPlayInfo()
  runAnimInfo.dataSetId = 'huoche'
  runAnimInfo.elemId = vehicle.id
  runAnimInfo.animName = 'run'
  runAnimInfo.animLevel = 1
  runAnimInfo.animPlayMode = BlackHole3D.REEntityAnimPlayModeEm.REPEAT
  runAnimInfo.animPlayState = BlackHole3D.REEntityAnimPlayStateEm.PLAY
  BlackHole3D.Entity.setAnimPlayModeSingle(runAnimInfo)

  debugLog(`车辆 ${vehicle.id} 动画已启动`)
}

/**
 * 停止所有车辆动画（使用动画脚本）
 */
export function stopAllVehicleAnimations(trajectoryData: TrajectoryDataFile): void {
  // 清除所有可见性定时器
  clearVisibilityTimers()

  try {
    // 停止并移除动画脚本
    BlackHole3D.Entity.setAnimScriptPlayState(ANIMATION_SCRIPT_ID, BlackHole3D.REEntityAnimPlayStateEm.PAUSE)
    BlackHole3D.Entity.removeAnimScript(ANIMATION_SCRIPT_ID)
    debugLog('动画脚本已停止并移除')
  } catch (e) {
    debugLog('停止动画脚本失败，尝试逐个停止:', e)
    // 回退到逐个停止
    const vehiclesToStop = filterVehicles(trajectoryData.vehicles)
    vehiclesToStop.forEach((vehicle: VehicleData) => {
      stopVehicleAnimation(vehicle.id, vehicle.dataSetId)
    })
  }

  // 隐藏所有车辆
  hideAllFilteredVehicles(trajectoryData)
}

/**
 * 启动所有车辆动画（使用动画脚本统一管理）
 */
export function startAllVehicleAnimations(
  trajectoryData: TrajectoryDataFile,
  applyTransform: (point: TrajectoryPoint) => Point3D
): number {
  debugLog('--------------- trajectoryData', trajectoryData)
  const vehiclesToAnimate = filterVehicles(trajectoryData.vehicles)
  const validVehicles = vehiclesToAnimate.filter(v => v.trajectory.length >= 2)

  if (validVehicles.length === 0) {
    console.warn('没有有效的车辆轨迹')
    return 0
  }

  // 清除之前的定时器
  clearVisibilityTimers()

  // 先隐藏所有车辆
  const allVehicleIds = validVehicles.map(v => v.id)
  hideVehicles(allVehicleIds)

  // 找到所有车辆中最早的开始时间
  const earliestStartTime = Math.min(...validVehicles.map(v => v.trajectory[0].t))

  debugLog('=== 动画脚本配置 ===')
  debugLog('最早开始时间:', new Date(earliestStartTime).toLocaleString('zh-CN'))
  debugLog('时间压缩比例:', DEBUG_TIME_SCALE)

  // 先尝试移除已存在的动画脚本
  try {
    BlackHole3D.Entity.removeAnimScript(ANIMATION_SCRIPT_ID)
  } catch (_e) {
    // 忽略，可能不存在
  }

  // 创建动画脚本
  const animScriptInfo = new BlackHole3D.REEntityAnimScriptInfo()
  animScriptInfo.playScriptId = ANIMATION_SCRIPT_ID
  animScriptInfo.playerSetList = []

  let maxEndTime = 0
  validVehicles.forEach((vehicle: VehicleData) => {
    // 设置车辆轨迹
    const { duration } = setupVehicleTrackAnim(vehicle, applyTransform, DEFAULT_VEHICLE_SPEED)

    // 计算该车辆相对于最早时间的启动延迟（秒），并应用时间压缩
    const originalDelayMs = vehicle.trajectory[0].t - earliestStartTime
    const startTime = (originalDelayMs / 1000) / DEBUG_TIME_SCALE
    const endTime = startTime + duration

    debugLog(`${vehicle.type === 'car' ? '车辆' : '行人'} ${vehicle.id}: 启动时间 ${startTime.toFixed(2)}s，持续 ${duration.toFixed(2)}s，结束时间 ${endTime.toFixed(2)}s`)

    // 添加路径动画播放器
    const pathPlayerSet = createPathPlayerSet(vehicle.id, startTime, duration, vehicle.dataSetId)
    animScriptInfo.playerSetList.push(pathPlayerSet)

    // 添加车轮动画播放器
    const wheelPlayerSet = createWheelPlayerSet(vehicle.id, startTime, duration, vehicle.dataSetId)
    animScriptInfo.playerSetList.push(wheelPlayerSet)

    // 设置定时器：在 startTime 时显示车辆
    const showTimerId = window.setTimeout(() => {
      showVehicle(vehicle.id)
      debugLog(`${vehicle.type === 'car'? '车辆' : '行人'} ${vehicle.id} 已显示（启动动画）`, vehicle.trajectory.slice(0,10))
    }, startTime * 1000)
    visibilityTimers.push(showTimerId)

    // 记录最大结束时间
    if (endTime > maxEndTime) {
      maxEndTime = endTime
    }
  })

  // 设置总时长（稍微多一点缓冲）
  animScriptInfo.totalTimeLen = maxEndTime + 1

  debugLog(`动画脚本总时长: ${animScriptInfo.totalTimeLen.toFixed(2)}s`)
  debugLog(`包含 ${validVehicles.length} 辆车，${animScriptInfo.playerSetList.length} 个动画播放器`)

  // 添加并激活动画脚本
  BlackHole3D.Entity.addAnimScript(animScriptInfo)
  BlackHole3D.Entity.setAnimScriptActive(ANIMATION_SCRIPT_ID)
  BlackHole3D.Entity.setAnimScriptPlayState(ANIMATION_SCRIPT_ID, BlackHole3D.REEntityAnimPlayStateEm.PLAY)

  debugLog('====================')
  debugLog(`动画脚本已启动，${validVehicles.length} 辆车`)

  return validVehicles.length
}

/**
 * 采样轨迹点 - 每隔 N 个点取一个，减少数据量
 */
export function sampleTrajectory(trajectory: TrajectoryPoint[], sampleRate: number = 50): TrajectoryPoint[] {
  if (trajectory.length <= 2) return trajectory

  const sampled: TrajectoryPoint[] = [trajectory[0]] // 起点

  for (let i = sampleRate; i < trajectory.length - 1; i += sampleRate) {
    sampled.push(trajectory[i])
  }

  sampled.push(trajectory[trajectory.length - 1]) // 终点

  return sampled
}

