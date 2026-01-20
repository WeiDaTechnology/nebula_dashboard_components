/**
 * 轨迹数据处理脚本
 * 功能：读取 mock_data 目录下的 JSON 文件，按时间顺序处理，按车辆 ID 分组生成轨迹数据
 *
 * 使用方法：
 * node processTrajectoryData.js [inputDir] [outputFile]
 *
 * 示例：
 * node processTrajectoryData.js ../mock_data/轨迹数据_20251219141837 ../../public/trajectoryData.json
 */

const fs = require('fs')
const path = require('path')

// 默认路径
// const DEFAULT_INPUT_DIR = path.join(__dirname, '../mock_data/轨迹数据_20251219141837')
const DEFAULT_INPUT_DIR = path.join(__dirname, '../mock_data/轨迹数据_20260105')
// const DEFAULT_OUTPUT_FILE = path.join(__dirname, '../../public/trajectoryData.json')
const DEFAULT_OUTPUT_FILE = path.join(__dirname, '../../public/trajectoryData_test.json')

// 从命令行参数获取路径
const inputDir = process.argv[2] || DEFAULT_INPUT_DIR
const outputFile = process.argv[3] || DEFAULT_OUTPUT_FILE

/**
 * 读取目录下所有 JSON 文件
 */
function readJsonFiles(dir) {
  const files = fs.readdirSync(dir)
  const jsonFiles = files.filter(f => f.endsWith('.json'))

  const allData = []

  for (const file of jsonFiles) {
    const filePath = path.join(dir, file)
    const content = fs.readFileSync(filePath, 'utf-8')
    try {
      const data = JSON.parse(content)
      allData.push(data)
    } catch (e) {
      console.warn(`解析文件失败: ${file}`, e.message)
    }
  }

  return allData
}
/**
 * 按时间戳排序
 */
function sortByTimestamp(data) {
  return data.sort((a, b) => a.timestamp - b.timestamp)
}

/**
 * 按车辆 ID 分组，生成轨迹数据
 */
function groupByVehicleId(sortedData) {
  // vehicleId -> { id, typeCode, color, size, trajectory: [{timestamp, xOrig, yOrig, zOrig, angle, speed, x, y, z}] }
  const vehiMap = new Map()
  const pedMap = new Map()
  for (const frame of sortedData) {
    const { timestamp, vehiData, pedData } = frame
    if ((!vehiData || vehiData.length === 0) && (!pedData || pedData.length === 0)) continue
    for (const obj of pedData) {
      const { id, typeCode, color, size, angle, speed, x, y, z, xOrig, yOrig, zOrig, eulerX, eulerY, eulerZ } = obj

      if (!pedMap.has(id)) {
        pedMap.set(id, {
          id,
          type: 'human',
          typeCode,
          color,
          size,
          trajectory: [],
        })
      }

      pedMap.get(id).trajectory.push({
        t: Number.parseInt(timestamp),   // 简化字段名减小文件体积
        xo: x - -457471.158,      // xOrig
        yo: y - -2711059.187,      // yOrig
        zo: z || 0, // zOrig
        x,
        y,
        z: z || 0,
        a: angle,       // angle
        s: speed,       // speed
        ex: eulerX,     // eulerX
        ey: eulerY,     // eulerY
        ez: eulerZ,     // eulerZ
      })
    }
    for (const obj of vehiData) {
      const { id, typeCode, color, size, angle, speed, x, y, z, xOrig, yOrig, zOrig, eulerX, eulerY, eulerZ } = obj

      if (!vehiMap.has(id)) {
        vehiMap.set(id, {
          id,
          type: 'car',
          typeCode,
          color,
          size,
          trajectory: [],
        })
      }

      vehiMap.get(id).trajectory.push({
        t: Number.parseInt(timestamp),   // 简化字段名减小文件体积
        xo: x - -457471.158,      // xOrig
        yo: y - -2711059.187,      // yOrig
        zo: z || 0, // zOrig
        x,
        y,
        z: z || 0,
        a: angle,       // angle
        s: speed,       // speed
        ex: eulerX,     // eulerX
        ey: eulerY,     // eulerY
        ez: eulerZ,     // eulerZ
      })
    }
  }
  // 转换为数组
  const vehicles = Array.from(vehiMap.values()).concat(Array.from(pedMap.values()))

  // 对每个车辆的轨迹按时间排序
  for (const v of vehicles) {
    v.trajectory.sort((a, b) => a.t - b.t)
  }

  return vehicles
}

/**
 * 生成统计信息
 */
function generateStats(vehicles) {
  const totalVehicles = vehicles.length
  const totalPoints = vehicles.reduce((sum, v) => sum + v.trajectory.length, 0)
  const vehicleIds = vehicles.map(v => v.id)

  // 计算坐标范围
  let minXOrig = Infinity,
    maxXOrig = -Infinity
  let minYOrig = Infinity,
    maxYOrig = -Infinity
  let minX = Infinity,
    maxX = -Infinity
  let minY = Infinity,
    maxY = -Infinity

  for (const v of vehicles) {
    for (const p of v.trajectory) {
      if (p.xo < minXOrig) minXOrig = p.xo
      if (p.xo > maxXOrig) maxXOrig = p.xo
      if (p.yo < minYOrig) minYOrig = p.yo
      if (p.yo > maxYOrig) maxYOrig = p.yo
      if (p.x < minX) minX = p.x
      if (p.x > maxX) maxX = p.x
      if (p.y < minY) minY = p.y
      if (p.y > maxY) maxY = p.y
    }
  }

  return {
    totalVehicles,
    totalPoints,
    vehicleIds,
    coordRange: {
      xOrig: { min: minXOrig, max: maxXOrig },
      yOrig: { min: minYOrig, max: maxYOrig },
      x: { min: minX, max: maxX },
      y: { min: minY, max: maxY },
    },
  }
}

/**
 * 生成 JSON 输出数据
 */
function generateJsonOutput(vehicles, stats) {
  return {
    meta: {
      generatedAt: new Date().toISOString(),
      totalVehicles: stats.totalVehicles,
      totalPoints: stats.totalPoints,
      vehicleIds: stats.vehicleIds,
      coordRange: stats.coordRange,
    },
    vehicles,
  }
}

// 主流程
function main() {
  console.log('开始处理轨迹数据...')
  console.log(`输入目录: ${inputDir}`)
  console.log(`输出文件: ${outputFile}`)

  // 确保输出目录存在
  const outputDir = path.dirname(outputFile)
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
    console.log(`创建目录: ${outputDir}`)
  }

  // 1. 读取所有 JSON 文件
  console.log('\n1. 读取 JSON 文件...')
  const allData = readJsonFiles(inputDir)
  console.log(`   读取了 ${allData.length} 个文件`)

  // 2. 按时间戳排序
  console.log('\n2. 按时间戳排序...')
  const sortedData = sortByTimestamp(allData)

  // 3. 按车辆 ID 分组
  console.log('\n3. 按车辆 ID 分组...')
  const vehicles = groupByVehicleId(sortedData)

  // 4. 生成统计信息
  console.log('\n4. 生成统计信息...')
  const stats = generateStats(vehicles)
  console.log(`   车辆总数: ${stats.totalVehicles}`)
  console.log(`   轨迹点总数: ${stats.totalPoints}`)
  console.log(`   车辆 ID 数量: ${stats.vehicleIds.length}`)

  // 5. 生成 JSON 输出
  console.log('\n5. 生成 JSON 文件...')
  const jsonOutput = generateJsonOutput(vehicles, stats)
  
  // 写入 JSON 文件（不格式化，减小体积）
  fs.writeFileSync(outputFile, JSON.stringify(jsonOutput), 'utf-8')
  
  // 计算文件大小
  const fileSizeBytes = fs.statSync(outputFile).size
  const fileSizeMB = (fileSizeBytes / (1024 * 1024)).toFixed(2)
  console.log(`   已写入: ${outputFile}`)
  console.log(`   文件大小: ${fileSizeMB} MB`)

  console.log('\n✅ 处理完成!')
}

main()
