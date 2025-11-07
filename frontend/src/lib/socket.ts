import { io, Socket } from 'socket.io-client'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001'
const WS_NAMESPACE = '/weather'

let socket: Socket | null = null
export function getSocket() {
    if (!socket) {
        socket = io(`${API_BASE}${WS_NAMESPACE}`, { transports: ['websocket'] })
    }

    return socket 
}

