import { Socket as ServerSocket } from "socket.io"
import { Socket as ClientSocket } from "socket.io-client"
import { type ReservedOrUserListener, type EventsMap } from '@socket.io/component-emitter'

// TODO import from https://github.com/socketio/socket.io/blob/master/lib/socket.ts#L46 (RESERVED_EVENTS)
type ReservedNames = "connect" | "connect_error" | "disconnect" | "disconnecting" | "newListener" | "removeListener"
type ReservedMap = {
    [Name in ReservedNames]: any
}
type CleanedInterface<Interface extends EventsMap> = {
    [Name in keyof Interface & (string | symbol)]:
        Interface[Name] extends (...args: any[]) => void ? 
            Name extends ReservedNames ? never :
            Interface[Name] :
        never
}

type LastParam<T extends (...args: any) => void> = Parameters<T> extends [...infer Some, infer Last] ? Last : undefined
type WithoutLastParam<T extends (...args: any) => void> = Parameters<T> extends [...infer Some, infer Last] ? Some : never


type Implementation<Fun extends (...args: any) => void> = 
    LastParam<Fun> extends (args: infer CBType) => void ? 
        ((...args: WithoutLastParam<Fun>) => CBType) | ((...args: WithoutLastParam<Fun>) => Promise<CBType>) :
        Fun


export type SocketImplementation<Interface extends EventsMap> = {
    [Name in keyof CleanedInterface<Interface>]:
        [LastParam<Interface[Name]> extends (args: any) => void ? true : false, Implementation<Interface[Name]>]
}

function reversed<Interface extends EventsMap, Key extends keyof CleanedInterface<Interface>>(implementation: SocketImplementation<Interface>[Key]): ReservedOrUserListener<ReservedMap, Interface, Key> {
    const [requiresCb, fun] = implementation


    // requiresCb creates safety, although typescript cannot pick it up
    // in the true-branch, it is known that the implemntation returns a value and the last arugment of ...args
    // is indeed a callback
    if (requiresCb) {
        return (async (...args: [...WithoutLastParam<Interface[Key]>, LastParam<Interface[Key]>]): Promise<void> => {
            // TODO always awaiting is maybe not intendend in synchronous functions
            // TODO passing one too many
            (args[args.length - 1] as (arg: any) => void)(await fun(...args)) 
        }) as ReservedOrUserListener<ReservedMap, Interface, Key>
    }
    else {
        return fun as ReservedOrUserListener<ReservedMap, Interface, Key>
    }
}


export function registerClientListener<Interface extends EventsMap>(socket: ClientSocket<Interface>, implementation: SocketImplementation<Interface>) {
    for (const key of Object.keys(implementation)) {
        socket.on(key as keyof SocketImplementation<Interface>, reversed<Interface, keyof SocketImplementation<Interface>>(implementation[key as keyof SocketImplementation<Interface>]))
    }
}
export function registerServerListener<Interface extends EventsMap>(socket: ServerSocket<Interface>, implementation: SocketImplementation<Interface>) {
    for (const key of Object.keys(implementation)) {
        socket.on(key as keyof SocketImplementation<Interface>, reversed<Interface, keyof SocketImplementation<Interface>>(implementation[key as keyof SocketImplementation<Interface>]))
    }
}
