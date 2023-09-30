import { createRouter, createWebHistory } from 'vue-router'
import videoDisplayPage from '../views/videoDisplayPage.vue'
import homePage from '../views/homePage.vue'

const router = createRouter({
  // vite.config.js base
  history: createWebHistory(import.meta.env.Base_URL),
  routes: [
    {
      path: '/',
      component: homePage,
      redirect: 'player',
      children: [
        {
          path: 'download',
          component: () => import('../views/downloadPage.vue')
        }, // download page
        {
          path: 'player',
          component: videoDisplayPage
        }
      ]
    }, // home page
    {
      path: '/login',
      component: () => import('../views/loginPage.vue')
    }
  ]
})

// 登入訪問攔截 => 默認是直接放行
// 根據return值決定是放行還是攔截
// 返回值的情況:
// 1. undefined / true 直接放行
// 2. false 攔回from的地址
// 3. 具體路徑 或 路徑物件 攔截到對應的地址
// ie.'login'    {name: 'login'}
// router.beforeEach((to) => {
//   // 如果沒有token, 且訪問的是非登入頁,攔截到登入, 其他情況正常放行
//   const userStore = useUserStore()
//   if (!userStore.token && to.path !== '/login') {
//     return '/login'
//   }
// })

export default router
