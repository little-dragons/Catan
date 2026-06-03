import { SocketPort } from 'catan-shared'

export const isDevelopment = process.env.NODE_ENV === 'development'
export const isProduction = process.env.NODE_ENV === 'production'

if (!isDevelopment && !isProduction)
    console.error(`INVALID NODE_ENV VALUE: ${process.env.NODE_ENV}`)


export const serverAddress: string = 
    isDevelopment ? `http://localhost:${SocketPort}`
                  : `https://ichigancs.com:${SocketPort}`


export const loginModalID = 'login-modal-id'
export const createRoomModalID = 'create-room-modal-id'
