import { Input } from 'antd'
import React from 'react'

type IconBtnSetterProps = {
  value: string
  onChange: (val: string) => void
  activeName: string
  defaultName: string
  iconType: string
}

export const Setter1: React.FC<IconBtnSetterProps> = ({ value, onChange, defaultName, activeName }) => {
  const isActive = activeName === value
  console.log(">>>>> 1111")
  return (
    <Input
      placeholder='这是一个自定义设置器'
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onClick={() => {
        // onChange();
      }}
    />
  )
}

Setter1.displayName = 'Setter1'