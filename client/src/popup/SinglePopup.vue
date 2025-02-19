<script setup lang="ts">
import { usePopups, popupLifetime, PopupSeverity, type Popup } from './Popup';
import Close from '@/assets/ui/close.svg'

const props = defineProps<{
    info: Popup
    insertTime: number
}>()

defineEmits(['closed'])

const remaining = props.info.autoCloses ? popupLifetime - (Date.now() - props.insertTime) : undefined
</script>


<template>
    <div class="box">
        <div class="content">
            <span>
                <p>{{ PopupSeverity[info.severity] }}</p>
                <img :src="Close" @click="() => $emit('closed')"/>
            </span>
            <h3>{{ info.title }}</h3>
            <p>{{ info.message }}</p>
        </div>
        <div 
            v-if="remaining != undefined" 
            class="red-bar duration"/>
    </div>
</template>

<style scoped>
.box {
    position: relative;
    background-color: white;
    border-radius: 5px;
    border: 1px solid black;
    margin: 8px;
    width: 200px;
    z-index: 50;
}


.red-bar {
    background-color: red;
    height: 3px;
}
@keyframes dwindling {
    from {
        transform: scaleX(1);
    }
    to {
        transform: scaleX(0);
    }
}
.duration {
    transform-origin: left bottom;
    animation: dwindling calc(v-bind(remaining) / 1000 * 1s) linear 1 forwards;
}

.content {
    padding: 8px;
}
.content > span {
    display: flex;
    justify-content: space-between;
}

.content > span > p {
    margin: 0;
    font-size: x-small;
    font-style: italic;
}

.content > span > img {
    width: 1rem;
    object-fit: contain;
    align-self: flex-start;
}

.content > span > img:hover {
    cursor: pointer;
}


.content > h3 {
    margin: 0;
}
.content > p {
    margin: 0px;
}
</style>