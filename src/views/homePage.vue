<template>
  <!-- side menu -->
  <el-container class="layout-container-demo" style="height: 100vh">
    <el-aside v-if="!notDisplaySideMenu" width="200px">
      <el-scrollbar>
        <button v-if="!notDisplaySideMenu" @click="toggleMenu"
          class=" w-11 h-11  flex items-center justify-center mb-3 bg-black">
          <el-icon>
            <Fold />
          </el-icon>
        </button>
        <el-menu router>
          <el-menu-item index="/player" class="el-menu-item">
            <template #title>
              <el-icon>
                <House></House>
              </el-icon> home
            </template>
          </el-menu-item>
          <el-menu-item index="/downLoad">
            <template #title>
              <el-icon>
                <Download></Download>
              </el-icon> download
            </template>
          </el-menu-item>
        </el-menu>
      </el-scrollbar>
    </el-aside>
    <!-- input area -->
    <el-container>
      <el-header style="text-align: center; font-size: 16px" class=" shadow-lg shadow-black z-10">
        <div class="w-full h-full p-1  flex justify-center gap-3 items-center relative">
          <button v-if="notDisplaySideMenu" @click="toggleMenu"
            class=" w-11 h-11 rounded-md flex items-center justify-center z-10 bg-black ">
            <el-icon>
              <Expand />
            </el-icon>
          </button>
          <el-dropdown @command="handleCommand">
            <span class="el-dropdown-link">
              <el-icon class="el-icon--left">
                <List />
              </el-icon>list history
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item v-for="(item, index) in listNames" :key="index" :command="item.value" divided>{{
                  item.name }}</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

          <input v-model="listId" type="text" placeholder="listId" class="w-8/12 h-full mr-1">
          <span class="w-36 flex gap-2 items-center">
            <button @click="fetchData" class=" bg-black">append</button>
            <img v-if="isLoading" class=" w-10 h-10" src="../assets/img/hutoa01-unscreen.gif" alt="">
          </span>
        </div>
      </el-header>
      <!-- songList -->
      <el-scrollbar>
        <el-main class="flex justify-centeritems-center min-w-96 h-[100vh]">
          <router-view></router-view>
        </el-main>
      </el-scrollbar>
    </el-container>
  </el-container>
</template>

<script lang="ts" setup>
// import
import { ref } from 'vue'
import { House, Download, Expand, Fold, List } from '@element-plus/icons-vue'
import { useYoutubeDataStore } from '../stores'

// variables
const isLoading = ref(false)
const useYoutubeData = useYoutubeDataStore()
const listId = ref('')
const notDisplaySideMenu = ref(true)
const listNames = ref(useYoutubeData.listNameData) // array

// methods
const fetchData = () => {
  const pattern = /list=([a-zA-Z0-9_-]+)/
  const match = listId.value.match(pattern)
  if (listId.value === '') {
    alert('not enter a url or listId')
    return
  }
  if (match) {
    listId.value = match[1]
  }
  // console.log(listId.value);
  isLoading.value = true
  useYoutubeData.getSnippetData(listId.value)
  useYoutubeData.getListName(listId.value)
  useYoutubeData.latestIndex = 0
  // console.log(useYoutubeData.snippetData);
  console.log(useYoutubeData.listNameData)

  isLoading.value = false
}
const handleCommand = (command) => {
  listId.value = command
}
const toggleMenu = () => {
  notDisplaySideMenu.value = !notDisplaySideMenu.value
}

</script>

<style scoped>
.el-main {
  background: url('../assets/img/main_bg01.jpg') no-repeat center;
}

.layout-container-demo .el-header {
  position: relative;
  background-color: rgb(253, 44, 44);
  color: black;
  outline-style: solid;
  outline-width: 2px;
  outline-color: rgb(17, 15, 15);
}

.layout-container-demo .el-aside {
  color: var(--el-text-color-primary);
  background: rgb(29, 28, 28);
  /* margin-right: 1.25rem; */
  border-right: 4px;
  border-right-color: rgb(0, 0, 0);
  padding: 0.5rem;
  background: url('../assets/img/bg04.jpg');
  background-size: cover;
  background-position-x: center;
}

.el-menu-item {
  border-bottom-width: 1px;
  border-bottom-color: rgb(26, 23, 23);
}

.el-dropdown-link {
  background-color: rgb(2, 2, 2);
  height: 1.75rem;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.5rem;
  border-radius: 0.5rem;
  color: white;
}
</style>
