<template>
  <div class=" md:flex md:justify-between relative p-2 ">
    <div class=" flex flex-col md:w-8/12 items-center">
      <div class="player" ref="playerContainerRef">
        <youtubePlayer v-if="isPrepare" :width="playerSize.width" :height="playerSize.height" :vid="videoId"
          :title="title" :id="id" ref="playerRef" @changeState="getPlayerState">
        </youtubePlayer>
        <div v-else class="text-white">waiting fo video...</div>
      </div>
      <div v-if="isPrepare" id="buttonArea" class=" bg-transparent/[.7]
                shadow-inner  shadow-gray-600 w-full md:w-8/12 min-w-fit mt-10 flex flex-col
                justify-center items-center rounded-xl p-5">
        <div class="text-white">
          音量
          <input v-model="volumeRange" @change="handleVolumeChange" type="range" name="progress" min="0" max="100">
        </div>
        <div class="flex items-center gap-2 flex-wrap">
          <button @click="changeToPrev" class=""><el-icon>
              <ArrowLeftBold />
            </el-icon></button>
          <button v-if="isPlaying" @click="pauseVideo" class=" w-24 h-24 text-5xl rounded-full">
            <el-icon>
              <VideoPause />
            </el-icon>
          </button>
          <button v-else @click="playVideo" class=" w-24 h-24 text-5xl rounded-full ">
            <el-icon>
              <VideoPlay />
            </el-icon>
          </button>
          <button @click="changeToNext"><el-icon>
              <ArrowRightBold />
            </el-icon></button>
        </div>
        <div class="flex items-center mt-2 gap-2 flex-wrap">
          <button @click="setRandomPlay" :disabled="!useYoutubeData.isLoaded">R</button>
          <button @click="setOrderPlay">
            <el-icon>
              <Sort class="rotate-90" />
            </el-icon>
          </button>
          <button @click="showSearching"><el-icon>
              <Search />
            </el-icon></button>
        </div>
      </div>
    </div>
    <searchCard v-if="isSearching" @handleClose="showSearching(message)" @loadVideo="loadVideo"
      :dataArr="snippetData" />
    <!-- 顯示影片清單區域 -->

    <div id="playlistScrollContainer"
      class="translate-x-[110%] transition-all md:translate-x-0 md:static absolute  right-1 top-0  w-fit overflow-x-hidden">
      <el-scrollbar ref="scrollRef" class=" relative  md:flex flex-col" max-height="100vh" always native>
        <div v-if="!useYoutubeData.isLoaded" class=" text-white">[{{ useYoutubeData.snippetData.length }}]</div>
        <div v-for="(item, index) in snippetData" :key="index" @click="loadVideo(item, index)" :ref="listItems(index)"
          :class="[`flex place-items-start gap-3 h-32 overflow-ellipsis overflow-hidden  p-2 items-center relative
                     bg-black  w-full min-w-[7rem] cursor-pointer border border-white bg-transparent/[.5] shadow-inner shadow-md shadow-white
                       text-white`, { colorBackground: clickIndex === index }]">
          <img :src="item.snippet.thumbnails.medium.url" class=" w-28 h-24 rounded-md shadow-2">
          {{ item.snippet.position + " " + item.snippet.title }}
          <span
            :class="[`flex justify-center items-center absolute w-7 h-7 right-12 bottom-5 rounded-full bg-red-100/[.5] hover:bg-blue-400/[.5] `]"
            @click.stop="deleteVideo(item.id)">
            X
          </span>
          <span :class="[`flex justify-center items-center absolute w-7 h-7 right-3 bottom-5 rounded-full bg-red-400/[.5] hover:bg-black/[.5]  `,
          { downloadBg: isDownloading[index] }]" @click.stop="download(item, index)">
            <el-icon>
              <Download />
            </el-icon>
          </span>
        </div>
      </el-scrollbar>
    </div>
    <div @click="togglePlaylist"
      class="md:hidden flex items-center absolute w-4 h-10 bg-slate-200/[.3] rounded-s-md border-2 text-black right-0 top-28 z-20 cursor-pointer">
      <el-icon id="toggleListBtn" class="transition-transform">
        <ArrowLeftBold />
      </el-icon>
    </div>
  </div>
</template>

<script setup>
// import
import { useYoutubeDataStore, usePlaylistStore } from '../stores'
import { ref, onBeforeUnmount, onMounted, watch, onUnmounted } from 'vue'
import youtubePlayer from '../components/youtubePlayer.vue'
import searchCard from '../components/searchCard.vue'
import { downloadData } from '../api/downloadData'
import { API_KEY } from '../utils/apiKey'
import {
  ArrowLeftBold,
  ArrowRightBold,
  VideoPlay,
  VideoPause,
  Search,
  Sort,
  Download
} from '@element-plus/icons-vue'

// variables
const useYoutubeData = useYoutubeDataStore()
const usePlaylist = usePlaylistStore()
const snippetData = ref([])
const volumeRange = ref(0)
const title = ref('')
const videoId = ref('')
const id = ref(0)
const playerSize = ref({
  width: window.innerWidth > 600 ? 600 : window.innerWidth - 10,
  height: window.innerWidth > 600 ? 400 : window.innerHeight / 2
})
const isPrepare = ref(false)
const isPlaying = ref(false)
const playerRef = ref(null)
const playerContainerRef = ref(null)
const scrollRef = ref(null)
const clickIndex = ref(-1)
const isDownloading = ref([])
let timeOut = null
const next = ref({
  prevItem: Object,
  prevIndex: Number,
  nextItem: Object,
  nextIndex: Number
})
const listItemsRef = ref([])
const isSearching = ref(false)
const accessToken = ref('') // youtube清單影片刪除用access token

// methods
// 載入歌曲
const loadVideo = async (item, index) => {
  if (item) {
    id.value = index
    title.value = item.snippet.title
    isPrepare.value = true
    videoId.value = item.snippet.resourceId.videoId
    changeIsPlayingItemBg(index)
    modifyListItemPos(index)
    next.value.prevIndex = index - 1
    next.value.prevItem = snippetData.value[index - 1]
    next.value.nextIndex = index + 1
    next.value.nextItem = snippetData.value[index + 1]
    console.log(item)
  }
}
// 改變正在播放歌曲的背景
const changeIsPlayingItemBg = (newIndex) => {
  clickIndex.value = newIndex
  useYoutubeData.latestIndex = newIndex
}

// 修正歌單位置
const modifyListItemPos = (index) => {
  if (index < 3) {
    scrollRef.value.setScrollTop(0)
    return
  }
  if (listItemsRef.value && listItemsRef.value[index]) {
    console.log(listItemsRef.value[index])
    const top = listItemsRef.value[index].getBoundingClientRect().height * (index - 4)
    scrollRef.value.setScrollTop(top)
    listItemsRef.value[index].getBoundingClientRect()
  }
}

const showSearching = (state) => {
  if (!state) {
    isSearching.value = false
    window.addEventListener('keydown', handleGlobalKeyDown)
    return
  }
  isSearching.value = true
  window.removeEventListener('keydown', handleGlobalKeyDown)
}

// 切換歌曲上下首
const changeToNext = () => {
  if (next.value.nextIndex > snippetData.value.length - 1) {
    next.value.nextIndex = 0
    next.value.nextItem = snippetData.value[0]
  }
  loadVideo(next.value.nextItem, next.value.nextIndex)
}
const changeToPrev = () => {
  if (next.value.prevIndex < 0) {
    next.value.prevIndex = snippetData.value.length - 1
    next.value.prevItem = snippetData.value[snippetData.value.length - 1]
  }
  loadVideo(next.value.prevItem, next.value.prevIndex)
}

// 獲取從youtubeplayer組件中emit過來的狀態
const getPlayerState = (state) => {
  console.log(state)
  console.log(playerRef.value)
  volumeRange.value = state.target.getVolume()
  clearTimeout(timeOut)
  if (state.data === 0) {
    changeToNext()
  } else if (state.data === 1) {
    isPlaying.value = true
  } else if (state.data === 2) {
    isPlaying.value = false
  } else {
    timeOut = setTimeout(() => {
      if (state.data === -1) {
        changeToNext()
      }
    }, 2000)
  }
}

const pauseVideo = () => {
  playerRef.value.pause()
}

const playVideo = () => {
  playerRef.value.play()
}

const seekTo = async (seconds) => {
  let currentTime = await playerRef.value.getCurrentTime()
  currentTime += seconds
  playerRef.value.seekTo(currentTime)
}
const setVolume = async (volume) => {
  let currentVolume = await playerRef.value.getVolume()
  currentVolume += volume
  volumeRange.value = currentVolume
  playerRef.value.setVolume(currentVolume)
}

const handleVolumeChange = (e) => {
  console.log(e)
  playerRef.value.setVolume(volumeRange.value)
}

const setRandomPlay = () => {
  for (let i = snippetData.value.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [snippetData.value[i], snippetData.value[j]] = [snippetData.value[j], snippetData.value[i]]
  }
  loadVideo(snippetData.value[0], 0)
}

const setOrderPlay = () => {
  snippetData.value = [...useYoutubeData.snippetData]
  loadVideo(snippetData.value[0], 0)
}

const download = async (item, index) => {
  try {
    isDownloading.value[index] = true
    const res = await downloadData(item.snippet.resourceId.videoId)
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${item.snippet.title}.mp3`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    isDownloading.value[index] = false
    console.log(url)
  } catch (err) {
    console.log(err)
  }
}

// 授權登入
const authenticate = () => {
  window.tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: '959560237311-13dbj26mjffjcph7r49pq3c57lbvpgrr.apps.googleusercontent.com',
    scope: 'https://www.googleapis.com/auth/youtube.force-ssl',
    callback: (response) => {
      accessToken.value = response.access_token
      loadClient()
    },
    prompt: 'consent',
    ux_mode: 'popup'
  })
  window.tokenClient.requestAccessToken()
}

const loadClient = () => {
  gapi.client.setApiKey(API_KEY)
  gapi.client.setToken({ access_token: accessToken.value })
  return gapi.client.load('https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest')
    .then(
      () => {
        console.log('GAPI client loaded for API')
      },
      (err) => {
        console.error('Error loading GAPI client for API', err)
      }
    )
}

const execute = (listItemId) => {
  return gapi.client.youtube.playlistItems.delete({
    id: listItemId
  }).then(
    (response) => {
      console.log('Response', response)
    },
    (err) => {
      console.error('Execute error', err)
    }
  )
}

// 刪除清單影片
const deleteVideo = (id) => {
  console.log(id)
  if (!accessToken.value) {
    authenticate()
  }
  execute(id)
  // 刪除陣列中對應位置的資料
  const index = useYoutubeData.snippetData.findIndex((item) => item.id === id)
  console.log(snippetData.value[index])
  useYoutubeData.snippetData.splice(index, 1)
  snippetData.value.splice(index, 1)
}
// const handleDelete = async (item) => {
//   await useYoutubeData.deleteItem(item.id)
// }

const togglePlaylist = () => {
  const toggleBtn = document.getElementById('toggleListBtn')
  const scrollEle = document.getElementById('playlistScrollContainer')
  scrollEle.classList.toggle('translate-x-[110%]')
  toggleBtn.classList.toggle('rotate-180')
}

const handleGlobalKeyDown = (e) => {
  // 避免方向鍵觸發滾動條
  // e.preventDefault();
  // console.log(e.keyCode );
  // w
  if (e.keyCode === 87) {
    changeToPrev()
  } else if (e.keyCode === 83) { // s
    changeToNext()
  } else if (e.keyCode === 65) { // a
    seekTo(-5)
  } else if (e.keyCode === 68) { // d
    seekTo(5)
  } else if (e.keyCode === 32) {
    e.preventDefault() // space
    switch (isPlaying.value) {
      case true:
        playerRef.value.pause()
        break
      case false:
        playerRef.value.play()
        break
      default: break
    }
  } else if (e.keyCode === 38) { // ArrowTop
    e.preventDefault()
    setVolume(5)
  } else if (e.keyCode === 40) { // ArrowBottom
    e.preventDefault()
    setVolume(-5)
  } else if (e.keyCode === 37) { // ArrowLeft
    seekTo(-5)
  } else if (e.keyCode === 39) { // ArrowRight
    seekTo(5)
  }
}
const listItems = (index) => (el) => {
  // console.log(index);
  listItemsRef.value[index] = el
}

const loadScripts = () => {
  // 導入gapi
  const script1 = document.createElement('script')
  script1.src = 'https://accounts.google.com/gsi/client'
  script1.async = true
  script1.defer = true
  document.body.appendChild(script1)

  const script2 = document.createElement('script')
  script2.src = 'https://apis.google.com/js/api.js'
  script2.onload = () => {
    gapi.load('client', () => {
      console.log('GAPI client loaded')
    })
  }
  document.body.appendChild(script2)

  return () => {
    document.body.removeChild(script1)
    document.body.removeChild(script2)
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeyDown)
  snippetData.value = [...useYoutubeData.snippetData]
  loadVideo(snippetData.value[useYoutubeData.latestIndex], useYoutubeData.latestIndex)

  const cleanup = loadScripts()
  onUnmounted(() => {
    cleanup()
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleGlobalKeyDown)
})

watch(
  () => useYoutubeData.isLoaded, (newIsLoaded) => {
    if (newIsLoaded) {
      snippetData.value = [...useYoutubeData.snippetData]
      useYoutubeData.latestIndex = 0
    }
  })
watch(
  () => usePlaylist.playlist, (newPlaylist) => {
    if (newPlaylist) {
      snippetData.value = [...newPlaylist]
    }
  })

</script>

<style scoped>
.colorBackground {
  background-color: rgba(0, 218, 247, 0.308);
  border-left: 4px solid rgb(149, 149, 236);
}

button {
  background: black;
  box-shadow: 0px 3px 0px rgba(163, 26, 26, 1.0);

}

.player {
  /* display: none; */
}

.downloadBg {
  background-color: green;
}

@media screen and (max-width: 768px) {
  button {
    width: 5rem;
    height: 1.75rem;
    font-size: 100%;
  }
}

button:hover {
  border-color: #646cff;
}
</style>
