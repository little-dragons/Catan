
import type { Schema } from 'hono/types'
import * as z from 'zod'


type PostRegister = {
    $post: {
        input: {
            json: {
                username: string
                password: string
            }
        }
    } & ({
        output: z.ZodSafeParseError<{
            username: string
            password: string
        }>
        outputFormat: "json"
        status: 400
    } | {        
        output: {
            success: true
            name: string
        }
        outputFormat: "json"
        status: 200
    })
}

export type HonoSchema = { "/auth/register": PostRegister }

type OnlySchema<T extends Schema> = T
type SchemaConstraint = OnlySchema<HonoSchema>