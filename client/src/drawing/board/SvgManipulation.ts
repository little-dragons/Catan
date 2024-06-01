import { type PortTile, type ResourceTile, stringColor, Resource, type Board, Color, BuildingType } from "shared"
import * as d3 from "d3"
import { tileHexagon, tileNumberPosition, tileNumberFontSize, tileResourceIconPosition, tileResourceIconSize, roadPosition as roadCorners, interactionPointRadius, tileCenter, robberWidth, robberHeight, crossingPosition, buildingWidth, buildingHeight, tilePortIconSize, tilePortPosition, roadPosition, roadCenter } from "./Layout"
import robber from '@/assets/board/robber.svg'
import type { InteractionPoints } from "./Renderer.vue"

import './Styling.css'

import brick from '@/assets/resources/brick.svg'
import grain from '@/assets/resources/grain.svg'
import lumber from '@/assets/resources/lumber.svg'
import ore from '@/assets/resources/ore.svg'
import wool from '@/assets/resources/wool.svg'
import desert from '@/assets/board/desert.svg'

import brickPort from '@/assets/board/brick-port.svg'
import grainPort from '@/assets/board/grain-port.svg'
import lumberPort from '@/assets/board/lumber-port.svg'
import orePort from '@/assets/board/ore-port.svg'
import woolPort from '@/assets/board/wool-port.svg'
import generalPort from '@/assets/board/general-port.svg'

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


export function renderTiles(svg: SVGElement, board: Board, tileRadius: number) {
    // clean previous group
    d3.select(svg)
      .select('#board')
      .remove()

    const enter =
        d3.select(svg)
          .append('g')
            .attr('id', 'board')
            .classed('tiles', true)
          .selectAll()
            .data(board.tiles)
            .enter()
    
    enter
      .append('path')
        .attr('d', x => d3.line()(tileHexagon(x[1], tileRadius)))
        .attr('fill', x => 
            x[0].type == 'desert' ? 'gold' : 
            x[0].type == 'ocean' || x[0].type == 'port' ? 'royalblue' : 
            x[0].type == 'resource' ? tileColor((x[0] as ResourceTile).resource) : '')
          
    
    enter
      .filter(x => x[0].type == 'port')
      .append('image')
      .attr('x', x => tilePortPosition(x[1], tileRadius)[0])
      .attr('y', x => tilePortPosition(x[1], tileRadius)[1])
      .attr('width', tilePortIconSize(tileRadius)[0])
      .attr('height', tilePortIconSize(tileRadius)[1])
      .attr('href', x => portToIcon(x[0] as PortTile))

    enter
      .filter(x => x[0].type == 'resource')
      .append('image')
        .attr('x', x => tileResourceIconPosition(x[1], tileRadius)[0])
        .attr('y', x => tileResourceIconPosition(x[1], tileRadius)[1])
        .attr('width', tileResourceIconSize(tileRadius)[0])
        .attr('height', tileResourceIconSize(tileRadius)[1])
        .attr('href', x => resourceToIcon((x[0] as ResourceTile).resource))

    enter
      .filter(x => x[0].type == 'resource')
      .append('text')
        .attr('x', x => tileNumberPosition(x[1], (x[0] as ResourceTile).number, tileRadius)![0])
        .attr('y', x => tileNumberPosition(x[1], (x[0] as ResourceTile).number, tileRadius)![1])
        .attr('font-size', x => `${tileNumberFontSize((x[0] as ResourceTile).number, tileRadius)!}px`)
        .text(x => (x[0] as ResourceTile).number.toString())
    
    enter
      .filter(x => x[0].type == 'desert')
      .append('image')
        .attr('x', x => tileResourceIconPosition(x[1], tileRadius)[0])
        .attr('y', x => tileResourceIconPosition(x[1], tileRadius)[1])
        .attr('width', tileResourceIconSize(tileRadius)[0])
        .attr('height', tileResourceIconSize(tileRadius)[1])
        .attr('href', desert)
  
}

export function renderRoads(svg: SVGElement, board: Board, tileRadius: number) {
    d3.select(svg)
      .select('#roads')
      .remove()

    const enter =
        d3.select(svg)
          .append('g')
            .attr('id', 'roads')
            .classed('roads', true)
          .selectAll()
            .data(board.roads)
            .enter()
    
    enter
      .append('path')
        .attr('d', x => d3.line()(roadCorners(x[1], tileRadius)))
        .attr('fill', x => stringColor(x[0]))
    
}

export function renderInteractionPoints<T>(
    svg: SVGElement, 
    board: Board, 
    points: InteractionPoints<T>,
    tileRadius: number) {

    d3.select(svg)
      .select('#interaction')
      .remove()

    if (points.type == 'settlement') {
        d3.select(svg)
        .append('g')
            .attr('id', 'interaction')
            .classed('interaction-points', true)
        .selectAll()
            .data(points.data)
            .enter()
        .append('circle')
            .attr('cx', x => crossingPosition(x[0], tileRadius)[0])
            .attr('cy', x => crossingPosition(x[0], tileRadius)[1])
            .attr('r', interactionPointRadius(tileRadius))
    }
    else if (points.type == 'road') {
        d3.select(svg)
        .append('g')
            .attr('id', 'interaction')
            .classed('interaction-points', true)
        .selectAll()
            .data(points.data)
            .enter()
        .append('circle')
            .attr('cx', x => roadCenter(x[0], tileRadius)[0])
            .attr('cy', x => roadCenter(x[0], tileRadius)[1])
            .attr('r', interactionPointRadius(tileRadius))
    }
    
}

export function renderRobber(
    svg: SVGElement, 
    board: Board, 
    tileRadius: number) {
    
    d3.select(svg)
      .select('#robber')
      .remove()

    const robberCoord = board.robber

    d3.select(svg)
      .append('g')
        .attr('id', 'robber')
        .classed('robber', true)
      .append('image')
        .attr('x', tileCenter(robberCoord, tileRadius)[0] - robberWidth(tileRadius) / 2)
        .attr('y', tileCenter(robberCoord, tileRadius)[1] - robberHeight(tileRadius) / 2)
        .attr('width', robberWidth(tileRadius))
        .attr('height', robberHeight(tileRadius))
        .attr('href', robber)
}

export function renderBuildings(
    svg: SVGElement, 
    board: Board, 
    tileRadius: number
) {
    d3.select(svg)
      .select('#buildings')
      .remove()
    
    const enter =
        d3.select(svg)
        .append('g')
            .attr('id', 'buildings')
            .classed('buildings', true)
        .selectAll()
            .data(board.buildings)
            .enter()


    enter
      .append('image')
        .attr('x', x => crossingPosition(x[1], tileRadius)[0] - buildingWidth(tileRadius) / 2)
        .attr('y', x => crossingPosition(x[1], tileRadius)[1] - buildingHeight(tileRadius) / 2)
        .attr('width', buildingWidth(tileRadius))
        .attr('height', buildingHeight(tileRadius))
        .attr('href', x => buildingForColor(x[0], x[2]))
}

