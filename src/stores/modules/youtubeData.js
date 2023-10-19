import { defineStore } from 'pinia'
import { fetchYoutubeData, fetchPlayListName, deleteListItem } from '../../api/fetchYoutubeData'
import { ref } from 'vue'
import { API_KEY } from '../../utils/apiKey'
// user module token and setToken removeToken

export const useYoutubeDataStore = defineStore('data', () => {
  // state
  const snippetData = ref([])
  const listNameData = ref([])
  const latestIndex = ref(0)
  const isLoaded = ref(true)
  const currentListName = ref('')

  // methods
  const getSnippetData = async (id) => {
    const params = ref({
      part: 'contentDetails,id,snippet,status', // 必填，把需要的資訊列出來
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
            const filterData = {
              id: item.id,
              snippet: {
                position: item.snippet.position,
                resourceId: {
                  videoId: item.snippet.resourceId.videoId
                },
                thumbnails: {
                  medium: {
                    url: item.snippet.thumbnails.medium.url
                  }
                },
                title: item.snippet.title
              }
            }
            snippetData.value.push(filterData)
          }
        })
        params.value.pageToken = res.data.nextPageToken
      } catch (err) {
        console.log(err)
        alert('抓取清單發生錯誤')
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
      currentListName.value = listIdData.name // 儲存最近的一次清單名字資料
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

  const deleteItem = async (id) => {
    try {
      const res = await deleteListItem('/playlistItems', id)
      console.log(res)
      if (res) {
        snippetData.value.splice(snippetData.value.indexOf(id), 1)
      }
    } catch (error) {
      console.log('delete item error')
    }
  }
  // return
  return {
    currentListName,
    listNameData,
    getListName,
    snippetData,
    getSnippetData,
    latestIndex,
    isLoaded,
    getCompleteData,
    deleteItem
  }
}, {
  persist: true
})
