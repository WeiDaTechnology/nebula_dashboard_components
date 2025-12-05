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
    modalOverlay: css`
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      z-index: 9999;
      padding: 0;
      box-sizing: border-box;
      overflow: auto;

      @keyframes pulse {
        0%, 100% {
          opacity: 1;
          transform: scale(1);
        }
        50% {
          opacity: 0.7;
          transform: scale(1.1);
        }
      }
    `,
    modalContainer: css`
      position: relative;
      width: 100%;
      max-width: 640px;
      background: #0b3658;
      border: 1px solid rgba(90, 180, 255, 0.6);
      border-radius: 8px;
      box-shadow:
        0 4px 16px rgba(0, 0, 0, 0.5),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      max-height: 90vh;
      box-sizing: border-box;
      margin: auto;
      user-select: none;

      @media (max-width: 500px) {
        max-width: calc(100vw - 20px);
        width: calc(100vw - 20px);
      }
    `,
    header: css`
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 16px;
      background: #0b3658;
      border-bottom: 1px solid rgba(90, 180, 255, 0.5);
      position: relative;
      min-height: 44px;
    `,
    statusIndicator: css`
      display: flex;
      align-items: center;
      gap: 8px;
      position: absolute;
      left: 16px;
    `,
    statusDot: css`
      width: 12px;
      height: 12px;
      border-radius: 50%;
      display: inline-block;
      box-shadow: 0 0 8px currentColor;
      animation: pulse 2s ease-in-out infinite;
    `,
    statusText: css`
      color: #fff;
      font-size: 16px;
      font-weight: 500;
      user-select: none;
    `,
    title: css`
      font-size: 18px;
      font-weight: 600;
      color: #fff;
      margin: 0;
      text-align: center;
      flex: 1;
      text-shadow: 0 0 6px rgba(64, 150, 255, 0.5);
      user-select: none;
      letter-spacing: 0.3px;
    `,
    rightActions: css`
      position: absolute;
      right: 12px;
      display: flex;
      align-items: center;
      gap: 5px;
    `,
    trophyIcon: css`
      font-size: 18px;
      line-height: 1;
      filter: drop-shadow(0 0 1px rgba(255, 215, 0, 0.5));
      user-select: none;
    `,
    closeButton: css`
      background: transparent;
      border: none;
      color: #fff;
      font-size: 22px;
      line-height: 1;
      cursor: pointer;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 3px;
      transition: all 0.2s ease;
      user-select: none;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      &:active {
        transform: scale(0.95);
      }
    `,
    content: css`
      padding: 16px;
      flex: 1;
      overflow-y: auto;
      user-select: none;
    `,
    mainLayout: css`
      display: flex;
      gap: 18px;
      /* index.tsx 中内容高度约 650px，减去头部与上下内边距后，预留 500px 给主体 */
      height: 500px;

      @media (max-width: 768px) {
        flex-direction: column;
        height: auto;
        min-height: 500px;
      }
    `,
    leftPanel: css`
      flex: 0 0 360px;
      display: flex;
      flex-direction: column;
      gap: 8px;

      @media (max-width: 768px) {
        flex: 1;
      }
    `,
    rightPanel: css`
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 14px;
      height: 100%;
      overflow-y: auto;
    `,
    chartContainer: css`
      flex: 1;
      background: rgba(15, 25, 40, 0.6);
      border: 1px solid rgba(64, 150, 255, 0.15);
      border-radius: 4px;
      padding: 6px 6px 4px;
      display: flex;
      flex-direction: column;
      min-height: 0;

      @media (max-width: 768px) {
        min-height: 180px;
        flex: none;
      }
    `,
    dataGrid: css`
      display: grid;
      grid-template-columns: 1fr;
      gap: 10px;
    `,
    dataColumn: css`
      display: flex;
      flex-direction: column;
      gap: 8px;
    `,
    dataItem: css`
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 9px 12px;
      background: rgba(11, 54, 88, 0.8);
      border: 1px solid rgba(90, 180, 255, 0.4);
      border-radius: 3px;
      pointer-events: none;
    `,
    label: css`
      color: #fff;
      font-size: 13px;
      font-weight: 400;
      white-space: nowrap;
      user-select: none;
    `,
    value: css`
      color: #fff;
      font-size: 13px;
      font-weight: 500;
      text-align: right;
      text-shadow: 0 0 3px rgba(64, 150, 255, 0.3);
      min-width: 80px;
      user-select: none;
    `,
    // 保留原有的样式以兼容
    container: css`
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
    `,
    description: css`
      color: ${token.colorTextSecondary};
    `,
  }
})

export default useStyles
