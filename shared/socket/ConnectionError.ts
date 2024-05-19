export type GuestConnectionError = 'name in use' | 'name not allowed'
export type MemberConnectionError = 'password invalid'
export type ConnectionError = 
    'invalid auth object' | 'not implemented'
    | GuestConnectionError | MemberConnectionError