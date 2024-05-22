export type GuestLoginError = 'name in use' | 'name not allowed'
export type MemberLoginError = 'password invalid'
export type LoginError = 
    'invalid auth object' | 'not implemented'
    | GuestLoginError | MemberLoginError