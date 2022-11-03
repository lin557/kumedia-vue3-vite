import axios from '~/utils/vue-http'

export interface TangWork {
  title: string
  path: string
  writer?: string
}

export interface TangList {
  total: number
  rows: Array<TangWork>
}

export interface TangSentence {
  pinyi: Array<string>
  text: string
  start1: number
  stop1: number
  start2: number
  stop2: number
}

export interface TangRows {
  pinyi: Array<string>
  text: string
  br: number
  one: Array<number>
  two: Array<number>
}

export interface TangJson {
  title: string
  audio?: string | undefined
  video?: string | undefined
  rows: Array<TangRows>
}

export const getTangList = () => {
  // const dt = new Date().getTime()
  // return axios.get<TangList>('mock/tang/list.json?t=' + dt)
  return axios.get<TangList>('/api/tang')
}

export const getTangJson = (params: string) => {
  // const dt = new Date().getTime()
  // return axios.get<TangJson>('mock/tang/' + params + '.json?t=' + dt)
  return axios.get<TangJson>('/api/tang/' + params)
}
