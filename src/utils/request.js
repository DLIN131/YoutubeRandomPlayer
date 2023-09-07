import axios from 'axios'

const baseUrl = 'https://www.googleapis.com/youtube/v3'

const request = axios.create({
  // TODO 1. baseUrl 2.time out
  baseURL: baseUrl
}
)

// 請求攔截器
// request.interceptors.request.use(

// )

// //回應攔截器
// request.interceptors.response.use(
//     (res) => {

//         //TODO 4. detected the core data
//         // TODO 3. faild
//     },
//     (err) => {
//         //401
//         // error specia case
//         //token expire or not haven't enough auth

//         // ElMessage.error(err.response.data.message || 'res error')
//     }
// )

export default request
export {
  baseUrl
}
