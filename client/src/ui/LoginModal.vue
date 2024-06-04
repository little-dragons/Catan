<script setup lang="ts">
import type { GuestLogin, MemberLogin } from 'shared';
import { ref, watch } from 'vue';
import UsernameInput from '@/ui/UsernameInput.vue';
import PasswordInput from '@/ui/PasswordInput.vue';
import Modal from '@/ui/Modal.vue'
import LabeledInput from '@/ui/LabeledInput.vue';
import { currentUser, sendLogin } from '@/socketWrapper/Login';

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
    <Modal @close="$emit('close')">
        <h1>Login</h1>
        <p>Please login with your account or create a temporary guest account.</p>
        <p>Kindly observe that member logins are to be done on the left side while guest logins are done on the right.</p>
        <div class="forms">
            <form class="member-login">
                <LabeledInput label="Member name:" type="space between">
                    <UsernameInput ref="membernameInput"/>
                </LabeledInput>
                
                <LabeledInput label="Password:" type="space between">
                    <PasswordInput ref="passwordInput" v-model="password"/>
                </LabeledInput>

                <input type="button" value="Login" :disabled="membernameInput?.result == null || password == null"></input>
            </form>
            <div class="vertical-line"/>
            <form class="guest-login">
                <LabeledInput label="Guest name:" type="space between">
                    <UsernameInput ref="guestnameInput"/>
                </LabeledInput>
                <input type="button" value="Guest login" @click="triggerGuestLogin" :disabled="guestnameInput?.result == null"></input>
            </form>
        </div>                
    </Modal>
</template>

<style scoped>
@import '../assets/base.css';

p {
    margin-bottom: 0.7rem;
}

:invalid {
    background-color: red;
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


</style>
