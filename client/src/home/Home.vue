<script setup lang="ts">
import { isDevelopment } from '@/misc/Globals';
import DebugTools from './DebugTools.vue';


</script>


<template>
    <h1>Home</h1>
    <DebugTools v-if="isDevelopment"/>
</template>