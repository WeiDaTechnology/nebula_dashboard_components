/**
 * 轨迹分析脚本 - 分析车辆轨迹的整体走向和分布
 */

const fs = require('fs')
const path = require('path')

const DATA_FILE = path.join(__dirname, '../../public/trajectoryData.json')

function analyzeTrajectory() {
  console.log('加载轨迹数据...')
  const rawData = fs.readFileSync(DATA_FILE, 'utf-8')
  const data = JSON.parse(rawData)

  const { meta, vehicles } = data

  console.log('\n=== 基本统计 ===')
  console.log(`车辆总数: ${meta.totalVehicles}`)
  console.log(`轨迹点总数: ${meta.totalPoints}`)

  console.log('\n=== 坐标范围 ===')
  const xRange = meta.coordRange.x.max - meta.coordRange.x.min
  const yRange = meta.coordRange.y.max - meta.coordRange.y.min
  console.log(`场景坐标 X: ${meta.coordRange.x.min.toFixed(2)} ~ ${meta.coordRange.x.max.toFixed(2)} (跨度: ${xRange.toFixed(2)})`)
  console.log(`场景坐标 Y: ${meta.coordRange.y.min.toFixed(2)} ~ ${meta.coordRange.y.max.toFixed(2)} (跨度: ${yRange.toFixed(2)})`)
  console.log(`长宽比: ${(xRange / yRange).toFixed(2)} : 1`)

  // 分析每辆车的轨迹特征
  console.log('\n=== 轨迹走向分析 ===')

  let totalDeltaX = 0
  let totalDeltaY = 0
  let vehicleDirections = { NE: 0, NW: 0, SE: 0, SW: 0, N: 0, S: 0, E: 0, W: 0 }

  vehicles.forEach(vehicle => {
    if (vehicle.trajectory.length < 2) return

    const first = vehicle.trajectory[0]
    const last = vehicle.trajectory[vehicle.trajectory.length - 1]

    const deltaX = last.x - first.x
    const deltaY = last.y - first.y

    totalDeltaX += deltaX
    totalDeltaY += deltaY

    // 判断主要方向
    const angle = Math.atan2(deltaY, deltaX) * 180 / Math.PI
    let direction = ''
    if (angle >= -22.5 && angle < 22.5) direction = 'E'
    else if (angle >= 22.5 && angle < 67.5) direction = 'NE'
    else if (angle >= 67.5 && angle < 112.5) direction = 'N'
    else if (angle >= 112.5 && angle < 157.5) direction = 'NW'
    else if (angle >= 157.5 || angle < -157.5) direction = 'W'
    else if (angle >= -157.5 && angle < -112.5) direction = 'SW'
    else if (angle >= -112.5 && angle < -67.5) direction = 'S'
    else if (angle >= -67.5 && angle < -22.5) direction = 'SE'

    vehicleDirections[direction]++
  })

  console.log('车辆运动方向统计:')
  Object.entries(vehicleDirections)
    .sort((a, b) => b[1] - a[1])
    .forEach(([dir, count]) => {
      if (count > 0) {
        console.log(`  ${dir}: ${count} 辆 (${(count / meta.totalVehicles * 100).toFixed(1)}%)`)
      }
    })

  console.log(`\n整体位移趋势: X方向 ${totalDeltaX > 0 ? '向右(+)' : '向左(-)'} ${Math.abs(totalDeltaX).toFixed(2)}, Y方向 ${totalDeltaY > 0 ? '向上(+)' : '向下(-)'} ${Math.abs(totalDeltaY).toFixed(2)}`)

  // 分析轨迹点的密度分布
  console.log('\n=== 轨迹密度热力分析 ===')
  const gridSize = 10 // 10x10 网格
  const grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(0))

  vehicles.forEach(vehicle => {
    vehicle.trajectory.forEach(point => {
      const gridX = Math.floor((point.x - meta.coordRange.x.min) / xRange * (gridSize - 0.001))
      const gridY = Math.floor((point.y - meta.coordRange.y.min) / yRange * (gridSize - 0.001))
      if (gridX >= 0 && gridX < gridSize && gridY >= 0 && gridY < gridSize) {
        grid[gridY][gridX]++
      }
    })
  })

  // 找最大值用于归一化
  const maxDensity = Math.max(...grid.flat())

  console.log('密度分布 (从上到下是 Y 从大到小, 从左到右是 X 从小到大):')
  console.log('█ = 高密度, ▓ = 中密度, ░ = 低密度, · = 很少')
  console.log('')

  for (let y = gridSize - 1; y >= 0; y--) {
    let row = ''
    for (let x = 0; x < gridSize; x++) {
      const ratio = grid[y][x] / maxDensity
      if (ratio > 0.5) row += '█'
      else if (ratio > 0.2) row += '▓'
      else if (ratio > 0.05) row += '░'
      else if (grid[y][x] > 0) row += '·'
      else row += ' '
    }
    console.log(`  ${row}`)
  }

  // 分析是否是狭长矩形
  console.log('\n=== 形状分析 ===')
  const aspectRatio = xRange / yRange
  if (aspectRatio > 2) {
    console.log(`这是一个横向的狭长矩形 (宽:高 = ${aspectRatio.toFixed(2)}:1)`)
  } else if (aspectRatio < 0.5) {
    console.log(`这是一个纵向的狭长矩形 (宽:高 = ${aspectRatio.toFixed(2)}:1)`)
  } else {
    console.log(`这是一个接近正方形的区域 (宽:高 = ${aspectRatio.toFixed(2)}:1)`)
  }

  // 分析角度分布
  console.log('\n=== 车辆朝向角度分析 ===')
  const angleHistogram = {}
  let totalAngles = 0

  vehicles.forEach(vehicle => {
    vehicle.trajectory.forEach(point => {
      // 将角度归到 30 度区间
      const bucket = Math.floor(point.a / 30) * 30
      angleHistogram[bucket] = (angleHistogram[bucket] || 0) + 1
      totalAngles++
    })
  })

  console.log('角度分布 (0° = 北, 90° = 东, 180° = 南, 270° = 西):')
  Object.entries(angleHistogram)
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
    .forEach(([angle, count]) => {
      const bar = '█'.repeat(Math.round(count / totalAngles * 50))
      console.log(`  ${angle.padStart(3)}°-${(parseInt(angle) + 30).toString().padStart(3)}°: ${bar} (${(count / totalAngles * 100).toFixed(1)}%)`)
    })

  // 分析每辆车的轨迹长度
  console.log('\n=== 轨迹长度分析 ===')
  const trajectoryLengths = vehicles.map(v => {
    let length = 0
    for (let i = 1; i < v.trajectory.length; i++) {
      const dx = v.trajectory[i].x - v.trajectory[i - 1].x
      const dy = v.trajectory[i].y - v.trajectory[i - 1].y
      length += Math.sqrt(dx * dx + dy * dy)
    }
    return { id: v.id, length, points: v.trajectory.length }
  }).sort((a, b) => b.length - a.length)

  const avgLength = trajectoryLengths.reduce((s, t) => s + t.length, 0) / trajectoryLengths.length
  console.log(`平均轨迹长度: ${avgLength.toFixed(2)} 单位`)
  console.log(`最长轨迹: 车辆 ${trajectoryLengths[0].id}, 长度 ${trajectoryLengths[0].length.toFixed(2)}, ${trajectoryLengths[0].points} 个点`)
  console.log(`最短轨迹: 车辆 ${trajectoryLengths[trajectoryLengths.length - 1].id}, 长度 ${trajectoryLengths[trajectoryLengths.length - 1].length.toFixed(2)}, ${trajectoryLengths[trajectoryLengths.length - 1].points} 个点`)
}

analyzeTrajectory()
