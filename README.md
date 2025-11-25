# 大屏自定义组件开发项目

这是一个用于大屏可视化平台的自定义组件开发项目，支持组件开发、配置项设置、事件交互等功能。

## 📦 项目结构

```
nebula_dashboard_components/
├── packages/
│   └── example/              # 完整的自定义组件示例
│       ├── src/
│       │   ├── component/   # 组件实现
│       │   ├── configure/   # 配置项定义
│       │   ├── setters/     # 自定义设置器
│       │   └── index.tsx    # 组件入口（核心注册逻辑）
│       ├── webpack.dev.js   # 开发环境配置
│       └── webpack.prod.js  # 生产环境配置
└── package.json
```

## 🚀 快速开始

### 1. 安装依赖

在项目根目录下执行：

```bash
pnpm i
```

### 2. 启动项目

项目提供两种启动方式：

#### 方式一：联调模式

用于与大屏平台进行联调，启动后可以在大屏中加载并调试自定义组件。

```bash
cd packages/example
pnpm start
# 或
pnpm serve
```

启动后，组件会通过 `window.registerGraphicCustomComponent` 注册到大屏平台。

#### 方式二：本地调试模式

用于本地独立调试组件，不依赖大屏平台，会自动打开浏览器预览。

```bash
cd packages/example
pnpm local
```

本地模式下，组件会直接渲染到页面，方便快速开发和调试。

### 3. 构建生产版本

```bash
cd packages/example
pnpm build
```

构建产物会输出到 `packages/example/dist` 目录。

## 📚 核心概念

### 自定义组件注册

自定义组件的核心注册逻辑在 `packages/example/src/index.tsx` 中：

```tsx
window.registerGraphicCustomComponent?.({
  component: Container, // 组件实现
  interaction: {
    // 交互事件配置
    title: '交互',
    eventConfigure: [
      {
        eventName: 'onClick',
        displayName: '点击',
      },
    ],
  },
  configure, // 配置项定义
  setter: [ExampleSetter], // 自定义设置器
})
```

### 组件实现

组件实现位于 `src/component/index.tsx`，接收以下核心 props：

```tsx
interface ContainerProps {
  /** 组件id */
  __id?: string
  /** 操作对象引用 */
  __operatorRef?: React.RefObject<any>
  /** 当前大屏模式：design（设计模式）| preview（预览模式）| live（运行模式） */
  __designMode?: 'design' | 'preview' | 'live'
  /** 应用辅助对象 */
  __appHelper?: {
    ctx: any
  }
  /** 样式配置 */
  style?: React.CSSProperties
}
```

### 配置项（Configure）

配置项定义了组件在右侧配置面板中显示的配置项，位于 `src/configure/index.ts`：

```tsx
export const configure: Configure = {
  title: '配置',
  key: 'setting',
  items: [
    {
      layout: 'CollapsePanel', // 折叠面板布局
      title: '基础配置',
      items: [
        {
          name: 'style.color', // 属性路径
          title: '文字颜色',
          setter: 'ColorSetter', // 使用的设置器
          inline: {
            flex: '1 1 100%',
          },
        },
      ],
    },
  ],
}
```

### 设置器（Setter）

设置器是配置面板中的单个配置项组件。系统提供了丰富的设置器组件，包括：

- **基础输入类**：`StringSetter`、`NumberSetter`、`MultiStringSetter` 等
- **颜色相关**：`ColorSetter`、`ColorSetterV2`、`EngineColorSetter` 等
- **字体与样式**：`FontFamilySetter`、`FontStyleSetter`、`TextStyleSetter` 等
- **布局与位置**：`LayoutSetter`、`PaddingSetter`、`RotationSetter` 等
- **选择器类**：`SelectSetter`、`CascaderSetter`、`RadioGroupSetter` 等
- **开关与显示**：`SwitchSetter`、`ShowSetter` 等
- **滑块与数值调节**：`SliderSetter`、`SliderNormalSetter` 等
- **上传类**：`ImageUploadSetter`、`VideoUploadSetter` 等
- 以及更多...

> 📖 **完整列表**：查看 [SETTERS.md](./SETTERS.md) 了解所有可用的 Setter 组件（共 77 个）

当系统提供的设置器不满足需求时，可以自定义开发，示例位于 `src/setters/example-setter/index.tsx`：

```tsx
interface ExampleSetterProps {
  value: string
  onChange: (val: string) => void
  defaultValue?: string
}

const ExampleSetter: React.FC<ExampleSetterProps> = ({ value, onChange }) => (
  <Input value={value} onChange={e => onChange(e.target.value)} placeholder='这是一个自定义设置器' />
)
```

### 交互事件（Interaction）

通过 `interaction` 配置可以为组件添加事件：

```tsx
interaction: {
  title: '交互',
  eventConfigure: [
    {
      eventName: 'onClick',      // 事件名称
      displayName: '点击',        // 显示名称
    },
  ],
}
```

## 🛠️ 开发指南

### 1. 创建新组件

1. 在 `src/component/` 目录下创建组件文件
2. 在 `src/index.tsx` 中导入并注册组件
3. 根据需要添加配置项和设置器

### 2. 添加配置项

在 `src/configure/index.ts` 中添加配置项：

```tsx
{
  name: 'style.width',        // 属性路径，支持嵌套
  title: '宽度',
  setter: 'NumberSetter',     // 使用系统设置器
  inline: {
    flex: '1 1 50%',
  },
}
```

### 3. 自定义设置器

1. 在 `src/setters/` 目录下创建设置器组件
2. 实现 `value` 和 `onChange` 接口
3. 在注册时添加到 `setter` 数组
4. 在配置项中通过 `setter: 'YourSetterName'` 引用

### 4. 样式开发

推荐使用 `antd-style` 进行样式开发，示例：

```tsx
import { createStyles } from 'antd-style'

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  `,
}))
```

## 📖 示例说明

`packages/example` 目录包含一个完整的自定义组件示例，包括：

- ✅ 组件实现（`src/component/index.tsx`）
- ✅ 配置项定义（`src/configure/index.ts`）
- ✅ 自定义设置器（`src/setters/example-setter/index.tsx`）
- ✅ 交互事件配置
- ✅ 样式定义（`src/component/styles.ts`）

可以参考该示例进行开发。

## 🔧 技术栈

- **React 18** - UI 框架
- **TypeScript** - 类型支持
- **Webpack 5** - 构建工具
- **Ant Design 5** - UI 组件库
- **antd-style** - 样式解决方案

## 📝 注意事项

1. **联调模式**：使用 `pnpm start/serve` 时，组件会注册到大屏平台，需要确保大屏平台已启动
2. **本地模式**：使用 `pnpm local` 时，组件会独立渲染，适合快速开发调试
3. **样式处理**：组件样式需要使用 `antd-style` 或 CSS Modules，避免全局样式污染
4. **外部依赖**：生产构建时，React、Ant Design 等会被 externalize，由大屏平台提供
