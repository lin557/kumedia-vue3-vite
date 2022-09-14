import axios from '~/utils/vue-http'

interface TangWork {
  title: string
  path: string
}

interface TangItem {
  author: string
  works: Array<TangWork>
}

export interface TangList {
  total: number
  rows: Array<TangItem>
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
  s: Array<TangSentence>
}

export interface TangJson {
  title: string
  audio: string
  rows: Array<TangRows>
}

export const getTangList = () => {
  const dt = new Date().getTime()
  return axios.get<TangList>('mock/tang/list.json?t=' + dt)
}

export const getTangJson = (params: string) => {
  const dt = new Date().getTime()
  return axios.get<TangJson>('mock/tang/' + params + '.json?t=' + dt)
}