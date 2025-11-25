import { createStyles } from 'antd-style'
const useStyles = createStyles(({ cx, css, prefixCls, token, responsive }) => {
/**
* 🚀 xs: 575
* 🚀 sm: 767
* 🚀 md: 991
* 🚀 lg: 1199
* 🚀 xl: 1599
* 🚀 xxl: 1600
* */
  // 主题变量文档 https://ant-design.antgroup.com/theme-editor-cn
  return {
    Text: css`
      color: ${token.colorPrimary};
    `
  }
})
export default useStyles
