import { request } from '@/utils'

export type ExecuteApiCallProps = {
  headers: Headers
  method: string
  requestBody: Headers
  requestParam: Headers
  url: string
}

export const executeApiCall = async (param: ExecuteApiCallProps) =>
  request('bjgraphicplatform/apiConfig/executeApiCall', {
    method: 'POST',
    data: param,
  })
