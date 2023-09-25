import request from '../utils/request'
import { API_KEY } from '../utils/apiKey'
import { useUserStore } from '../stores'
export const fetchYoutubeData = (url, params) => {
  return request.get(url, { params })
}

export const fetchPlayListName = (url, params) => {
  return request.get(url, { params })
}

export const deleteListItem = (url, id) => {
  const userStore = useUserStore()
  console.log(userStore.oauthToken)
  return request.delete(`${url}?id=${id}&key=${API_KEY}`, {
    headers: {
      Authorization: `Bearer ${userStore.oauthToken}`,
      Accept: 'application/json'
    }
  })
}
