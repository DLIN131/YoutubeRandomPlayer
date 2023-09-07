import { defineStore } from 'pinia'
import { fetchYoutubeData, fetchPlayListName } from '../../api/fetchYoutubeDate'
import { ref } from 'vue'
import { API_KEY } from '../../utils/apiKey'
// user module token and setToken removeToken

export const useYoutubeDataStore = defineStore('data', () => {
  // state
  const snippetData = ref([])
  const listNameData = ref([])
  const latestIndex = ref(0)
  const isLoaded = ref(false)
  // methods
  const getSnippetData = async (id) => {
    const params = ref({
      part: 'contentDetails,snippet,status', // 必填，把需要的資訊列出來
      playlistId: id, // 播放清單的id
      maxResults: 50, // 預設為五筆資料，可以設定1~50
      pageToken: '',
      key: API_KEY
    })
    snippetData.value = []
    isLoaded.value = false
    do {
      // 持續獲取清單的內容
      // 如果nextpagetoken為undefined則不繼續抓取資料
      try {
        const res = await fetchYoutubeData('/playlistItems', params.value)
        // console.log(res.data);
        res.data.items.forEach(item => {
          if (item.snippet.title !== 'Deleted video' &&
                        item.snippet.title !== 'Private video') {
            snippetData.value.push(item.snippet)
          }
        })
        params.value.pageToken = res.data.nextPageToken
      } catch (err) {
        console.log(err)
        return
      }
    } while (params.value.pageToken !== undefined)
    isLoaded.value = true
  }

  const getListName = async (listId) => {
    const params = ref({
      part: 'snippet',
      id: listId,
      key: API_KEY
    })
    try {
      const res = await fetchPlayListName('/playlists', params.value)
      const listIdData = {
        name: res.data.items[0].snippet.title,
        value: listId
      }
      let isExist = false
      listNameData.value.forEach((item) => {
        if (item.value === listIdData.value) {
          isExist = true
        }
      })
      if (!isExist) {
        listNameData.value.push(listIdData)
      }
    } catch (err) {
      console.log(err)
    }
  }

  const getCompleteData = () => {
    return isLoaded.value ? snippetData.value : []
  }

  // return
  return {
    listNameData,
    getListName,
    snippetData,
    getSnippetData,
    latestIndex,
    isLoaded,
    getCompleteData
  }
}, {
  persist: true
})
