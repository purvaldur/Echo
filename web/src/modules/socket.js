import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js"

export const socket = io(`ws://${process.env.WSS_SERVER}:${process.env.WSS_PORT}`)