<script setup lang="ts">
import { computed, ref } from 'vue';
import UsernameInput from '@/inputs/UsernameInput.vue';
import PasswordInput from '@/inputs/PasswordInput.vue';
import Modal from '@/misc/Modal.vue'
import LabeledInput from '@/inputs/LabeledInput.vue';
import { PopupSeverity, usePopups } from '@/popup/Popup';
import { useCurrentUserStore, UserOPResult, UserStatus } from '@/socket/CurrentUserStore';

const emit = defineEmits(['close'])
const popups = usePopups()
const currentUser = useCurrentUserStore()

const showRegister = ref(false)

const passwordInput = ref<null | InstanceType<typeof PasswordInput>>(null)
const guestnameInput = ref<null | InstanceType<typeof UsernameInput>>(null)
const membernameInput = ref<null | InstanceType<typeof UsernameInput>>(null)


async function memberLogin() {
    if (membernameInput.value?.result == null || passwordInput.value?.result == null)
        return

    const result = await currentUser.tryMemberLogin(membernameInput.value.result, passwordInput.value.result)
    switch (result) {
        case UserOPResult.Success:
            emit('close')
            return
        case UserOPResult.ServerDeniedLoginData:
        case UserOPResult.ServerError:
            popups.insert({
                title: 'Server error',
                message: 'The server responded incorrectly to a login attempt. Cause unclear.',
                autoCloses: false,
                severity: PopupSeverity.Warning
            })
            return
        case UserOPResult.NotAnonymous:
            popups.insert({
                title: 'Already logged in',
                message: 'You cannot login as you are already logged in or attempt tp.',
                autoCloses: true,
                severity: PopupSeverity.Warning
            })
            return
        case UserOPResult.InvalidPassword:
            passwordInput.value.invalidPassword(passwordInput.value.result)
            return
        case UserOPResult.UnknownUsername:
            membernameInput.value.disallowName(membernameInput.value.result)
            return
    }
}

async function guestLogin() {
    if (guestnameInput.value?.result == null)
        return

    const result = await currentUser.tryGuestLogin(guestnameInput.value.result)
    switch (result) {
        case UserOPResult.Success:
            emit('close')
            return

        case UserOPResult.NotAnonymous:
            popups.insert({
                title: 'Already logged in',
                message: 'You cannot login as you are already logged in or attempt to.',
                autoCloses: true,
                severity: PopupSeverity.Warning
            })
            return

        case UserOPResult.ForbiddenUsername:
            guestnameInput.value.disallowName(guestnameInput.value.result)
            return
            
        case UserOPResult.ServerError:
            popups.insert({
                title: 'Server error',
                message: 'The server responded incorrectly to a login attempt. Cause unclear.',
                autoCloses: false,
                severity: PopupSeverity.Warning
            })
            return
    }
}

async function register() {
    if (membernameInput.value?.result == undefined || passwordInput.value?.result == undefined)
        return

    const result = await currentUser.tryRegister(membernameInput.value.result, passwordInput.value.result)
    switch (result) {
        case UserOPResult.Success:
            emit('close')
            return

        case UserOPResult.NotAnonymous:
            popups.insert({
                title: 'Already logged in',
                message: 'You cannot login as you are already logged in or attempt to.',
                autoCloses: true,
                severity: PopupSeverity.Warning
            })
            return

        case UserOPResult.ForbiddenUsername:
            membernameInput.value.disallowName(membernameInput.value.result)
            return
        case UserOPResult.ServerError:
    }
}

const pending = computed(() => currentUser.info.status == UserStatus.Pending)
// TODO having two modals is not very nice, but also kind of convenient. Maybe there is a better solution?
</script>


<template>
    <Modal @close="$emit('close')" v-if="showRegister == false">
        <h1>Login</h1>
        <p>Please login with your account or create a temporary guest account.</p>
        <p>Kindly observe that member logins are to be done on the left side while guest logins are done on the right.</p>
        <div class="forms">
            <form class="member-login">
                <LabeledInput label="Member name:" type="space between">
                    <UsernameInput ref="membernameInput" :disabled="pending" autocomplete="username"/>
                </LabeledInput>
                
                <LabeledInput label="Password:" type="space between">
                    <PasswordInput ref="passwordInput" :disabled="pending" autocomplete="current-password"/>
                </LabeledInput>

                <p class="register">
                    Want to become a member? <span @click="() => { if (!pending) showRegister = true }">Register</span>
                </p>

                <input
                    type="button"
                    value="Login"
                    @click="memberLogin"
                    :disabled="membernameInput?.result == null || passwordInput?.result == null"/>
            </form>
            <div class="vertical-line"/>
            <form class="guest-login">
                <LabeledInput label="Guest name:" type="space between">
                    <UsernameInput ref="guestnameInput" :disabled="pending" autocomplete="username"/>
                </LabeledInput>

                <input
                    type="button" 
                    value="Guest login" 
                    @click="guestLogin" 
                    :disabled="pending || guestnameInput?.result == null"/>
            </form>
        </div>
    </Modal>
    <Modal @close="$emit('close')" v-if="showRegister == true">
        <h1>Register</h1>
        <p>Here you may create a member account.</p>
        <form class="member-login">
            <LabeledInput label="Member name:" type="space between">
                <UsernameInput ref="membernameInput" :disabled="pending" autocomplete="username"/>
            </LabeledInput>
            
            <LabeledInput label="Password:" type="space between">
                <PasswordInput ref="passwordInput" :disabled="pending" autocomplete="new-password"/>
            </LabeledInput>

            <p class="register">
                Already have an account? <span @click="() => { if (!pending) showRegister = false }">Login</span>
            </p>

            <input
                type="button"
                value="Register"
                @click="register"
                :disabled="pending || membernameInput?.result == null || passwordInput?.result == null"/>
        </form>
    </Modal>
</template>

<style scoped>
@import '../assets/base.css';

p {
    margin-bottom: 0.7rem;
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
