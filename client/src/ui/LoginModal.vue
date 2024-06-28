<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import UsernameInput from '@/ui/UsernameInput.vue';
import PasswordInput from '@/ui/PasswordInput.vue';
import Modal from '@/ui/Modal.vue'
import LabeledInput from '@/ui/LabeledInput.vue';
import { currentUser, sendGuestLogin, sendMemberLogin, sendRegister } from '@/socketWrapper/Login';

const emit = defineEmits(['close'])

const showRegister = ref(false)

const passwordInput = ref<null | InstanceType<typeof PasswordInput>>(null)
const guestnameInput = ref<null | InstanceType<typeof UsernameInput>>(null)
const membernameInput = ref<null | InstanceType<typeof UsernameInput>>(null)

watch(currentUser, newVal => {
    if (newVal.status == 'logged in')
        emit('close')

    else if (newVal.status == 'anonymous' && newVal.lastRejectedLogin != undefined) {
        const request = newVal.lastRejectedLogin.request
        const err = newVal.lastRejectedLogin.error

        if (request == 'login data request')
            return alert('Cannot ask for login data info')

        if (err == 'name in use') {
            if (request.type == 'guest')
                guestnameInput.value?.nameInUse(request.name)
            if (request.type == 'member')
                membernameInput.value?.nameInUse(request.name)
        }
        else if (err == 'invalid password')
            passwordInput.value?.invalidPassword(passwordInput.value.result!)
        else if (err == 'name unknown')
            membernameInput.value?.nameUnknown(request.name)
    }
    else if (newVal.status == 'anonymous' && newVal.lastRejectedLogin == undefined) {
        console.warn('User login status changed to anonymous in login modal, but without rejection reason? Triggered logout?')
    }
})

const pending = computed(() => currentUser.value.status == 'pending')
// TODO having two modals is not very nice, but also kind of convenient. Maybe there is a better solution?

// TODO make passwords field marked as password etc. such that browsers autofill
</script>


<template>
    <Modal @close="$emit('close')" v-if="showRegister == false">
        <h1>Login</h1>
        <p>Please login with your account or create a temporary guest account.</p>
        <p>Kindly observe that member logins are to be done on the left side while guest logins are done on the right.</p>
        <div class="forms">
            <form class="member-login">
                <LabeledInput label="Member name:" type="space between">
                    <UsernameInput ref="membernameInput" :disabled="pending"/>
                </LabeledInput>
                
                <LabeledInput label="Password:" type="space between">
                    <PasswordInput ref="passwordInput" :disabled="pending"/>
                </LabeledInput>

                <p class="register">
                    Want to become a member? <span @click="() => { if (!pending) showRegister = true }">Register</span>
                </p>

                <input
                    type="button"
                    value="Login"
                    @click="() => sendMemberLogin(membernameInput?.result!, passwordInput?.result!)"
                    :disabled="membernameInput?.result == null || passwordInput?.result == null"/>
            </form>
            <div class="vertical-line"/>
            <form class="guest-login">
                <LabeledInput label="Guest name:" type="space between">
                    <UsernameInput ref="guestnameInput" :disabled="pending"/>
                </LabeledInput>

                <input
                    type="button" 
                    value="Guest login" 
                    @click="() => sendGuestLogin(guestnameInput?.result!)" 
                    :disabled="pending || guestnameInput?.result == null"/>
            </form>
        </div>
    </Modal>
    <Modal @close="$emit('close')" v-if="showRegister == true">
        <h1>Register</h1>
        <p>Here you may create a member account.</p>
        <form class="member-login">
            <LabeledInput label="Member name:" type="space between">
                <UsernameInput ref="membernameInput" :disabled="pending"/>
            </LabeledInput>
            
            <LabeledInput label="Password:" type="space between">
                <PasswordInput ref="passwordInput" :disabled="pending"/>
            </LabeledInput>

            <p class="register">
                Already have an account? <span @click="() => { if (!pending) showRegister = false }">Login</span>
            </p>

            <input
                type="button"
                value="Register"
                @click="() => sendRegister(membernameInput?.result!, passwordInput?.result!)"
                :disabled="pending || membernameInput?.result == null || passwordInput?.result == null"/>
        </form>
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

.register {
    font-size: 9pt;
    text-align: center;
}

.register > span {
    color: blueviolet;
}
.register > span:hover {
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


</style>
