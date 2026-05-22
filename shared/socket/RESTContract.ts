import type { Schema } from 'hono/types'
import * as z from 'zod'
import { type User } from '../authentication/User'

type PostRegister = {
    $post: {
        input: { json: {
            username: string
            password: string
        } }
        outputFormat: "json"
    } & ({
        output: z.ZodSafeParseError<{
            username: string
            password: string
        }>
        status: 400
    } | {
        output: {}
        status: 200
    } | {
        output: { message: string, code: 'NAME_INVALID' }
        status: 422
    } | {
        output: { message: string, code : 'NAME_TAKEN' }
        status: 409
    })
}

type PostGuest = {    
    $post: {
        input: {
            json: {
                username: string
            }
        }
        outputFormat: 'json'
    } & ({
        output: z.ZodSafeParseError<{ username: string }>
        status: 400
    } | {
        output: { message: string, code: 'NAME_TAKEN' }
        status: 409
    } | {
        output: { message: string, code: 'NAME_INVALID' }
        status: 422
    } | {
        output: {}
        status: 200
    })
}


export type HonoSchema = {
    '/auth/check': { $post : {
        input: { },
        outputFormat: 'json',
    } & ({
        output: { code: 'ANONYMOUS' }
        status: 200
    } | {
        output: { code: 'SIGNEDIN', user: User }
        status: 200
    })}
    '/auth/logout': { $post: {
        input: { },
        outputFormat: 'json'
        output: { },
        status: 200
    } }
    '/auth/register': PostRegister
    '/auth/login/guest': PostGuest
    '/auth/login/member' : { $post: {
        input: { json: { username: string, password: string } }
        outputFormat: 'json'
    } & ({
        output: z.ZodSafeParseError<{ username: string, password: string }>
        status: 400
    } | {
        output: { message: string, code: 'NAME_INVALID' }
        status: 401
    } | {
        output: { message: string, code : 'PASSWORD_INVALID' }
        status: 401
    } | {
        output: { }
        status: 200
    }) }
}

type OnlySchema<T extends Schema> = T
type SchemaConstraint = OnlySchema<HonoSchema>
