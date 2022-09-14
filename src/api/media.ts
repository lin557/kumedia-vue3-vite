import axios from '~/utils/vue-http'

interface Episode {
  title: string
  url: string
}

export interface MediaJson {
  title: string
  performer: string
  poster: string
  episodes: Array<Episode>
}

interface Project {
  id: number
  title: string
  sub: string
  status: string
  cover: string
  thumb: string
}

export interface MdeiaList {
  total: number
  rows: Array<Project>
}

const getList = (type: string) => {
  const dt = new Date().getTime()
  return axios.get<MdeiaList>('mock/' + type + '/list.json?t=' + dt)
}

export const getTeleplayList = () => {
  // 返回的数据格式可以和服务端约定
  return getList('teleplay')
}

export const getTeleplayJson = (params: string) => {
  // 返回的数据格式可以和服务端约定
  const dt = new Date().getTime()
  return axios.get<MediaJson>('mock/teleplay/' + params + '.json?t=' + dt)
}

export const getMovieList = () => {
  return getList('movie')
}

export const getMovieJson = (params: string) => {
  // 返回的数据格式可以和服务端约定
  const dt = new Date().getTime()
  return axios.get<MediaJson>('mock/movie/' + params + '.json?t=' + dt)
}
