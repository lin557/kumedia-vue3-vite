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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getList = (type: string) => {
  const dt = new Date().getTime()
  return axios.get<MdeiaList>('mock/' + type + '/list.json?t=' + dt)
}

export const getTeleplayList = () => {
  // 返回的数据格式可以和服务端约定
  return axios.get<MdeiaList>('/api/teleplay')
}

export const getTeleplayJson = (params: string) => {
  // 返回的数据格式可以和服务端约定
  return axios.get<MediaJson>('/api/teleplay/' + params)
}

export const getMovieList = () => {
  return axios.get<MdeiaList>('/api/movie')
}

export const getMovieJson = (params: string) => {
  // 返回的数据格式可以和服务端约定
  return axios.get<MediaJson>('/api/movie/' + params)
}
