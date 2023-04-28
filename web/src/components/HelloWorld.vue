<script setup>
import { ref } from 'vue'
import { socket } from '../modules/socket.js'

let song = ref('')
function play() {
    socket.emit('play', song.value)
    song.value = ''
}
</script>

<template>
    <h1>ECHO</h1>
    <div>
        <input type="text" @keyup.enter="play()" v-model=song>
        <button type="button" @click="play()">PLAY</button>
    </div>
</template>
