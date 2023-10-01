export const downloadData = async (videoId) => {
  // return response =  request.get(`https://ytdl-server-byvu.onrender.com/${videoId}`)
  return await fetch(`https://ytdl-server-byvu.onrender.com/download/${videoId}`)
  // return await fetch(`http://localhost:5000/download/${videoId}`)
}
