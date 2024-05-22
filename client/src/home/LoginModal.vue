<script setup lang="ts">
import type { GuestLogin, MemberLogin } from 'shared';
import { ref, watch } from 'vue';
import UsernameInput from '@/ui/UsernameInput.vue';
import PasswordInput from '@/ui/PasswordInput.vue';
import { sendLogin, currentUser } from '@/socket/Login';

const emit = defineEmits(['close'])

const password = ref(null as null | string)
const guestnameInput = ref<null | InstanceType<typeof UsernameInput>>(null)
const membernameInput = ref<null | InstanceType<typeof UsernameInput>>(null)
const passwordInput = ref(null as null)

watch(currentUser, newVal => {
    if (newVal.status == 'logged in')
        emit('close')

    else if (newVal.status == 'anonymous' && newVal.lastRejectedLogin != undefined) {
        const request = newVal.lastRejectedLogin.request
        const err = newVal.lastRejectedLogin.error

        if (err == 'invalid auth object' || err == 'not implemented')
            alert('Mistake by developers')
        else if (err == 'name in use') {
            if (request.type == 'guest')
                guestnameInput.value?.nameInUse(request.name)
            if (request.type == 'member')
                membernameInput.value?.nameInUse(request.name)
        }
        else if (err == 'password invalid')
            membernameInput.value
    }
    else if (newVal.status == 'anonymous' && newVal.lastRejectedLogin == undefined) {
        console.warn('User login status changed to anonymous in login modal, but without rejection reason? Triggered logout?')
    }
})

function triggerGuestLogin() {
    if (guestnameInput.value?.result == null)
        return

    const login: GuestLogin = {
        type: 'guest',
        name: guestnameInput.value.result
    }

    sendLogin(login)
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
                <div class="forms">
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

.forms {
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