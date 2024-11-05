<script setup lang="ts">
import LabeledInput from '@/inputs/LabeledInput.vue';
import RoomInput from '@/inputs/RoomInput.vue';
import Modal from '@/misc/Modal.vue'
import router from '@/misc/Router';
import { PopupSeverity, usePopups } from '@/popup/Popup';
import { RoomOPResult, useCurrentRoomStore } from '@/socket/CurrentRoomStore';
import { ref } from 'vue';


const emit = defineEmits(['close'])

const roomInput = ref<null | InstanceType<typeof RoomInput>>(null)

const currentRoom = useCurrentRoomStore()
const popups = usePopups()

async function buttonClick() {
    if (roomInput.value?.result == null)
        return

    const res = await currentRoom.tryCreate(roomInput.value.result)
    switch (res) {
        case RoomOPResult.Success:
            emit('close')
            router.push({ name: 'room' })
            return

        case RoomOPResult.NotLoggedIn:
            popups.insert({
                title: 'Not logged in',
                message: 'You have to be logged in to create a room.',
                autoCloses: true,
                severity: PopupSeverity.Info
            })
            return
        case RoomOPResult.ServerRejected:
            popups.insert({
                title: 'Server error',
                message: 'The server has unexpectedly rejected this request. Try reloading the page.',
                autoCloses: false,
                severity: PopupSeverity.Warning
            })
            return
        case RoomOPResult.NameInvalid:
            roomInput.value.nameInUse(roomInput.value.result)
            return
        case RoomOPResult.AlreadyInRoom:
            popups.insert({
                title: 'Already in room',
                message: 'It seems you have already joined a room.',
                autoCloses: true,
                severity: PopupSeverity.Info
            })
            return
    }
}

</script>
<template>
    <Modal @close="() => $emit('close')">
        <h1>Create room</h1>
        <p>Please enter all necessary information below.</p>
        <p>You will be the owner of the room.</p>
        <form>
            <LabeledInput label="Room name:" type="space between">
                <RoomInput ref="roomInput"/>
            </LabeledInput>
            <input type="button" value="Create" @click="buttonClick" :disabled="roomInput?.result == null"/>
        </form>
    </Modal>
</template>

<style scoped>
input {
    margin-top: 1rem;
    width: 100%;
}
</style>