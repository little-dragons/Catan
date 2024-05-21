import { v4 as uuidv4 } from 'uuid';

export type AuthId = string

export function newRandomAuthId(): AuthId {
    return uuidv4()
}

