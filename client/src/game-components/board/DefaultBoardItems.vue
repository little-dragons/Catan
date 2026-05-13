<script setup lang="ts">
import { cssColor, BuildingType, Color, Resource, type Board, type PortTile, type Tile, TileType, SpecialPorts } from 'catan-shared';
import { tilePath, svgPath, segmentedPortPaths, tileCenter, robberHeight, robberWidth, roadCorners, tileNumberPosition, tileNumberFontSize, crossingPosition, tilePortPosition, tilePortIconSize, tileResourceIconPosition, tileResourceIconSize, settlementSize, citySize } from './Layout';

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

import settlementSvg from '@/assets/buildings/settlement.svg?raw'
import citySvg from '@/assets/buildings/city.svg?raw'

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
function backgroundColor(tile: Tile) {
    switch (tile.type) {
        case TileType.Desert: return 'gold'
        case TileType.Resource: return tileColor(tile.resource)
        case TileType.Ocean: return 'royalblue'
        case TileType.Port: return 'royalblue'
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
        case SpecialPorts.General:
            return generalPort
    }
}

defineProps<{
    board: Board
}>()

</script>
<template>
    <defs v-html="settlementSvg"/>
    <defs v-html="citySvg"/>
    <g id="tiles">
        <g v-for="tile in board.tiles">
            <path
                :d="tilePath(tile.coord)"
                :fill="backgroundColor(tile)" />
            <path
                v-if="tile.type == TileType.Port"
                v-for="path in segmentedPortPaths(tile)"
                :d="svgPath(path)"
                fill="white"/>
            <image v-if="tile.type == TileType.Port" 
                :x="tilePortPosition(tile.coord)[0]"
                :y="tilePortPosition(tile.coord)[1]"
                :width="tilePortIconSize[0]"
                :height="tilePortIconSize[1]"
                :href="portToIcon(tile)"/>
            <image v-if="tile.type == TileType.Resource"
                :x="tileResourceIconPosition(tile.coord)[0]"
                :y="tileResourceIconPosition(tile.coord)[1]"
                :width="tileResourceIconSize[0]"
                :height="tileResourceIconSize[1]"
                :href="resourceToIcon(tile.resource)"/>
            <text v-if="tile.type == TileType.Resource"
                :x="tileNumberPosition(tile.coord, tile.number)[0]"    
                :y="tileNumberPosition(tile.coord, tile.number)[1]"
                :font-size="`${tileNumberFontSize(tile.number)}px`">
                {{ tile.number }}
            </text>
            <image v-if="tile.type == TileType.Desert" 
                :x="tileResourceIconPosition(tile.coord)[0]"
                :y="tileResourceIconPosition(tile.coord)[1]"
                :width="tileResourceIconSize[0]"
                :height="tileResourceIconSize[1]"
                :href="desert"/>
        </g>
    </g>
    <g id="roads">
        <path v-for="road in board.roads"
            :d="svgPath(roadCorners(road.coord))"
            :fill="cssColor(road.color)"
            stroke="black"
            stroke-width="2"
            paint-order="stroke"/>
    </g>
    <image id="robber"
        :x="tileCenter(board.robber)[0] - robberWidth / 2"
        :y="tileCenter(board.robber)[1] - robberHeight / 2"
        :width="robberWidth"
        :height="robberHeight"
        :href="robber"/>
    <g id="buildings">
        <use v-for="building in board.buildings.filter(x => x.type == BuildingType.Settlement)"
            :x="crossingPosition(building.coord)[0] - settlementSize / 2"
            :y="crossingPosition(building.coord)[1] - settlementSize / 2"
            :width="settlementSize"
            :height="settlementSize"
            :color="cssColor(building.color)"
            href="#settlement"
        />
        <use v-for="building in board.buildings.filter(x => x.type == BuildingType.City)"
            :x="crossingPosition(building.coord)[0] - citySize / 2"
            :y="crossingPosition(building.coord)[1] - citySize / 2"
            :width="citySize"
            :height="citySize"
            :color="cssColor(building.color)"
            href="#city"
        />
    </g>
</template>

<style scoped>
#tiles > g >  text {
    text-anchor: middle;
    user-select: none;
    text-shadow: 1px 1px rgba(0, 0, 0, 0.18);
}
</style>