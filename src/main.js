import { createApp } from 'vue'
import pinia from './stores'
import './style.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(router)
app.use(pinia) // pinia插件配置
app.mount('#app') // 圖像建置
