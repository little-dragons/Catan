import { v4 as uuidv4 } from 'uuid';
import { User } from './authentication/User';
import { PublicGameState } from './logic/GameState';

export type RoomId = string

export function newRandomRoomId(): RoomId {
    return uuidv4()
}

export type Room = {
    name: string
    id: RoomId
    users: User[]
    owner: User
}


export type GameRoom = Room & {
    state: PublicGameState
}
