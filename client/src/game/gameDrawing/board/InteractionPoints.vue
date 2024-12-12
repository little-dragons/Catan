<script setup lang="ts">
import InteractionPoint from './InteractionPoint.vue';
import { roadCenter, crossingPosition, tileCenter, interactionPointRadius } from './Layout';
import { type AnyUserSelectionResult, type InteractionPoints, type UserSelectionDataType, UserSelectionType } from './UserSelection';

const props = defineProps<{
    interactionPoints: InteractionPoints
    resolver: (value: Exclude<AnyUserSelectionResult, undefined>) => void
    tileRadius: number
}>()
defineEmits<{ clicked: [] }>()

function handleKeyEvent(point: UserSelectionDataType<UserSelectionType>, keyEvent: KeyboardEvent) {
    if (keyEvent.code == 'Space' || keyEvent.code == 'Enter') {
        props.resolver(point)
        return
    }

    // TODO pure keyboard navigation with arrows and manually setting focus here
}
function handleClickEvent(point: UserSelectionDataType<UserSelectionType>, mouseEvent: MouseEvent) {
    props.resolver(point)
    mouseEvent.stopPropagation()
}


</script>

<template>
    <g id="interaction-points">
        <InteractionPoint 
            v-if="interactionPoints.type == UserSelectionType.Crossing"
            v-for="point in interactionPoints.positions" 
            :position="crossingPosition(point, props.tileRadius)"
            :min-radius="interactionPointRadius(props.tileRadius)"
            @click="ev => handleClickEvent(point, ev)"
            @keydown="ev => handleKeyEvent(point, ev)"
        />

        <InteractionPoint 
            v-if="interactionPoints.type == UserSelectionType.Tile"
            v-for="point in interactionPoints.positions" 
            :position="tileCenter(point, props.tileRadius)"
            :min-radius="interactionPointRadius(props.tileRadius)"
            @click="ev => handleClickEvent(point, ev)"
            @keydown="ev => handleKeyEvent(point, ev)"
        />
        
        <InteractionPoint 
            v-if="interactionPoints.type == UserSelectionType.Connection"
            v-for="road in interactionPoints.positions" 
            :position="roadCenter(road, props.tileRadius)"
            :min-radius="interactionPointRadius(props.tileRadius)"
            @click="ev => handleClickEvent(road, ev)"
            @keydown="ev => handleKeyEvent(road, ev)"
        />
    </g>
</template>
