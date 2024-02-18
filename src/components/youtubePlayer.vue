<template>
  <div class="flex items-center flex-col">
    <div class="youtube-video ">
      <div :id="'youtube-' + id"></div>
    </div>
    <titleCard :title="title"></titleCard>
  </div>
</template>

<script setup>
import { watch, onMounted, onBeforeUnmount } from 'vue'
import YouTubePlayer from 'youtube-player'
import titleCard from './titleCard.vue'

const props = defineProps({
  id: { type: Number, default: 0 },
  vid: { type: String, required: true, default: '' },
  width: { type: Number, default: 0 },
  height: { type: Number, default: 0 },
  title: { type: String, default: '' }
})

const emit = defineEmits(['changeState', 'changeVolume'])

onMounted(() => {
  initPlayer()
  loadPlayer()
  addStateChange()
})

onBeforeUnmount(() => {
  player && player.destroy()
  removeStateChange()
})

const getVideoId = () => {
  try {
    const videoId = props.vid
    return videoId
  } catch (error) {
    return ''
  }
}

let player = null
const initPlayer = () => {
  try {
    player = YouTubePlayer(`youtube-${props.id}`, {
      host: 'https://www.youtube.com',
      width: props.width,
      height: props.height,
      videoId: getVideoId(),
      playsinline: 1,
      rel: 0
    })
  } catch (error) {
    console.log(error)
  }
}

const loadPlayer = () => {
  try {
    player.loadVideoById(getVideoId())
  } catch (error) {
    console.log(error)
  }
}

const play = () => player && player.playVideo()
const pause = () => player && player.pauseVideo()
const seekTo = (seconds) => player && player.seekTo(seconds)
const getCurrentTime = () => player && player.getCurrentTime()
const getVolume = () => player && player.getVolume()
const setVolume = (volume) => player && player.setVolume(volume)

// -1（未开始）0（已结束）1（正在播放）2（已暂停）3（正在缓冲）5（视频已插入）
let stateChangeListener
const addStateChange = () => {
  stateChangeListener = player?.on('stateChange', (event) => {
    emit('changeState', event)
  })
}
const removeStateChange = () => {
  if (stateChangeListener && player) player.off(stateChangeListener)
}

watch(
  () => props.vid,
  () => loadPlayer()
)

defineExpose({ play, pause, seekTo, getCurrentTime, getVolume, setVolume })
</script>
