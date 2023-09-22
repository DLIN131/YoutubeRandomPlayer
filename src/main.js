import { createApp } from 'vue'
import pinia from './stores'
import './style.css'
import App from './App.vue'
import router from './router'
import vue3GoogleLogin from 'vue3-google-login'

const app = createApp(App)
app.use(router)
app.use(pinia) // pinia插件配置
app.use(vue3GoogleLogin, {
  clientId: '959560237311-13dbj26mjffjcph7r49pq3c57lbvpgrr.apps.googleusercontent.com',
  scope: 'profile email'
}) // 登入插件
app.mount('#app') // 圖像建置
