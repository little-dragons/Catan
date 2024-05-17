export type AuthId = `${string}-${string}-${string}-${string}-${string}`

export function newRandomAuthId(): AuthId {
    return crypto.randomUUID()
}

