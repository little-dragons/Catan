export type GuestLoginError = 'name in use' | 'name not allowed'
export type MemberLoginError = 'password invalid'
export type ConnectionError = 
    'invalid auth object' | 'not implemented'
    | GuestLoginError | MemberLoginError