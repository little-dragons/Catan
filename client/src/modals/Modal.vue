<script setup lang="ts">
import { useTemplateRef } from 'vue'
import Close from '@/assets/ui/close.svg'


defineProps<{
    title: string
    id: string
}>()

const dialog = useTemplateRef('dialog')

defineExpose({
    open: () => dialog.value?.showModal(),
    close: () => dialog.value?.close()
})
</script>


<template>
    <dialog :id="id" closedby="closerequest" ref="dialog">
        <div class="header">
            <h1>{{ title }}</h1>
            <button 
                type="button"
                title="Close dialog"
                :commandfor="id"
                command="close"
                autofocus>

                <img :src="Close" alt=""/>
            </button>            
        </div>
        <slot/>
    </dialog>
</template>

<style scoped>
@import '../assets/base.css';

dialog::backdrop {
    background: var(--modal-background-overlay);
    backdrop-filter: blur(4px);
}

dialog {
    max-width: min(80%, 35rem);
    width: fit-content;
    padding: 1rem;
    margin: auto;
    border: var(--modal-border);
    border-radius: 10px;
    background-color: var(--modal-background-color);
}


header {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem 3rem;
}

h1 {
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

img {
    width: 1.25rem;
}

button {
    position: absolute;
    right: 1rem;
    top: 1rem;

    padding: 0;
    border: none;
    background-color: inherit;
}
button:hover {
    cursor: pointer;
}
</style>