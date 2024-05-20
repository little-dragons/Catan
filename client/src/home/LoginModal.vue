<script setup lang="ts">
import { SocketKey, UserLoginStatusKey } from '@/InjectionKeys';
import type { GuestLogin } from 'shared';
import { inject, onMounted, ref, shallowRef, watch, watchEffect } from 'vue';
import UsernameInput from '@/ui/UsernameInput.vue';
import PasswordInput from '@/ui/PasswordInput.vue';

const emit = defineEmits(['close'])

const socket = inject(SocketKey)!
const userLoginStatus = inject(UserLoginStatusKey)!


const password = ref(null as null | string)
const guestnameInput = ref<null | InstanceType<typeof UsernameInput>>(null)
const membernameInput = ref<null | InstanceType<typeof UsernameInput>>(null)
const passwordInput = ref(null as null)

socket.on('loggedIn', user => {
    if (userLoginStatus.value[0] != 'pending') {
        console.log('Received valid login, but no login was pending. Discarding this.')
        return
    }

    userLoginStatus.value = ['logged in', user]
    emit('close')
})

socket.on('rejectLogin', err => {
    if (userLoginStatus.value[0] != 'pending') {
        console.log('Received that login was rejected, but no login was pending.')
        return
    }

    if (err == 'invalid auth object' || err == 'not implemented')
        alert('Mistake by developers')
    else if (err == 'name in use') {
        if (userLoginStatus.value[1].type == 'guest')
            guestnameInput.value?.nameInUse(userLoginStatus.value[1].name)
        if (userLoginStatus.value[1].type == 'member')
            membernameInput.value?.nameInUse(userLoginStatus.value[1].name)
    }
    else if (err == 'password invalid')
        membernameInput.value

    userLoginStatus.value = ['anonymous']
})

function triggerGuestLogin() {
    if (guestnameInput.value?.result == null)
        return

    const login: GuestLogin = {
        type: 'guest',
        name: guestnameInput.value.result
    }

    userLoginStatus.value = ['pending', login]
    socket.emit('login', login)
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
                            <UsernameInput ref="membernameInput" tagId="membername"/>
                        </label>
                        <label for="password">
                            <span>Password:</span>
                            <PasswordInput ref="passwordInput" tagId="password" v-model="password"/>
                        </label>

                        <input type="button" value="Login" :disabled="membernameInput?.result == null || password == null"></input>
                    </form>
                    <div class="vertical-line"/>
                    <form class="guest-login">
                        <label for="guestname">
                            <span>Guest name:</span>
                            <UsernameInput ref="guestnameInput" tagId="guestname"/>
                        </label>
                        <input type="button" value="Guest login" @click="triggerGuestLogin" :disabled="guestnameInput?.result == null"></input>
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

label:deep(:not(span)) {
    max-width: 6rem;
}


</style>