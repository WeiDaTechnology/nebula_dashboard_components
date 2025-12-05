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
    Wrapper: css`
        display: flex;
        padding: 20px;
        flex-direction: column;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        background-color: #000000;
        width: 100%;
        height: 100%;
      `,

    header: css`
        display: flex;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 1px solid #d0d0d0;
      `,

    titleIcon: css`
        width: 24px;
        height: 24px;
        margin-right: 10px;
        background-color: #6a6a6a;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
      `,

    title: css`
        font-size: 18px;
        font-weight: 600;
        color: #333333;
      `,

    contentWrapper: css`
        display: flex;
        flex-direction: column;
        flex: 1;
      `,

    contentTitle: css`
        font-size: 16px;
        font-weight: 500;
        color: #444444;
        margin-bottom: 8px;
      `,

    contentDesc: css`
        font-size: 14px;
        color: #666666;
        margin-bottom: 20px;
      `,

    uploadArea: css`
        border: 2px dashed #cccccc;
        border-radius: 8px;
        padding: 20px;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s ease;
        background-color: #f8f8f8;
        margin-bottom: 20px;
        
        &:hover {
          border-color: #999999;
          background-color: #f0f0f0;
        }
      `,

    uploadIcon: css`
        font-size: 40px;
        color: #aaaaaa;
        margin-bottom: 10px;
      `,

    uploadText: css`
        font-size: 14px;
        color: #777777;
      `,

    fileList: css`
        margin-top: 15px;
        max-height: 200px;
        overflow-y: auto;
      `,

    fileItem: css`
        display: flex;
        align-items: center;
        padding: 10px;
        border-radius: 6px;
        margin-bottom: 8px;
        background-color: #f5f5f5;
        cursor: pointer;
        transition: background-color 0.2s;
        
        &:hover {
          background-color: #eaeaea;
        }
      `,

    fileIcon: css`
        margin-right: 10px;
        color: #666666;
      `,

    fileName: css`
        flex: 1;
        font-size: 14px;
        color: #444444;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      `,

    audioPlayer: css`
        width: 100%;
        margin-top: 20px;
        background-color: #f0f0f0;
        border-radius: 8px;
        padding: 15px;
        box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
      `,

    audioControls: css`
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 15px;
        margin-bottom: 15px;
      `,

    controlButton: css`
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: #e0e0e0;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s;
        color: #555555;
        font-size: 18px;
        
        &:hover {
          background-color: #d0d0d0;
          transform: scale(1.05);
        }
        
        &:active {
          transform: scale(0.95);
        }
      `,
    progressFilled: css`
        height: 100%;
        background-color: #a0a0a0;
        border-radius: 3px;
        width: 0%;
        transition: width 0.1s linear;
      `,

    // 自定义播放控制界面样式
    customControls: css`
        display: flex;
        flex-direction: column;
        gap: 15px;
        padding: 15px;
        background-color: #1a1a1a;
        border-radius: 8px;
        margin-top: 10px;
      `,

    playControls: css`
        display: flex;
        align-items: center;
        gap: 15px;
      `,

    playButton: css`
        min-width: 60px;
        height: 36px;
        background-color: #333333;
        color: #ffffff;
        border: none;
        border-radius: 18px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s;
        
        &:hover:not(:disabled) {
          background-color: #444444;
        }
        
        &:active:not(:disabled) {
          transform: scale(0.95);
        }
        
        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `,

    timeDisplay: css`
        display: flex;
        align-items: center;
        color: #cccccc;
        font-size: 14px;
        font-family: monospace;
      `,

    progressContainer: css`
        display: flex;
        align-items: center;
      `,

    progressBar: css`
        position: relative;
        flex: 1;
        height: 4px;
        background-color: #333333;
        outline: none;
        cursor: pointer;
        border-radius: 2px;
        margin-bottom: 10px;
        
        &:hover {
          background-color: #c0c0c0;
        }
        
        &::-webkit-slider-thumb {
          appearance: none;
          width: 14px;
          height: 14px;
          background-color: #ffffff;
          border-radius: 50%;
          cursor: pointer;
        }
        
        &::-moz-range-thumb {
          width: 14px;
          height: 14px;
          background-color: #ffffff;
          border-radius: 50%;
          cursor: pointer;
          border: none;
        }
        
        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `,

    volumeContainer: css`
        display: flex;
        align-items: center;
        gap: 10px;
        color: #cccccc;
        font-size: 14px;
      `,

    volumeSlider: css`
        width: 80px;
        height: 4px;
        background-color: #333333;
        outline: none;
        cursor: pointer;
        border-radius: 2px;
        
        &::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          background-color: #ffffff;
          border-radius: 50%;
          cursor: pointer;
        }
        
        &::-moz-range-thumb {
          width: 12px;
          height: 12px;
          background-color: #ffffff;
          border-radius: 50%;
          cursor: pointer;
          border: none;
        }
      `,

    loopContainer: css`
        display: flex;
        align-items: center;
        
        label {
          display: flex;
          align-items: center;
          gap: 5px;
          color: #cccccc;
          font-size: 14px;
          cursor: pointer;
          
          input[type="checkbox"] {
            cursor: pointer;
          }
        }
      `,

    fileInfo: css`
        margin-top: 10px;
        padding: 10px;
        background-color: #1a1a1a;
        border-radius: 6px;
        
        p {
          margin: 0;
          color: #cccccc;
          font-size: 14px;
        }
      `,
  }
})

export default useStyles
