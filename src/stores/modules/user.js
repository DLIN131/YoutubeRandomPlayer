import { defineStore } from 'pinia'
import { ref } from 'vue'
import { googleLogin } from '../../api/googleLogin'
// import Cookies from 'js-cookie'
import { authUser } from '../../api/auth'

// const cookiesStorage = {
//   setItem (key, state) {
//     return Cookies.set(key, state, { expires: 3 })
//   },
//   getItem (key) {
//     return Cookies.get(key)
//   }
// }

export const useUserStore = defineStore('user', () => {
  const accessToken = ref('')
  const userInfo = ref({
    userId: '',
    username: '',
    email: '',
    avatar: '',
    creatAt: undefined,
    __v: undefined
  })
  // method
  const setToken = (token) => {
    accessToken.value = token
  }

  const getUserInfo = async (token) => {
    try {
      const res = await googleLogin(token)
      if (!res) return false
      userInfo.value = res.data.user
      setToken(res.data.token)
      return true
    } catch (err) {
      console.log('====================================')
      console.log(err)
      console.log('====================================')
      userInfo.value = null
      return false
    }
  }

  const authLogin = async () => {
    try {
      const res = await authUser(accessToken.value)
      console.log(res)
      if (!res.data) {
        userInfo.value = {}
        accessToken.value = ''
      }
    } catch (error) {
      userInfo.value = {}
      accessToken.value = ''
    }
  }

  return {
    accessToken,
    userInfo,
    authLogin,
    setToken,
    getUserInfo
  }
}, {
  persist: {
    enabled: true,
    strategies: [
      {
        storage: localStorage,
        paths: ['accessToken']
      }
      // { Storage: localStorage, paths: ['userInfo'] }
    ]
  }
})
