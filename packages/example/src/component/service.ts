import { request } from '@/utils'

export interface getDataByDeptUuidsParams {
  deptUuidList:string[]
}

export interface treeParams {
  projectId: string
  sceneId: string
}
// 获取应用详情
export const getPagesByAppUuid = async (param: any, published) => {
  // 设计态调用最新的page接口，因为可能没发布，只是保存了
  let res
  if (published) {
    res = await request('/graphapi/bjgraphicplatform/pagePublish/getSimplePublishPagesByAppUuid', {
      method: 'POST',
      data: { param: param }
    })
  } else {
    res = await request('/graphapi/bjgraphicplatform/page/getLatestSimplePagesByAppUuid', {
      method: 'POST',
      data: { param: param }
    })
  }
  return res
}

export interface ExecuteApiCallProps {
  headers: Headers;
  method: string;
  requestBody: Headers;
  requestParam: Headers;
  url: string;
}

export const executeApiCall = async (param: ExecuteApiCallProps) => {
  return request('bjgraphicplatform/apiConfig/executeApiCall', {
    method: 'POST',
    data: param,
  })
}
