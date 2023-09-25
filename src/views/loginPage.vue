<template>
  <div class="w-full h-screen flex justify-center items-center bg-red-500">
    <div
      class=" flex justify-center items-center login-card min-w-[30rem] rounded-xl h-96 bg-gray-800 shadow-2xl shadow-black hover:shadow-sm transition-all duration-500">
      <button @click="handleGoogleAccessTokenLogin"
        class="bg-transparent w-48 mb-3 hover:bg-gray-300 hover:text-black transition-all duration-400 border-red-700">google登入</button>
    </div>
  </div>
</template>

<script setup>
import { googleTokenLogin } from 'vue3-google-login'
import { useUserStore } from '../stores'
import { useRouter } from 'vue-router'
// valuriable
const router = useRouter()
const userStore = useUserStore()
const GOOGLE_CLIENT_ID = '959560237311-13dbj26mjffjcph7r49pq3c57lbvpgrr.apps.googleusercontent.com'
// const data = ref()
// methods
const handleGoogleAccessTokenLogin = async () => {
  const res = await googleTokenLogin({
    clientId: GOOGLE_CLIENT_ID
  })
  console.log(res)
  const token = res.access_token
  userStore.oauthToken = token
  const success = await userStore.getUserInfo(token)
  if (success) {
    alert('登入成功')
    router.push('./')
    return
  }
  alert('登入失敗')
  router.push('./')

  console.log('====================================')
  console.log(userStore.accessToken)
  console.log('====================================')
}
</script>

<style scoped></style>
