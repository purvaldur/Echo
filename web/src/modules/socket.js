import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js"

export const socket = io(`ws://${import.meta.env.WEB_WSS_SERVER}:${import.meta.env.WEB_WSS_PORT}`)
