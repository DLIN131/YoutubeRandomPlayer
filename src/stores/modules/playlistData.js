import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useUserStore } from './user'
import { updatePlaylistData, postPlaylistData, fetchPlaylistData, fetchPlaylistNames } from '../../api/dealPlaylist'

export const usePlaylistStore = defineStore('playlist', () => {
  // variable
  const userStore = useUserStore()
  const playlist = ref([])
  const listnames = ref([])
  // methods
  const postPlaylist = async (name, list, length) => {
    if (!userStore.userInfo.userId) {
      console.log('not have userId')
      return false
    }
    const params = {
      userId: userStore.userInfo.userId,
      username: userStore.userInfo.name,
      listname: name,
      playlist: list,
      dataLength: length
    }
    return await postPlaylistData(params)
  }

  const updatePlaylist = async (name, list) => {
    const params = {
      listname: name,
      playlist: list
    }
    const uid = userStore.userId
    return await updatePlaylistData(uid, params)
  }

  const fetchPlaylist = async (name) => {
    const params = {
      userId: userStore.userInfo.userId,
      listname: name
    }
    try {
      const res = await fetchPlaylistData(params)
      playlist.value = res.data.data.playlist
    } catch (error) {
      console.log('fetch playlist from server err' + error)
    }
  }

  const fetchNames = async () => {
    const params = {
      userId: userStore.userInfo.userId
    }
    try {
      const res = await fetchPlaylistNames(params)
      listnames.value = res.data.listnames
    } catch (error) {
      console.log('fetch listnames from server failed')
    }
  }
  return {
    playlist,
    listnames,
    postPlaylist,
    updatePlaylist,
    fetchPlaylist,
    fetchNames
  }
})
