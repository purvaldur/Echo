import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js"

createApp(App).mount('#app')

const socket = io("ws://localhost:3001")
