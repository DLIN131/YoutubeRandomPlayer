import axios from 'axios'
import { BASE_URL } from '../utils/serverUrl'

const instance = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json'
  }
})
export const updatePlaylistData = (userId, params) => {
  return instance.put(`/playlist/${userId}`, params)
}

export const postPlaylistData = (params) => {
  return instance.post('/playlist', params)
}

export const fetchPlaylistData = (params) => {
  return instance.get('/playlist', { params })
}

export const fetchPlaylistNames = (params) => {
  return instance.get('/playlist/listname', { params })
}

export const deletePlaylistData = (params) => {
  return instance.delete('/playlist', { params })
}
