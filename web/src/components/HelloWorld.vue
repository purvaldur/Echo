<script setup>
import { socket } from '../modules/socket.js'

const song = ''
</script>

<template>
  <h1>ECHO</h1>
  <div>
    <input type="text" v-model=song>
    <button type="button" @click="socket.emit('play', song)">PLAY</button>
  </div>
</template>