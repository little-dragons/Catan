import { v4 as uuidv4 } from 'uuid';

export type AuthToken = string

export function newRandomAuthToken(): AuthToken {
    return uuidv4()
}

