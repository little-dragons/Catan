<script setup lang="ts">
import { ref } from 'vue';
import { stringColor, BuildingType, Color, Resource, type Board, type Coordinate, type PortTile, type Road, type Tile } from 'shared';
import { distance } from '../Vector';
import { tileHexagon, buildingWidth, buildingHeight, tileCenter, robberHeight, robberWidth, roadCorners, tileNumberPosition, tileNumberFontSize, crossingPosition, interactionPointRadius, roadCenter, tilePortPosition, tilePortIconSize, tileResourceIconPosition, tileResourceIconSize } from './Layout';

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
    if (tile.type == 'desert')
        return 'gold'
    if (tile.type == 'ocean' || tile.type == 'port')
        return 'royalblue'
    if (tile.type == 'resource')
        return tileColor(tile.resource)
    else
        return ''
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
    if (type == BuildingType.City) {
        switch (color) {
            case Color.Yellow: return yellowCity
            case Color.Orange: return orangeCity
            case Color.Red: return redCity
            case Color.Green: return greenCity
            case Color.Blue: return blueCity
        }
    }
    else if (type == BuildingType.Settlement) {
        switch (color) {
            case Color.Yellow: return yellowSettlement
            case Color.Orange: return orangeSettlement
            case Color.Red: return redSettlement
            case Color.Green: return greenSettlement
            case Color.Blue: return blueSettlement
        }
    }
    console.warn(`Unknown combination of building and color: ${color}, ${type}`)
    return ''
}
function svgPath(pixels: [number, number][]): string {
    let res = `M ${pixels[0][0]} ${pixels[0][1]}`
    for (let corner = 1; corner < pixels.length; corner++)
        res += `L ${pixels[corner][0]} ${pixels[corner][1]}`

    return res + ' Z'
}

const props = defineProps<{ board: Board }>()
const tileRadius = 100
const viewboxWidth = tileRadius * 2 * (props.board.columnCount + 0.5) * Math.cos(30 / 180 * Math.PI)
const viewboxHeight = tileRadius * (props.board.rowCount * 1.5 + 0.5)

const boardSvg = ref<null | SVGElement>(null)


export type InteractionPoints<Payload> = {
    type: 'settlement'
    data: [Coordinate, Payload][]
    callback: (item: [Coordinate, Payload]) => void
} | {
    type: 'road'
    data: [Road, Payload][]
    callback: (item: [Road, Payload]) => void
}


const interactionPoints = ref<InteractionPoints<any> | undefined>(undefined)
function interactionPointClickHandler(ev: MouseEvent) {
    if (interactionPoints.value == undefined)
        return
    
    // this is because of the viewbox property of the svg
    // only works if the svg element has the same aspect ratio as the viewbox
    const clickedPosition = [
        viewboxWidth / boardSvg.value!.clientWidth * ev.offsetX,
        viewboxHeight / boardSvg.value!.clientHeight * ev.offsetY
    ] as [number, number]

    if (interactionPoints.value.type == 'settlement') {
        for (const p of interactionPoints.value.data)
            if (distance(clickedPosition, crossingPosition(p[0], tileRadius)) < interactionPointRadius(tileRadius))
                interactionPoints.value.callback(p)
    }
    else if (interactionPoints.value.type == 'road') {
        for (const p of interactionPoints.value.data)
            if (distance(clickedPosition, roadCenter(p[0], tileRadius)) < interactionPointRadius(tileRadius))
                interactionPoints.value.callback(p)
    }
}

function setInteractionPoints<T>(points: InteractionPoints<T> | undefined) {
    interactionPoints.value = points
}

defineExpose({ setInteractionPoints })
</script>

<template>
    <svg :viewBox="`0 0 ${viewboxWidth} ${viewboxHeight}`" ref="boardSvg" @click="interactionPointClickHandler">
        <g id="tiles">
            <g v-for="tile in board.tiles">
                <path
                    :d="svgPath(tileHexagon(tile[1], tileRadius))"
                    :fill="backgroundColor(tile[0])" />
                <image v-if="tile[0].type == 'port'" 
                    :x="tilePortPosition(tile[1], tileRadius)[0]"
                    :y="tilePortPosition(tile[1], tileRadius)[1]"
                    :width="tilePortIconSize(tileRadius)[0]"
                    :height="tilePortIconSize(tileRadius)[1]"
                    :href="portToIcon(tile[0])"/>
                <image v-if="tile[0].type == 'resource'"
                    :x="tileResourceIconPosition(tile[1], tileRadius)[0]"
                    :y="tileResourceIconPosition(tile[1], tileRadius)[1]"
                    :width="tileResourceIconSize(tileRadius)[0]"
                    :height="tileResourceIconSize(tileRadius)[1]"
                    :href="resourceToIcon(tile[0].resource)"/>
                <text v-if="tile[0].type == 'resource'"
                    :x="tileNumberPosition(tile[1], tile[0].number, tileRadius)![0]"    
                    :y="tileNumberPosition(tile[1], tile[0].number, tileRadius)![1]"
                    :font-size="`${tileNumberFontSize(tile[0].number, tileRadius)!}px`">
                    {{ tile[0].number }}
                </text>
                <image v-if="tile[0].type == 'desert'" 
                    :x="tileResourceIconPosition(tile[1], tileRadius)[0]"
                    :y="tileResourceIconPosition(tile[1], tileRadius)[1]"
                    :width="tileResourceIconSize(tileRadius)[0]"
                    :height="tileResourceIconSize(tileRadius)[1]"
                    :href="desert"/>
            </g>
        </g>
        <g id="roads">
            <path v-for="road in board.roads"
                :d="svgPath(roadCorners(road[1], tileRadius))"
                :fill="stringColor(road[0])"/>
        </g>
        <image id="robber"
            :x="tileCenter(board.robber, tileRadius)[0] - robberWidth(tileRadius) / 2"
            :y="tileCenter(board.robber, tileRadius)[1] - robberHeight(tileRadius) / 2"
            :width="robberWidth(tileRadius)"
            :height="robberHeight(tileRadius)"
            :href="robber"
        />
        <g id="buildings">
            <image v-for="building in board.buildings" 
                :x="crossingPosition(building[1], tileRadius)[0] - buildingWidth(tileRadius) / 2"
                :y="crossingPosition(building[1], tileRadius)[1] - buildingWidth(tileRadius) / 2"
                :width="buildingWidth(tileRadius)"
                :height="buildingHeight(tileRadius)"
                :href="buildingForColor(building[0], building[2])"/>
        </g>
        <g id="interaction-points" v-if="interactionPoints != undefined">
            <circle v-if="interactionPoints.type == 'settlement'" v-for="point in interactionPoints.data" 
                :cx="crossingPosition(point[0], tileRadius)[0]"
                :cy="crossingPosition(point[0], tileRadius)[1]"
                :r="interactionPointRadius(tileRadius)"/>
            <circle v-if="interactionPoints.type == 'road'" v-for="point in interactionPoints.data" 
                :cx="roadCenter(point[0], tileRadius)[0]"
                :cy="roadCenter(point[0], tileRadius)[1]"
                :r="interactionPointRadius(tileRadius)"/>
        </g>
    </svg>
</template>



<style scoped>
#tiles > g >  text {
    text-anchor: middle;
    user-select: none;
}

#interaction-points > circle {    
    stroke: black;
    fill: lightgray;
    opacity: .25;
}
</style>