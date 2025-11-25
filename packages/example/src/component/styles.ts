import { createStyles } from 'antd-style'

const useStyles = createStyles(({ cx, css, prefixCls, token, responsive }) => {
  /**
   * 🚀 xs: 575
   * 🚀 sm: 767
   * 🚀 md: 991
   * 🚀 lg: 1199
   * 🚀 xl: 1599
   * 🚀 xxl: 1600
   */
  // 主题变量文档 https://ant-design.antgroup.com/theme-editor-cn
  return {
    container: css`
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
    `,
    content: css`
      text-align: center;
      width: 100%;
    `,
    title: css`
      font-size: 1.5rem;
      font-weight: 700;
      color: ${token.colorPrimary};
      margin-bottom: 0.5rem;
    `,
    description: css`
      color: ${token.colorTextSecondary};
    `,
  }
})

export default useStyles
