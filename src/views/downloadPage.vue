<template>
    <div class="w-full">
        <input v-model="inputValue"
            :class="[`w-full m-2 rounded-3xl p-2 pl-4`, { ' fixed top-16 left-36 w-[80%] bg-slate-50/[.9] z-10': isScrollBottom }]"
            type="text" placeholder="Press enter to search..." @keyup.enter="handleSearch">
    </div>
    <div class="grid md:grid-cols-5 max-h-full overflow-y-scroll gap-1 grid-cols-2">
        <div v-for="(item, index) in snippetData" :key="index" :class="[`flex  place-items-start gap-3 h-32 overflow-ellipsis overflow-hidden   p-2 items-center relative
                     bg-black  w-full min-w-[7rem] cursor-pointer border border-white bg-transparent/[.5] shadow-inner shadow-md shadow-white
                       text-white`]">
            <img :src="item.snippet.thumbnails.medium.url" class=" w-28 h-24 rounded-md shadow-2">
            {{ item.snippet.position + " " + item.snippet.title }}
            <span :class="[`flex justify-center items-center absolute w-7 h-7 right-3 bottom-5 rounded-full bg-red-300/[.5] hover:bg-black/[.5] transition-all duration-200 ease-in-out`,
                { 'bg-green-500': isDownloading[index] }]" @click.stop="download(item, index)">
                <el-icon>
                    <Download />
                </el-icon>
            </span>
        </div>
    </div>
</template>

<script setup>
import { useYoutubeDataStore } from '../stores'
import { ref, onMounted } from 'vue'
import { downloadData } from '../api/downloadData'
import {
  Download
} from '@element-plus/icons-vue'

const useYoutubeData = useYoutubeDataStore()
const snippetData = ref([])
const isDownloading = ref([])
const inputValue = ref('')
const isScrollBottom = ref(false)

const handleSearch = () => {
  snippetData.value = useYoutubeData.snippetData.filter((item) => {
    return item.snippet.title.toLowerCase().match(inputValue.value.toLowerCase())
  })
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

onMounted(() => {
  snippetData.value = [...useYoutubeData.snippetData]
})

</script>
