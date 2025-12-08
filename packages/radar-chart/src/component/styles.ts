import { createStyles } from 'antd-style'

const useStyles = createStyles(({ css, token }) => ({
  container: css`
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
    `,
  chartWrapper: css`
      width: 100%;
      height: 100%;
      min-height: 0;
      position: relative;
    `,
  legend: css`
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 16px;
      margin-top: 16px;
      flex-wrap: wrap;
    `,
  legendItem: css`
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: ${token.colorText};
    `,
  legendColor: css`
      width: 12px;
      height: 12px;
      border-radius: 2px;
    `,
}))

export default useStyles
