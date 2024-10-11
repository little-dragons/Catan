<script setup lang="ts">
import { usePopups } from './Popup';
import SinglePopup from './SinglePopup.vue';

const { popups, remove } = usePopups()
</script>

<template>
    <TransitionGroup class="notificationBox" tag="div">
        <SinglePopup 
            v-for="popup of popups" 
            :info="popup.info"
            :insert-time="popup.insertTime"
            @closed="() => remove(popup.info)"
            :key="popup.insertTime"/>
    </TransitionGroup>
</template>

<style scoped>

.notificationBox {
    position: absolute;
}


</style>