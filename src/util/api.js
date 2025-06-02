import axios from "axios";

const api = axios.create({
    baseURL: 'https://internal.suivision.xyz',
    timeout: 1000,
    headers: {
        'Content-Type': 'application/json'
    }
})

export default api;