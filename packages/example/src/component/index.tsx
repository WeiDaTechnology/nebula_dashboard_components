import React from 'react'
import useStyles from './styles'
import { getPagesByAppUuid, executeApiCall } from './service'
import { Button } from 'antd'

interface TextProps {}

const Text: React.FC<TextProps> = (props) => {
  const { styles } = useStyles()
  React.useEffect(() => {
   
    // 如何调用内部接口
    (async () => {
      // /graphic/pageView/cc48442a32f5f9d705f6ce10c9452eb9/3a0eddee-5479-9d5e-8ae7-a831a5953137/49e8d2ce1e65466bbf39972f3551d0b2
      const [n1, n2, n3, projectId = '', engineProjectId = '', appUuid = ''] = window.location.pathname?.split('/')
      // 判断一下 是不是发布态
      const isPublished = window.location.pathname.includes('pageView')
      const appInfo = await getPagesByAppUuid(appUuid, isPublished)
      console.log('🚀 ~ file: Test.tsx:17 ~ appInfo:', appInfo)
    })()
    console.log('🚀 ~ file: Test.tsx:46 ~ React.useEffect ~ aaaa:', window.aaaa)

    // 如何调用外部接口
    const requestAddress = window.requestAddress;
    (async () => {
      if (!requestAddress) return
      await executeApiCall({
        headers: {} as any,
        method: 'GET',
        requestBody: {} as any,
        requestParam: {} as any,
        url: requestAddress + '/labor/listTeam'
      })
    })()

    // 监听构件点击事件
    // const RESystemSelElement = () => {
    //   const curProbeRet = window.BlackHole3D.Probe.getCurProbeRet()
    //   console.log('🚀 ~ file: Test.tsx:37 ~ RESystemSelShpElement ~ curProbeRet:', curProbeRet)
    // }
    // document.addEventListener('RESystemSelElement', RESystemSelElement)
    // return () => {
    //   document.removeEventListener('RESystemSelElement', RESystemSelElement)
    // }
  }, [])
  const changeAttribute = () => {
    // 所有构件透明
    const elemBlendAttr = new window.BlackHole3D.REElemAttr()
    elemBlendAttr.dataSetId = ''
    elemBlendAttr.elemIdList = ''
    elemBlendAttr.elemClr = new window.BlackHole3D.REColor(5, 39, 175, 10)
    elemBlendAttr.elemEmis = 0
    elemBlendAttr.elemEmisPercent = 255
    elemBlendAttr.elemSmooth = 0
    elemBlendAttr.elemMetal = 0
    elemBlendAttr.elemSmmePercent = 0
    window.BlackHole3D.BIM.setElemAttr(elemBlendAttr)
  }
  // 恢复所有
  const resetAttribute = () => {
    window.BlackHole3D.BIM.resetElemAttr('', '')
  }
  // 隐藏组件
  const [visible, setVisible] = React.useState<boolean>(true)
  const hideComponent = () => {
    document.getElementById('HWdzkfKtXx').style.display = visible ? 'none' : 'block'
    document.getElementById('XWB-IHlceb').style.display = visible ? 'none' : 'block'
    setVisible(!visible)
  }
  return (
    <div className={styles.Text}>
      <Button onClick={() => changeAttribute()}>构件透明</Button>
      <Button onClick={() => resetAttribute()}>恢复所有</Button>
      <Button onClick={() => hideComponent()}>隐藏组件</Button>
    </div>
  )
}

export default Text
