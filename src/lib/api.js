import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:8888/',
    headers: { Authorization: `token ${process.env.NEXT_PUBLIC_JUPYTER_TOKEN}` }
});

export default API;
