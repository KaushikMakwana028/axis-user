import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost/kaushik/axis/api',
    headers: {
        'Content-Type': 'application/json'
    },
});

export default axiosInstance;