<script setup lang="ts">
import { usePopups } from './Popup';
import SinglePopup from './SinglePopup.vue';

const { popups, remove } = usePopups()
</script>

<template>
    <TransitionGroup class="notificationBox" tag="div" name="container">
        <SinglePopup 
            v-for="popup of popups" 
            :info="popup.info"
            :insert-time="popup.insertTime"
            @closed="() => remove(popup.info)"
            :key="`${popup.insertTime}${popup.info.title}`"/>
    </TransitionGroup>
</template>

<style scoped>

.notificationBox {
    position: absolute;
}

.container-move, .container-enter-active, .container-leave-active {
    transition: opacity 0.5s cubic-bezier(1,1,0.99,0.99), transform 0.5s ease;
}
.container-enter-from, .container-leave-to {
  opacity: 0;
  transform: translateY(-70px);
}
.container-leave-active {
  position: absolute;
}

</style>