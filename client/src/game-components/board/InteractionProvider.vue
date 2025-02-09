<script setup lang="ts">
import { computed, ref } from 'vue';
import { type InteractionPoints, type AnyUserSelectionResult, type UserSelectionOptions, type UserSelectionResult, type UserSelectionDataType, UserSelectionType } from './UserSelection';
import InteractionPoint from './InteractionPoint.vue';
import { crossingPosition, tileCenter, roadCenter } from './Layout';

const interactionPoints = ref<(InteractionPoints & { resolver: (value: AnyUserSelectionResult) => boolean }) | undefined>(undefined)


defineExpose({ get, abort, running: computed(() => interactionPoints.value != undefined) })
function get<T extends InteractionPoints, Options extends UserSelectionOptions | undefined>(value: T, options?: Options): Promise<UserSelectionResult<T['type'], Options>> {
    return new Promise(resolve => {
        interactionPoints.value = {
            ...value,
            resolver(val) {
                if (options?.noAbort && val == undefined)
                    return false

                resolve(val as UserSelectionResult<T['type'], Options>)
                interactionPoints.value = undefined
                return true
            }
        }
    })
}

function abort(): boolean {
    return interactionPoints.value?.resolver(undefined) ?? false
}

function handleKeyEvent(point: UserSelectionDataType<UserSelectionType>, keyEvent: KeyboardEvent) {
    if (interactionPoints.value == undefined)
        return
    
    if (keyEvent.code == 'Space' || keyEvent.code == 'Enter') {
        interactionPoints.value.resolver(point)
        return
    }

    // TODO pure keyboard navigation with arrows and manually setting focus here
}
function handleClickEvent(point: UserSelectionDataType<UserSelectionType>, mouseEvent: MouseEvent) {
    if (interactionPoints.value == undefined)
        return
    
    interactionPoints.value.resolver(point)
    mouseEvent.stopPropagation()
}
</script>

<template>
    <g id="interaction-points" v-if="interactionPoints != undefined">
        <InteractionPoint 
            v-if="interactionPoints.type == UserSelectionType.Crossing"
            v-for="point in interactionPoints.positions" 
            :position="crossingPosition(point)"
            @click="ev => handleClickEvent(point, ev)"
            @keydown="ev => handleKeyEvent(point, ev)"
        />

        <InteractionPoint 
            v-if="interactionPoints.type == UserSelectionType.Tile"
            v-for="point in interactionPoints.positions" 
            :position="tileCenter(point)"
            @click="ev => handleClickEvent(point, ev)"
            @keydown="ev => handleKeyEvent(point, ev)"
        />
        
        <InteractionPoint 
            v-if="interactionPoints.type == UserSelectionType.Connection"
            v-for="road in interactionPoints.positions" 
            :position="roadCenter(road)"
            @click="ev => handleClickEvent(road, ev)"
            @keydown="ev => handleKeyEvent(road, ev)"
        />
    </g>
</template>
