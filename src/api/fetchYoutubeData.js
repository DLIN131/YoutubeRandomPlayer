import request from '../utils/request'
import { API_KEY } from '../utils/apiKey'

export const fetchYoutubeData = (url, params) => {
  return request.get(url, { params })
}

export const fetchPlayListName = (url, params) => {
  return request.get(url, { params })
}

export const deleteListItem = (url, id) => {
  return request.delete(`${url}?id=${id}&key=${API_KEY}`)
}
