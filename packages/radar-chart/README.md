# 圆形雷达图组件

一个支持多维度、多系列的圆形雷达图自定义组件，基于 ECharts 实现。

## 功能特性

- ✅ 支持多个维度配置（维度1、2、3等）
- ✅ 支持多个系列配置（系列1、2、3等）
- ✅ 支持两个或多个数据簇的信息展示
- ✅ 丰富的样式配置选项
- ✅ 可配置的图例显示

## 快速开始

### 1. 安装依赖

在项目根目录下执行：

```bash
pnpm i
```

### 2. 启动项目

#### 联调模式

用于与大屏平台进行联调：

```bash
cd packages/radar-chart
pnpm start
# 或
pnpm serve
```

#### 本地调试模式

用于本地独立调试组件：

```bash
cd packages/radar-chart
pnpm local
```

### 3. 构建生产版本

```bash
cd packages/radar-chart
pnpm build
```

## 配置说明

### 维度配置

维度配置用于定义雷达图的各个维度（指标）：

```typescript
dimensions: [
  { name: '维度一', max: 100 },
  { name: '维度二', max: 100 },
  { name: '维度三', max: 100 },
  // ... 更多维度
]
```

### 系列配置

系列配置用于定义不同的数据系列（数据簇）：

```typescript
series: [
  {
    name: '角色A',
    data: [80, 85, 40, 90, 50, 70], // 对应各个维度的数值
    color: '#5470c6',                // 线条颜色
    areaColor: 'rgba(84, 112, 198, 0.3)', // 填充颜色
  },
  {
    name: '角色B',
    data: [50, 60, 85, 40, 90, 80],
    color: '#91cc75',
    areaColor: 'rgba(145, 204, 117, 0.3)',
  },
]
```

### 雷达图样式配置

```typescript
radarConfig: {
  center: ['50%', '50%'],      // 中心位置
  radius: '70%',                // 半径
  startAngle: 90,               // 起始角度（度）
  splitNumber: 4,               // 分割线数量
  axisLine: true,               // 是否显示轴线
  splitLine: true,              // 是否显示分割线
  indicatorName: true,          // 是否显示指示器名称
  backgroundColor: 'transparent', // 背景颜色
  splitLineColor: 'rgba(255, 255, 255, 0.2)', // 分割线颜色
  axisLineColor: 'rgba(255, 255, 255, 0.3)',  // 轴线颜色
  nameColor: '#fff',            // 指示器名称颜色
}
```

### 图例配置

```typescript
legendConfig: {
  show: true,                   // 是否显示图例
  position: 'top',              // 图例位置：'top' | 'bottom' | 'left' | 'right'
}
```

## 使用示例

### 基础使用

组件会自动使用默认配置，显示6个维度和2个系列的数据。

### 自定义配置

在配置面板中可以自定义：

1. **维度配置**：通过 `ChartDataSetter` 配置维度列表
2. **系列配置**：通过 `ChartSeriesTab` 配置系列列表
3. **雷达图样式**：配置中心位置、半径、颜色等
4. **图例配置**：配置图例的显示和位置

## 技术栈

- **React 18** - UI 框架
- **TypeScript** - 类型支持
- **ECharts 6** - 图表库
- **antd-style** - 样式解决方案

## 注意事项

1. 维度数量建议在 3-8 个之间，过多会影响可读性
2. 系列数量建议在 2-5 个之间，过多会导致图表过于复杂
3. 数据值应该在对应维度的 max 值范围内
4. 组件会自动响应窗口大小变化

