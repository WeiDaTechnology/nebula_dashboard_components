import type { TrajectoryDataFile, TrajectoryPoint } from './trajectoryTypes'

/** 3D 坐标点 */
export type Point3D = [number, number, number]

/** 2D 坐标点 */
export type Point2D = [number, number]

/** 包围盒类型 */
export interface BoundingBox2D {
  minX: number
  maxX: number
  minY: number
  maxY: number
}

/** 坐标转换参数（包含旋转） */
export interface TransformParams {
  /** 缩放比例 */
  scale: number
  /** 旋转角度（弧度） */
  rotation: number
  /** X 平移量 */
  translateX: number
  /** Y 平移量 */
  translateY: number
  /** Z 高度偏移 */
  offsetZ: number
  /** 轨迹中心点 */
  trajCenterX: number
  trajCenterY: number
  /** 是否已配置 */
  configured: boolean
}

/** 默认转换参数 */
export const DEFAULT_TRANSFORM_PARAMS: TransformParams = {
  scale: 1,
  rotation: 0,
  translateX: 0,
  translateY: 0,
  offsetZ: 0,
  trajCenterX: 0,
  trajCenterY: 0,
  configured: false
}

// 固定 Z 轴高度
export const FIXED_Z = 50.78

/**
 * 计算轨迹数据的主方向（基于分析结果，约 45 度）
 * 轨迹从西南到东北，主方向约为 45 度（π/4 弧度）
 */
export const TRAJECTORY_MAIN_ANGLE = Math.PI / 4 // 45 度

// ========== 几何计算工具函数 ==========

/**
 * 根据 3 个点计算矩形的 4 个顶点
 * 点 A、B 确定一条边，点 C 确定另一条边的方向和长度
 * 第 4 个点 D 自动计算得出
 */
export function calculateRectangleFrom3Points(
  pointA: Point3D,
  pointB: Point3D,
  pointC: Point3D
): Point3D[] {
  // 向量 AB
  const abX = pointB[0] - pointA[0]
  const abY = pointB[1] - pointA[1]

  // AB 的垂直向量（逆时针旋转 90 度）
  const perpX = -abY
  const perpY = abX

  // 归一化垂直向量
  const perpLen = Math.sqrt(perpX * perpX + perpY * perpY)
  const perpUnitX = perpX / perpLen
  const perpUnitY = perpY / perpLen

  // 向量 BC
  const bcX = pointC[0] - pointB[0]
  const bcY = pointC[1] - pointB[1]

  // 将 BC 投影到垂直方向，得到矩形的"高度"
  const height = bcX * perpUnitX + bcY * perpUnitY

  // 计算矩形的 4 个顶点
  // A -> B 是第一条边
  // B -> C' 是第二条边（C' 是 C 投影到垂直方向后的点）
  // C' -> D 是第三条边（平行于 AB）
  // D -> A 是第四条边（平行于 BC'）

  const cPrimeX = pointB[0] + height * perpUnitX
  const cPrimeY = pointB[1] + height * perpUnitY

  const dX = pointA[0] + height * perpUnitX
  const dY = pointA[1] + height * perpUnitY

  return [
    [pointA[0], pointA[1], FIXED_Z],      // A
    [pointB[0], pointB[1], FIXED_Z],      // B
    [cPrimeX, cPrimeY, FIXED_Z],          // C'
    [dX, dY, FIXED_Z]                     // D
  ]
}

/**
 * 计算两点之间的距离
 */
export function distance2D(p1: Point2D, p2: Point2D): number {
  const dx = p2[0] - p1[0]
  const dy = p2[1] - p1[1]
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * 计算向量的角度（弧度，相对于 X 轴正方向）
 */
export function vectorAngle(dx: number, dy: number): number {
  return Math.atan2(dy, dx)
}

/**
 * 找到多边形的最长边，返回其方向角度（弧度）
 */
export function findPolygonMainDirection(points: Point3D[]): number {
  if (points.length < 2) return 0

  let maxLength = 0
  let mainAngle = 0

  for (let i = 0; i < points.length; i++) {
    const p1: Point2D = [points[i][0], points[i][1]]
    const p2: Point2D = [points[(i + 1) % points.length][0], points[(i + 1) % points.length][1]]

    const len = distance2D(p1, p2)
    if (len > maxLength) {
      maxLength = len
      mainAngle = vectorAngle(p2[0] - p1[0], p2[1] - p1[1])
    }
  }

  return mainAngle
}

/**
 * 计算多边形的中心点
 */
export function calculatePolygonCenter(points: Point3D[]): Point2D {
  if (points.length === 0) return [0, 0]

  let sumX = 0, sumY = 0
  points.forEach(p => {
    sumX += p[0]
    sumY += p[1]
  })

  return [sumX / points.length, sumY / points.length]
}

/**
 * 绕点旋转坐标
 */
export function rotatePoint(x: number, y: number, cx: number, cy: number, angle: number): Point2D {
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  const dx = x - cx
  const dy = y - cy
  return [
    cx + dx * cos - dy * sin,
    cy + dx * sin + dy * cos
  ]
}

/**
 * 计算旋转后的包围盒
 */
export function calculateRotatedBoundingBox(points: Point3D[], angle: number, center: Point2D): BoundingBox2D {
  let minX = Infinity, maxX = -Infinity
  let minY = Infinity, maxY = -Infinity

  points.forEach(p => {
    const [rx, ry] = rotatePoint(p[0], p[1], center[0], center[1], angle)
    if (rx < minX) minX = rx
    if (rx > maxX) maxX = rx
    if (ry < minY) minY = ry
    if (ry > maxY) maxY = ry
  })

  return { minX, maxX, minY, maxY }
}

/**
 * 计算轨迹 OBB 的尺寸（长和宽）
 * 直接遍历所有轨迹点，基于轨迹主方向（45度）计算真正的 OBB
 */
export function calculateTrajectoryOBBSizeFromData(data: TrajectoryDataFile): { length: number, width: number, centerX: number, centerY: number } {
  // 轨迹主方向角度（45度）
  const angle = TRAJECTORY_MAIN_ANGLE
  const cos = Math.cos(-angle) // 反向旋转以对齐坐标轴
  const sin = Math.sin(-angle)

  // 遍历所有轨迹点，计算旋转后的范围
  let minU = Infinity, maxU = -Infinity
  let minV = Infinity, maxV = -Infinity
  let sumX = 0, sumY = 0, count = 0

  data.vehicles.forEach(vehicle => {
    vehicle.trajectory.forEach(point => {
      const x = point.x
      const y = point.y

      // 累计用于计算中心
      sumX += x
      sumY += y
      count++

      // 旋转到对齐坐标轴
      const u = x * cos - y * sin
      const v = x * sin + y * cos

      if (u < minU) minU = u
      if (u > maxU) maxU = u
      if (v < minV) minV = v
      if (v > maxV) maxV = v
    })
  })

  // 计算中心点
  const centerX = sumX / count
  const centerY = sumY / count

  return {
    length: maxU - minU, // 主方向长度
    width: maxV - minV,  // 垂直方向宽度
    centerX,
    centerY
  }
}

/**
 * 计算最优转换参数
 * 将轨迹数据的 OBB 旋转、缩放后放入用户区域的旋转矩形
 */
export function calculateOptimalTransform(
  userPoints: Point3D[],
  trajectoryData: TrajectoryDataFile
): TransformParams {
  // 1. 找到用户多边形的主方向（最长边的方向）
  const userMainAngle = findPolygonMainDirection(userPoints)

  // 2. 计算需要旋转的角度：让轨迹主方向对齐用户区域主方向
  const rotation = userMainAngle - TRAJECTORY_MAIN_ANGLE

  // 3. 计算轨迹 OBB 的真实尺寸和中心（遍历所有轨迹点）
  const trajOBB = calculateTrajectoryOBBSizeFromData(trajectoryData)
  const trajCenterX = trajOBB.centerX
  const trajCenterY = trajOBB.centerY

  // 4. 计算用户区域的对齐尺寸
  const userCenter = calculatePolygonCenter(userPoints)

  // 将用户多边形按主方向旋转，得到"对齐后"的包围盒
  const alignedUserBox = calculateRotatedBoundingBox(userPoints, -userMainAngle, userCenter)
  const userLength = alignedUserBox.maxX - alignedUserBox.minX  // 主方向长度
  const userWidth = alignedUserBox.maxY - alignedUserBox.minY   // 垂直方向宽度

  // 5. 计算缩放比例（基于 OBB 尺寸，尽量撑满）
  const scaleLength = userLength / trajOBB.length
  const scaleWidth = userWidth / trajOBB.width
  const scale = Math.min(scaleLength, scaleWidth) * 0.98  // 留 2% 边距

  console.log('=== OBB 尺寸对比 ===')
  console.log('轨迹 OBB: 长度=', trajOBB.length.toFixed(2), '宽度=', trajOBB.width.toFixed(2))
  console.log('用户区域: 长度=', userLength.toFixed(2), '宽度=', userWidth.toFixed(2))
  console.log('缩放比例: 长度方向=', scaleLength.toFixed(4), '宽度方向=', scaleWidth.toFixed(4))
  console.log('最终缩放=', scale.toFixed(4))
  console.log('==================')

  // 6. 计算平移量：将旋转+缩放后的轨迹中心移到用户区域中心
  const translateX = userCenter[0]
  const translateY = userCenter[1]

  // 7. Z 轴高度取用户区域点的平均 Z
  let sumZ = 0
  userPoints.forEach(p => sumZ += p[2])
  const offsetZ = sumZ / userPoints.length

  return {
    scale,
    rotation,
    translateX,
    translateY,
    offsetZ,
    trajCenterX,
    trajCenterY,
    configured: true
  }
}

/**
 * 角度转弧度
 */
export function degToRad(deg: number): number {
  return (deg * Math.PI) / 180
}

/**
 * 计算轨迹在主方向上的旋转包围盒（OBB）
 * 返回旋转矩形的 4 个顶点（原始坐标系，未经转换）
 */
export function calculateTrajectoryOBB(data: TrajectoryDataFile): Point3D[] {
  // 收集所有轨迹点
  const allPoints: Point2D[] = []
  data.vehicles.forEach(vehicle => {
    vehicle.trajectory.forEach(point => {
      allPoints.push([point.x, point.y])
    })
  })

  if (allPoints.length === 0) return []

  // 轨迹主方向角度（45度）
  const angle = TRAJECTORY_MAIN_ANGLE
  const cos = Math.cos(-angle) // 反向旋转以对齐坐标轴
  const sin = Math.sin(-angle)

  // 将所有点旋转到对齐坐标轴的位置，计算 AABB
  let minU = Infinity, maxU = -Infinity
  let minV = Infinity, maxV = -Infinity

  allPoints.forEach(([x, y]) => {
    // 旋转点
    const u = x * cos - y * sin
    const v = x * sin + y * cos
    if (u < minU) minU = u
    if (u > maxU) maxU = u
    if (v < minV) minV = v
    if (v > maxV) maxV = v
  })

  // 在旋转坐标系中的 4 个角点
  const corners: Point2D[] = [
    [minU, minV], // 左下
    [maxU, minV], // 右下
    [maxU, maxV], // 右上
    [minU, maxV]  // 左上
  ]

  // 将角点旋转回原始坐标系
  const cosBack = Math.cos(angle)
  const sinBack = Math.sin(angle)

  const obbCorners: Point3D[] = corners.map(([u, v]) => {
    const x = u * cosBack - v * sinBack
    const y = u * sinBack + v * cosBack
    return [x, y, 0] as Point3D
  })

  return obbCorners
}

/**
 * 根据角度计算方向向量（考虑旋转）
 */
export function angleToDirection(angleDeg: number, extraRotation: number): Point3D {
  const rad = degToRad(angleDeg) + extraRotation
  return [Math.sin(rad), Math.cos(rad), 0]
}

/**
 * 计算轨迹数据的坐标范围
 */
export function calculateTrajectoryBoundingBox(data: TrajectoryDataFile): BoundingBox2D {
  let minX = Infinity, maxX = -Infinity
  let minY = Infinity, maxY = -Infinity

  data.vehicles.forEach(vehicle => {
    vehicle.trajectory.forEach(point => {
      if (point.x < minX) minX = point.x
      if (point.x > maxX) maxX = point.x
      if (point.y < minY) minY = point.y
      if (point.y > maxY) maxY = point.y
    })
  })

  console.log('=== 轨迹坐标范围 ===')
  console.log('X 范围:', minX, '~', maxX)
  console.log('Y 范围:', minY, '~', maxY)
  console.log('====================')

  return { minX, maxX, minY, maxY }
}

/**
 * 应用坐标转换：旋转 + 缩放 + 平移
 */
export function applyTransform(point: TrajectoryPoint, params: TransformParams): Point3D {
  const { scale, rotation, translateX, translateY, offsetZ, trajCenterX, trajCenterY, configured } = params

  if (!configured) {
    return [point.x, point.y, point.z]
  }

  // 1. 先将坐标相对于轨迹中心
  const dx = point.x - trajCenterX
  const dy = point.y - trajCenterY

  // 2. 旋转
  const cos = Math.cos(rotation)
  const sin = Math.sin(rotation)
  const rx = dx * cos - dy * sin
  const ry = dx * sin + dy * cos

  // 3. 缩放
  const sx = rx * scale
  const sy = ry * scale

  // 4. 平移到目标位置
  const x = sx + translateX
  const y = sy + translateY
  const z = offsetZ

  return [x, y, z]
}

