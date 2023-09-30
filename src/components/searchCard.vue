<template >
  <div @click="handleClose" v-if="!isClose"
    class="w-full h-full fixed left-0 top-0 flex items-center justify-center z-20">
    <div @click.stop=""
      class="search-container p-6 flex justify-center flex-col gap-2 w-[90%] h-[80%] min-w-[20rem]  bg-gray-800 rounded-xl z-20">
      <div class="w-full h-8 flex gap-3 justify-between">
        <div class="flex justify-center w-full">
          <input v-model="inputValue" @change="handleInputChange" type="text" class="w-8/12 h-8" placeholder="video name">
        </div>
        <span @click="handleClose"
          class=" w-8 h-8 flex items-center justify-center hover:bg-slate-950  bg-slate-400 rounded-md cursor-pointer">X</span>
      </div>

      <el-scrollbar max-heigh="400">
        <h1 v-if="!result[0]" class="text-white mt-4">no results</h1>
        <div v-for="(item, index) in result" :key="index" @click="loadVideoFromSearchCard(item)" class="flex place-items-start gap-3 h-10 overflow-ellipsis overflow-y-hidden overflow-x-hidden p-2 items-center
                     bg-black  w-full cursor-pointer border border-white
                       text-white">
          <img :src="item.snippet.thumbnails.medium.url" class=" w-8 h-8 rounded-md">
          {{ item.snippet.position + " " + item.snippet.title }}
        </div>
      </el-scrollbar>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
const props = defineProps({
  dataArr: {
    type: Array,
    required: true
  }

})
const emit = defineEmits(['handleClose', 'loadVideo'])
const inputValue = ref('')
const result = ref([])
const isClose = ref(false)

// method
const searchDataResult = computed(() => {
  return props.dataArr.filter((item) => {
    return item.snippet.title.toLowerCase().match(inputValue.value.toLowerCase())
  })
})
const handleInputChange = (e) => {
  result.value = searchDataResult.value
}
const handleClose = () => {
  inputValue.value = ''
  result.value = []
  emit('handleClose', false)
}

const loadVideoFromSearchCard = (item) => {
  const index = props.dataArr.indexOf(item)
  console.log(props.dataArr[index].snippet.title + index)
  emit('loadVideo', item, index)
}
</script>

<style scoped></style>
