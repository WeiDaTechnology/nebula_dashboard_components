/**
 * 轨迹数据类型定义
 * 数据文件: public/trajectoryData.json
 */

/** 轨迹点数据（简化字段名以减小 JSON 体积） */
export interface TrajectoryPoint {
  /** 时间戳 (timestamp) */
  t: number
  /** 投影坐标 X（米）(xOrig) */
  xo: number
  /** 投影坐标 Y（米）(yOrig) */
  yo: number
  /** 投影坐标 Z（米）(zOrig) */
  zo: number
  /** 场景坐标 X */
  x: number
  /** 场景坐标 Y */
  y: number
  /** 场景坐标 Z */
  z: number
  /** 角度（度）(angle) */
  a: number
  /** 速度 (speed) */
  s: number
  /** 欧拉角 X (eulerX) */
  ex: number
  /** 欧拉角 Y (eulerY) */
  ey: number
  /** 欧拉角 Z (eulerZ) */
  ez: number
}

/** 车辆数据 */
export interface VehicleData {
  /** 车辆 ID */
  id: number
  /** 类型代码 (1=小车, 2=卡车等) */
  typeCode: number
  /** 颜色 */
  color: string
  /** 尺寸 [长, 宽, 高] */
  size: [number, number, number]
  /** 轨迹点列表（按时间排序） */
  trajectory: TrajectoryPoint[]
}

/** 坐标范围 */
export interface CoordRange {
  min: number
  max: number
}

/** 元数据 */
export interface TrajectoryMeta {
  /** 生成时间 */
  generatedAt: string
  /** 车辆总数 */
  totalVehicles: number
  /** 轨迹点总数 */
  totalPoints: number
  /** 车辆 ID 列表 */
  vehicleIds: number[]
  /** 坐标范围 */
  coordRange: {
    xOrig: CoordRange
    yOrig: CoordRange
    x: CoordRange
    y: CoordRange
  }
}

/** 轨迹数据文件结构 */
export interface TrajectoryDataFile {
  meta: TrajectoryMeta
  vehicles: VehicleData[]
}

