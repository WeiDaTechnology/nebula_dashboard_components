import type * as React from 'react'
import type { ContainerProps } from '..'
import useStyles from './styles'

interface ComponentProps extends ContainerProps {}

const Component: React.FC<ComponentProps> = props => {
  const { style } = props
  const { styles } = useStyles()

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h2 className={styles.title} style={{ color: style?.color }}>
          自定义组件
        </h2>
        <p className={styles.description}>这是一个自定义组件展示</p>
      </div>
    </div>
  )
}

export default Component
