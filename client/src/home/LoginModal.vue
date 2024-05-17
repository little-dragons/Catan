<script setup lang="ts">
import { SocketKey, UserLoginStatusKey } from '@/InjectionKeys';
import type { GuestLogin } from 'shared';
import { inject, ref } from 'vue';

const emit = defineEmits(['close'])

const socket = inject(SocketKey)!
const userLoginStatus = inject(UserLoginStatusKey)!

socket.on('loggedIn', user => {
    userLoginStatus.value = ['logged in', user]
    emit('close')
})
socket.on('connect_error', err => console.log(err))

const guestname = ref("")


function triggerGuestLogin() {
    const trim = guestname.value.trim()
    const login: GuestLogin = {
        type: 'guest',
        name: trim
    }

    socket.auth = login
    socket.connect()
}

</script>


<template>
    <Teleport to="body">
        <div class="all">
            <div class="modal">
                <div class="close">
                    <button @click="() => $emit('close')">&times;</button>
                </div>
                <p>Please login with your account or create a temporary guest account.</p>
                <p>Kindly observe that member logins are to be done on the left side while guest logins are done on the right.</p>
                <div class="content">
                    <form class="member-login">
                        <label for="membername">
                            Membername: 
                            <input type="text" name="membername"/>
                        </label>
                        <label for="password">
                            Password: 
                            <input type="password" name="password"/>
                        </label>

                        <input type="button" value="Login"></input>
                    </form>
                    <div class="vertical-line"/>
                    <form class="guest-login">
                        <label for="guestname">
                            Guestname: 
                            <input type="text" name="guestname" v-model="guestname"/>
                        </label>

                        <input type="button" value="Guest login" @click="triggerGuestLogin"></input>
                    </form>
                </div>
                
            </div>
        </div>
    </Teleport>
</template>

<style scoped>
@import '../assets/base.css';

p {
    margin-bottom: 0.7rem;
}

.all {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: var(--color-background-overlay);
}

.modal {
    width: fit-content;
    max-width: min(80%, 35rem);
    padding: 1rem;
    margin: auto;
    margin-top: 10rem;
    border: var(--modal-border);
    border-radius: 10px;
    background-color: var(--modal-background-color);
}

.close {
    width: fit-content;
    margin-right: 0;
    margin-left: auto;
}
.close > button {    
    border-radius: 50%;
    border-width: 1px;
    width: 1.25rem;
}
.close > button:hover {
    cursor: pointer;
}

.content {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
}

.member-login {
    align-self: flex-end;
}
.vertical-line {
    margin: 0 1rem;
    width: 0;
    border-right: 1px black solid;
}
.guest-login {
    align-self: flex-end;
}

form {
    display: flex;
    flex-direction: column;
}
form > * {
    margin-top: 0.5rem;
}

form > label {
    display: flex;
    justify-content: space-between;
}

input[type=text], input[type=password] {
    width: 7rem;
    margin-left: 2rem;
    height: 1.25rem;
    align-self: flex-end;
}

</style>