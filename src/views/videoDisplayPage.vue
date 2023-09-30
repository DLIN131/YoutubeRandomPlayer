<template>
  <div class="flex justify-between ">
    <div class="flex flex-col w-8/12 items-center">
      <div class="player" ref="playerContainerRef">
        <youtubePlayer v-if="isPrepare" :width="600" :height="400" :vid="videoId" :title="title" :id="id" ref="playerRef"
          @changeState="getPlayerState">
        </youtubePlayer>
        <div v-else class="text-white">waiting fo video...</div>
      </div>
      <div v-if="isPrepare" id="buttonArea" class=" bg-transparent/[.7]
                shadow-inner  shadow-gray-600 w-8/12 min-w-fit mt-10 flex flex-col
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
          <button @click="setRandomPlay" :disabled="!useYoutubeData.isLoaded">Random</button>
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
    <searchCard v-if="isSearching" @handleClose="showSearching(message)" @loadVideo="loadVideo" :dataArr="snippetData" />
    <!-- 顯示影片清單區域 -->

    <el-scrollbar ref="scrollRef" class="customScrollbar ml-3 flex flex-col" max-height="100vh" always native="true">
      <div v-if="!useYoutubeData.isLoaded" class=" text-white">[{{ useYoutubeData.snippetData.length }}]</div>
      <div v-for="(item, index) in snippetData" :key="index" @click="loadVideo(item, index)" :ref="listItems(index)"
        :class="[`flex place-items-start gap-3 h-32 overflow-ellipsis overflow-hidden  p-2 items-center relative
                     bg-black  w-full min-w-[7rem] cursor-pointer border border-white bg-transparent/[.5] shadow-inner shadow-md shadow-white
                       text-white`, { colorBackground: clickIndex === index }]">
        <img :src="item.snippet.thumbnails.medium.url" class=" w-28 h-24 rounded-md shadow-2">
        {{ item.snippet.position + " " + item.snippet.title }}
        <span :class="[`flex justify-center items-center absolute w-7 h-7 right-3 bottom-5 rounded-full bg-red-400/[.5] hover:bg-black/[.5]  `,
          { downloadBg: isDownloading[index] }]" @click.stop="download(item, index)">
          <el-icon>
            <Download />
          </el-icon>
        </span>
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup>
// import
import { useYoutubeDataStore, usePlaylistStore } from '../stores'
import { ref, onBeforeUnmount, onMounted, watch } from 'vue'
import youtubePlayer from '../components/youtubePlayer.vue'
import searchCard from '../components/searchCard.vue'
import { downloadData } from '../api/downloadData'
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
  if (listItemsRef.value) {
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
    }, 1000)
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

// const handleDelete = async (item) => {
//   await useYoutubeData.deleteItem(item.id)
// }

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

onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeyDown)
  snippetData.value = [...useYoutubeData.snippetData]
  // loadVideo(snippetData.value[useYoutubeData.latestIndex],useYoutubeData.latestIndex)
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

::-webkit-scrollbar {
  width: 10px;
}

/* Track */
::-webkit-scrollbar-track {
  background: #f1b8b8;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: #9af5cf;
  border-radius: 5px;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #00ec6a;
}

.player {
  perspective: 1000px;
  transition: transform 0.3s ease;
  /* transform: rotateY(45deg); */
}

.downloadBg {
  background-color: green;
}

button:hover {
  border-color: #646cff;
}
</style>
