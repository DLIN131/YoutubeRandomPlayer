import axios from 'axios'
import { BASE_URL } from '../utils/serverUrl'
export const googleLogin = (token) => {
  return axios.post(`${BASE_URL}/google-login`, {
    access_token: token
  }, {
    headers: {
      'Content-Type': 'application/json'
    }
  })
}
