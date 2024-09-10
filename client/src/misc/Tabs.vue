<script lang="ts">
export const activeTabInjectKey = Symbol() as InjectionKey<Ref<string | undefined>>
</script>


<script setup lang="ts">
import { ref, type InjectionKey, provide, type Ref } from 'vue';

// TODO this seems weird and only seems to help with type checking in this file.
// of course, we actually want to correct type checking also for using the Tabs object
const slots = defineSlots<{
    default(): [{ props: { title: string } }]
}>()

const tabTitles: string[] = slots.default().map(x => x.props.title)

const activeTabTitle = ref<string | undefined>(tabTitles.length > 0 ? tabTitles[0] : undefined)
provide(activeTabInjectKey, activeTabTitle)

function tabClicked(tabTitle: string) {
    activeTabTitle.value = tabTitle
}
</script>


<template>
    <ul>
        <li v-for="child of tabTitles" @click="tabClicked(child)" :class="{ 'active': child == activeTabTitle }">{{ child }}</li>
    </ul>
    <div>
        <slot/>
    </div>
</template>


<style scoped>
@import '../assets/base.css';

.active {
    text-decoration: underline;
}

ul {
    margin: 0;
    padding: 0;
    height: fit-content;
}

li {
    display: inline-block;
    padding: 3px 5px;
    border: var(--mute-border);
    border-radius: 5px 5px 0 0;
    border-bottom: none;
    margin-right: 1px;

    font-style: italic;
}

div {
    border: var(--mute-border);
    border-radius: 0 5px 5px 5px;
}

li:hover {
    cursor: pointer;
    background-color: var(--border-background-color-hovered);
}
li:active {
    cursor: pointer;
    background-color: var(--border-background-color-clicked);
}
</style>