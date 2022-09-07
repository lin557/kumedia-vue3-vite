import axios from '~/utils/vue-http'

// 用户登录
export const getJson = (params: string) => {
  // 返回的数据格式可以和服务端约定
  return axios.get<any>('/mock/tang-shi/json/' + params + '.json', undefined)
}
