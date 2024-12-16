<script setup lang="ts">
import { ref } from 'vue';
import { cssColor, BuildingType, Color, Resource, type Board, type PortTile, type Tile, portPoints } from 'shared';
import { tileHexagon, segmentedPortPaths, buildingWidth, buildingHeight, tileCenter, robberHeight, robberWidth, roadCorners, tileNumberPosition, tileNumberFontSize, crossingPosition, tilePortPosition, tilePortIconSize, tileResourceIconPosition, tileResourceIconSize, triangularPortPaths } from './Layout';
import { type AnyUserSelectionResult, type InteractionPoints, type UserSelectionOptions, type UserSelectionResult } from './UserSelection';
import InteractionPointsRenderer from './InteractionPoints.vue';

import robber from '@/assets/board/robber.svg'

import brickPort from '@/assets/board/brick-port.svg'
import grainPort from '@/assets/board/grain-port.svg'
import lumberPort from '@/assets/board/lumber-port.svg'
import orePort from '@/assets/board/ore-port.svg'
import woolPort from '@/assets/board/wool-port.svg'
import generalPort from '@/assets/board/general-port.svg'

import brick from '@/assets/resources/brick.svg'
import grain from '@/assets/resources/grain.svg'
import lumber from '@/assets/resources/lumber.svg'
import ore from '@/assets/resources/ore.svg'
import wool from '@/assets/resources/wool.svg'
import desert from '@/assets/board/desert.svg'

import blueCity from '@/assets/buildings/blue-city.svg'
import blueSettlement from '@/assets/buildings/blue-settlement.svg'
import greenCity from '@/assets/buildings/green-city.svg'
import greenSettlement from '@/assets/buildings/green-settlement.svg'
import orangeCity from '@/assets/buildings/orange-city.svg'
import orangeSettlement from '@/assets/buildings/orange-settlement.svg'
import redCity from '@/assets/buildings/red-city.svg'
import redSettlement from '@/assets/buildings/red-settlement.svg'
import yellowCity from '@/assets/buildings/yellow-city.svg'
import yellowSettlement from '@/assets/buildings/yellow-settlement.svg'

function resourceToIcon(resource: Resource): string {
    switch (resource) {
        case Resource.Brick:
            return brick
        case Resource.Grain:
            return grain
        case Resource.Lumber:
            return lumber
        case Resource.Ore:
            return ore
        case Resource.Wool:
            return wool
    }
}
function tileColor(resource: Resource): string {
    switch (resource) {
        case Resource.Brick:
            return 'maroon'
        case Resource.Grain:
            return 'gold'
        case Resource.Lumber:
            return 'darkgreen'
        case Resource.Ore:
            return 'dimgray'
        case Resource.Wool:
            return 'yellowgreen'
    }
}
function backgroundColor(tile: Tile): string {
    switch (tile.type) {
        case 'desert': return 'gold'
        case 'resource': return tileColor(tile.resource)
        case 'ocean': return 'royalblue'
        case 'port': return 'royalblue'
    }
}
function portToIcon(port: PortTile): string {
    switch (port.resource) {
        case Resource.Brick:
            return brickPort
        case Resource.Grain:
            return grainPort
        case Resource.Lumber:
            return lumberPort
        case Resource.Ore:
            return orePort
        case Resource.Wool:
            return woolPort
        case 'general':
            return generalPort
    }
}
function buildingForColor(color: Color, type: BuildingType): string {
    switch (type) {
        case BuildingType.City:
            switch (color) {
                case Color.Yellow: return yellowCity
                case Color.Orange: return orangeCity
                case Color.Red: return redCity
                case Color.Green: return greenCity
                case Color.Blue: return blueCity
            }
        
        case BuildingType.Settlement:
            switch (color) {
                case Color.Yellow: return yellowSettlement
                case Color.Orange: return orangeSettlement
                case Color.Red: return redSettlement
                case Color.Green: return greenSettlement
                case Color.Blue: return blueSettlement
            }
    }
}

function svgPath(pixels: [number, number][]): string {
    let res = `M ${pixels[0][0]} ${pixels[0][1]}`
    for (let corner = 1; corner < pixels.length; corner++)
        res += `L ${pixels[corner][0]} ${pixels[corner][1]}`

    return res + ' Z'
}

const props = defineProps<{ 
    board: Board
}>()
const tileRadius = 100

// TODO this is not ideally implemented, but it works. It is supposed to keep the viewbox fitting to the content if
// the leftmost row does not contain elements in uneven rows: because then, all tiles in the first row do not start
// at 0, but rather have an offset into the x-axis.
const viewboxStartX = props.board.tiles.some(x => x.coord[0] == 0 && x.coord[1] % 2 == 0) ? 0 : tileRadius * Math.cos(30 / 180 * Math.PI)
const viewboxWidth = tileRadius * 2 * (props.board.columnCount + 0.5) * Math.cos(30 / 180 * Math.PI) - viewboxStartX
const viewboxHeight = tileRadius * (props.board.rowCount * 1.5 + 0.5)

const boardSvg = ref<null | SVGElement>(null)

const interactionPoints = ref<(InteractionPoints & { resolver: (value: AnyUserSelectionResult) => boolean }) | undefined>(undefined)


defineExpose({ getUserSelection })
function getUserSelection<T extends InteractionPoints, Options extends UserSelectionOptions | undefined>(value: T, options?: Options): Promise<UserSelectionResult<T['type'], Options>> {
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
</script>

<template>
    <svg :viewBox="`${viewboxStartX} 0 ${viewboxWidth} ${viewboxHeight}`" ref="boardSvg" @click="() => interactionPoints?.resolver(undefined)">
        <g id="tiles">
            <g v-for="tile in board.tiles">
                <path
                    :d="svgPath(tileHexagon(tile.coord, tileRadius))"
                    :fill="backgroundColor(tile)" />
                <path
                    v-if="tile.type == 'port'"
                    v-for="path in segmentedPortPaths(tile, tileRadius)"
                    :d="svgPath(path)"
                    fill="white"/>
                <image v-if="tile.type == 'port'" 
                    :x="tilePortPosition(tile.coord, tileRadius)[0]"
                    :y="tilePortPosition(tile.coord, tileRadius)[1]"
                    :width="tilePortIconSize(tileRadius)[0]"
                    :height="tilePortIconSize(tileRadius)[1]"
                    :href="portToIcon(tile)"/>
                <image v-if="tile.type == 'resource'"
                    :x="tileResourceIconPosition(tile.coord, tileRadius)[0]"
                    :y="tileResourceIconPosition(tile.coord, tileRadius)[1]"
                    :width="tileResourceIconSize(tileRadius)[0]"
                    :height="tileResourceIconSize(tileRadius)[1]"
                    :href="resourceToIcon(tile.resource)"/>
                <text v-if="tile.type == 'resource'"
                    :x="tileNumberPosition(tile.coord, tile.number, tileRadius)![0]"    
                    :y="tileNumberPosition(tile.coord, tile.number, tileRadius)![1]"
                    :font-size="`${tileNumberFontSize(tile.number, tileRadius)!}px`">
                    {{ tile.number }}
                </text>
                <image v-if="tile.type == 'desert'" 
                    :x="tileResourceIconPosition(tile.coord, tileRadius)[0]"
                    :y="tileResourceIconPosition(tile.coord, tileRadius)[1]"
                    :width="tileResourceIconSize(tileRadius)[0]"
                    :height="tileResourceIconSize(tileRadius)[1]"
                    :href="desert"/>
            </g>
        </g>
        <g id="roads">
            <path v-for="road in board.roads"
                :d="svgPath(roadCorners(road.coord, tileRadius))"
                :fill="cssColor(road.color)"/>
        </g>
        <image id="robber"
            :x="tileCenter(board.robber, tileRadius)[0] - robberWidth(tileRadius) / 2"
            :y="tileCenter(board.robber, tileRadius)[1] - robberHeight(tileRadius) / 2"
            :width="robberWidth(tileRadius)"
            :height="robberHeight(tileRadius)"
            :href="robber"/>
        <g id="buildings">
            <image v-for="building in board.buildings" 
                :x="crossingPosition(building.coord, tileRadius)[0] - buildingWidth(tileRadius) / 2"
                :y="crossingPosition(building.coord, tileRadius)[1] - buildingHeight(tileRadius) / 2"
                :width="buildingWidth(tileRadius)"
                :height="buildingHeight(tileRadius)"
                :href="buildingForColor(building.color, building.type)"/>
        </g>
        <InteractionPointsRenderer
            v-if="interactionPoints != undefined"
            :interactionPoints="interactionPoints"
            :tileRadius="tileRadius"
            :resolver="interactionPoints.resolver"/>
    </svg>
</template>



<style scoped>
svg {
    /* 
        Change this only when checking the interaction. 
        Also consider that the svg has to be centered vertically
        when there is empty space in the y-axis. 
    */
    max-height: 100%;
    max-width: 100%;
    margin: auto;
}
#tiles > g >  text {
    text-anchor: middle;
    user-select: none;
    text-shadow: 1px 1px rgba(0, 0, 0, 0.18);
}

</style>
