import { Input } from 'antd'
import type React from 'react'

interface ExampleSetterProps {
  /** 属性值 */
  value: string
  /** 属性值改变回调 */
  onChange: (val: string) => void

  /** 默认属性值 */
  defaultValue?: string
  /** 输入框样式 */
  variant?: 'borderless' | 'outlined' | 'filled' | 'underlined'
}

const ExampleSetter: React.FC<ExampleSetterProps> = ({ value, onChange, defaultValue, variant = 'outlined' }) => (
  <Input
    defaultValue={defaultValue}
    onChange={e => onChange(e.target.value)}
    placeholder="这是一个自定义设置器"
    value={value}
    variant={variant}
  />
)

ExampleSetter.displayName = 'ExampleSetter'

export default ExampleSetter
