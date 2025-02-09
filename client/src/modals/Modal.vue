<script setup lang="ts">
import Close from '@/assets/ui/close.svg'
import { useModalStore } from './ModalStore';


const modalStore = useModalStore()
</script>


<template>
    <div class="all">
        <div class="modal">
            <div class="close">
                <img :src="Close" @click="() => modalStore.value = undefined"/>
            </div>
            <slot/>
        </div>
    </div>
</template>

<style scoped>
@import '../assets/base.css';

.all {
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: var(--modal-background-overlay);
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

.modal:deep(h1) {
    font-weight: 500;
    width: 100%;
    margin: 0;
    text-align: center;
    font-size: x-large;
}


.close {
    width: fit-content;
    margin-right: 0;
    margin-left: auto;
}

.close>img {
    width: 1.25rem;
}

.close>img:hover {
    cursor: pointer;
}
</style>