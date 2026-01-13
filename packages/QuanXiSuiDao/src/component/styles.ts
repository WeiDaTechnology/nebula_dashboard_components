import { createStyles } from 'antd-style'

const useStyles = createStyles(({ css, token }) => {
  return {
    container: css`
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      padding: 20px;
    `,
    content: css`
      text-align: center;
      width: 100%;
      max-width: 500px;
    `,
    title: css`
      font-size: 1.5rem;
      font-weight: 700;
      color: ${token.colorPrimary};
      margin-bottom: 0.5rem;
    `,
    description: css`
      color: ${token.colorTextSecondary};
      margin-bottom: 1.5rem;
      font-size: 14px;
    `,
    buttonGroup: css`
      display: flex;
      justify-content: center;
      gap: 16px;
      margin-top: 20px;
      flex-wrap: wrap;
    `,
    button: css`
      padding: 10px 24px;
      font-size: 14px;
      font-weight: 500;
      color: #fff;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);

      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
      }

      &:active:not(:disabled) {
        transform: translateY(0);
        box-shadow: 0 2px 10px rgba(102, 126, 234, 0.3);
      }

      &:disabled {
        background: linear-gradient(135deg, #a0a0a0 0%, #808080 100%);
        cursor: not-allowed;
        box-shadow: none;
      }
    `,
    buttonActive: css`
      background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%);
      box-shadow: 0 4px 15px rgba(245, 87, 108, 0.5);
      animation: pulse 1.5s ease-in-out infinite;

      @keyframes pulse {
        0%, 100% {
          box-shadow: 0 4px 15px rgba(245, 87, 108, 0.5);
        }
        50% {
          box-shadow: 0 4px 25px rgba(245, 87, 108, 0.8);
        }
      }
    `,
    trackInfo: css`
      margin-top: 16px;
      font-size: 13px;
      color: ${token.colorTextTertiary};
    `,
    infoBox: css`
      margin-top: 24px;
      padding: 16px;
      background: ${token.colorBgContainer};
      border-radius: 8px;
      border: 1px solid ${token.colorBorderSecondary};

      p {
        margin: 4px 0;
        font-size: 13px;
        color: ${token.colorTextSecondary};
      }
    `,
  }
})

export default useStyles
