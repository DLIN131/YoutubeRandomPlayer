import axios from 'axios'

export const googleLogin = (token) => {
    return axios.post('http://localhost:5000/google-login', {
        access_token: token
    }, {
        headers: {
            'Content-Type': 'application/json'
        }
    })
}
