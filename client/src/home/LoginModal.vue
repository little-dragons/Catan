<script setup lang="ts">
import CustomInput from '@/CustomInput.vue';
import { SocketKey, UserLoginStatusKey } from '@/InjectionKeys';
import type { ConnectionError, GuestLogin } from 'shared';
import { inject, ref, watch } from 'vue';

const emit = defineEmits(['close'])

const socket = inject(SocketKey)!
const userLoginStatus = inject(UserLoginStatusKey)!


const guestname = ref(null as null | string)
const password = ref(null as null | string)
const membername = ref(null as null | string)
const error = ref(null as null | string)

socket.on('loggedIn', user => {
    userLoginStatus.value = ['logged in', user]
    emit('close')
})

socket.on('connect_error', err => {
    const custom = err.message as ConnectionError
    if (custom == 'invalid auth object' || custom == 'not implemented')
        error.value = 'Mistake by developers'
    else if (custom == 'name in use')
        error.value = 'The given name is already in use'
    else if (custom == 'password invalid')
        error.value = 'The entered password does not match'
})

function triggerGuestLogin() {
    if (guestname.value == null)
        return

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
                            <span>Member name:</span>
                            <CustomInput id="membername" type="username" label="Membername" :rules="[]" v-model="membername"/>
                        </label>
                        <label for="password">
                            <span>Password:</span>
                            <CustomInput id="password" type="password" label="Password" :rules="[]" v-model="password"/>
                        </label>

                        <input type="button" value="Login" :disabled="membername == null || password == null"></input>
                    </form>
                    <div class="vertical-line"/>
                    <form class="guest-login">
                        <label for="guestname">
                            <span>Guest name:</span>
                            <CustomInput id="guestname" type="username" label="Guestname" :rules="[]" v-model="guestname"/>
                        </label>
                        <input type="button" value="Guest login" @click="triggerGuestLogin" :disabled="guestname == null"></input>
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
    max-width: min(80%, 35rem);
    width: fit-content;
    padding: 1rem;
    margin: auto;
    margin-top: 10rem;
    border: var(--modal-border);
    border-radius: 10px;
    background-color: var(--modal-background-color);
}

:invalid {
    background-color: red;
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
    width: 100%;
}
form > * {
    margin-top: 0.5rem;
}

label {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
}

label > span {
    white-space: nowrap;
}

label >>> :not(span) {
    max-width: 6rem;
}


</style>