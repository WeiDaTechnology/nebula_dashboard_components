import type * as React from 'react'
import type { DataSourceData } from '@/types/datasource'
import type { ContainerProps } from '..'
import useStyles from './styles'

interface ComponentProps extends ContainerProps {
  dataSourceData?: DataSourceData
  extraDataSourceData?: DataSourceData
}

const Component: React.FC<ComponentProps> = props => {
  const { style, dataSourceData, extraDataSourceData } = props
  const { styles } = useStyles()

  console.log('dataSourceData', dataSourceData, extraDataSourceData)

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h2 className={styles.title} style={{ color: style?.color }}>
          自定义组件
        </h2>
        <p className={styles.description}>这是一个带有数据源的自定义组件展示</p>
      </div>
    </div>
  )
}

export default Component
