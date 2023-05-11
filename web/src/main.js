import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { socket } from "./modules/socket.js"

socket.on('connect', () => {
    console.log("Connected to Socket.IO server")
    socket.emit('ping', 'hello')
})

createApp(App).mount('#app')

console.log(discordUser)