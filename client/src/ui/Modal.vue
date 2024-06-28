<script setup lang="ts">
defineEmits(['close'])

// TODO better closing button
</script>


<template>
    <div class="all">
        <div class="modal">
            <div class="close">
                <button @click="() => $emit('close')">&times;</button>
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

.close>button {
    border-radius: 50%;
    border-width: 1px;
    width: 1.25rem;
}

.close>button:hover {
    cursor: pointer;
}
</style>