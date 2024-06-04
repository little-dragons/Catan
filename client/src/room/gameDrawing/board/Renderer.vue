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

// TODO this is not ideally implemented, but it works. It is supposed to keep the viewbox fitting to the content if
// the leftmost row does not contain elements in uneven rows: because then, all tiles in the first row do not start
// at 0, but rather have an offset into the x-axis.
const viewboxStartX = props.board.tiles.some(x => x[1][0] == 0 && x[1][1] % 2 == 0) ? 0 : tileRadius * Math.cos(30 / 180 * Math.PI)
const viewboxWidth = tileRadius * 2 * (props.board.columnCount + 0.5) * Math.cos(30 / 180 * Math.PI) - viewboxStartX
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
} | {
    type: 'tile'
    data: [Coordinate, Payload][]
    callback: (item: [Coordinate, Payload]) => void
}


const interactionPoints = ref<InteractionPoints<any> | undefined>(undefined)
function interactionPointClickHandler(ev: MouseEvent) {
    if (interactionPoints.value == undefined || boardSvg.value == undefined)
        return
    
    // the idea is to find the coordinate of the click into the svg viewbox
    // however, there may be blank space in the y-dimension (we assume the svg is centered vertically then)
    // this increases the size of the svg element, which is not a problem in itself, but we need
    // to consider it when converting the coordinates
    // we don't need to handle the width case, as the svg always fits in the x-dimension

    // the height of the blank space above (or below) the svg
    let clientYOffset = 0
    // the height of the actual content of the svg, e.g. the space we're interested in
    let actualClientHeight = boardSvg.value.clientHeight

    const clientAspectRatio = boardSvg.value.clientWidth / boardSvg.value.clientHeight
    const viewboxAspectRatio = viewboxWidth / viewboxHeight

    // only if there is vertically empty space, we consider the case
    // the opposite case does not exist because of margin: auto
    if (clientAspectRatio < viewboxAspectRatio) {
        const clientUnnecessary = boardSvg.value.clientHeight - boardSvg.value.clientWidth / viewboxAspectRatio
        clientYOffset = clientUnnecessary / 2
        actualClientHeight = boardSvg.value.clientWidth / viewboxAspectRatio
    }

    const clickedPosition = [
        viewboxWidth / boardSvg.value.clientWidth * ev.offsetX + viewboxStartX,
        viewboxHeight / actualClientHeight * (ev.offsetY - clientYOffset)
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
    else if (interactionPoints.value.type == 'tile') {
        for (const p of interactionPoints.value.data)
            if (distance(clickedPosition, tileCenter(p[0], tileRadius)) < interactionPointRadius(tileRadius))
                interactionPoints.value.callback(p)
    }
}



function setInteractionPoints<T>(points: InteractionPoints<T> | undefined) {
    interactionPoints.value = points
}
defineExpose({ setInteractionPoints })
</script>

<template>
    <svg :viewBox="`${viewboxStartX} 0 ${viewboxWidth} ${viewboxHeight}`" ref="boardSvg" @click="interactionPointClickHandler">
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
            :href="robber"/>
        <g id="buildings">
            <image v-for="building in board.buildings" 
                :x="crossingPosition(building[1], tileRadius)[0] - buildingWidth(tileRadius) / 2"
                :y="crossingPosition(building[1], tileRadius)[1] - buildingHeight(tileRadius) / 2"
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
            <circle v-if="interactionPoints.type == 'tile'" v-for="point in interactionPoints.data" 
                :cx="tileCenter(point[0], tileRadius)[0]"
                :cy="tileCenter(point[0], tileRadius)[1]"
                :r="interactionPointRadius(tileRadius)"/>
        </g>
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

#interaction-points > circle {    
    stroke: black;
    fill: lightgray;
    opacity: .25;
}
</style>