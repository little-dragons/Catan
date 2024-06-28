<script setup lang="ts">
import LabeledInput from '@/ui/LabeledInput.vue';
import RoomInput from '@/ui/RoomInput.vue';
import Modal from '@/ui/Modal.vue'
import { ref } from 'vue';
import router from '@/misc/Router';
import { currentAuthUser } from '@/socketWrapper/Login';
import { createRoomAndRedirect } from '@/socketWrapper/Room';


const emit = defineEmits(['close'])

const roomInput = ref<null | InstanceType<typeof RoomInput>>(null)

async function buttonClick() {
    if (roomInput.value?.result == null || currentAuthUser.value == undefined)
        return

    const res = await createRoomAndRedirect(roomInput.value.result)
    if (res == 'room name in use') {
        roomInput.value.nameInUse(roomInput.value.result)
        return
    }
    if (res == 'invalid socket state') {
        // TODO
        alert('Your token is invalid. Try reloading the page.')
        return
    }

    router.push({ name: `room` })
    emit('close')
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