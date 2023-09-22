import axios from 'axios'
import { BASE_URL } from '../utils/serverUrl'
export const authUser = (token) => {
  return axios.get(`${BASE_URL}/protect`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
}
