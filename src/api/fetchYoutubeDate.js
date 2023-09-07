import request from "../utils/request";

export const fetchYoutubeData = (url,params) => {
    return request.get(url,{params})
} 

export const fetchPlayListName =  (url,params) => {
    return request.get(url,{params})
}



