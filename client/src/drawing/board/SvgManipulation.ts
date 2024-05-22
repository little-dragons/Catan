import { type PortTile, type ResourceTile, stringColor, Resource } from "shared"
import * as d3 from "d3"
import { tileHexagon, tileNumberPosition, tileNumberFontSize, tileResourceIconPosition, tileResourceIconSize, roadPosition as roadCorners, interactionPointRadius, tileCenter, robberWidth, robberHeight, crossingPosition, buildingWidth, buildingHeight, tilePortIconSize, tilePortPosition } from "./Layout"
import robber from '@/assets/board/robber.svg'
import building from '@/assets/board/house.svg'
import type { BoardRenderInfo, InteractionPoint } from "./Renderer.vue"
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
    case 'General':
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


export function renderTiles(html: HTMLElement & SVGElement, info: BoardRenderInfo) {
    // clean previous group
    d3.select(html)
      .select('#board')
      .remove()

    const enter =
        d3.select(html)
          .append('g')
            .attr('id', 'board')
            .classed('tiles', true)
          .selectAll()
            .data(info.board.tiles)
            .enter()
    
    enter
      .append('path')
        .attr('d', x => d3.line()(tileHexagon(x[1], info.tileRadius)))
        .attr('fill', x => 
            x[0] == 'Desert' ? 'gold' : 
            (x[0] == 'Ocean' || (x[0] as PortTile).orientation != undefined ? 'royalblue' : 
            (x[0] as ResourceTile).resource != undefined ? tileColor((x[0] as ResourceTile).resource) : ''
          ))
    
    enter
      .filter(x => (x[0] as PortTile).orientation != undefined)
      .append('image')
      .attr('x', x => tilePortPosition(x[1], info.tileRadius)[0])
      .attr('y', x => tilePortPosition(x[1], info.tileRadius)[1])
      .attr('width', tilePortIconSize(info.tileRadius)[0])
      .attr('height', tilePortIconSize(info.tileRadius)[1])
      .attr('href', x => portToIcon(x[0] as PortTile))

    enter
      .filter(x => (x[0] as ResourceTile).number != undefined)
      .append('image')
        .attr('x', x => tileResourceIconPosition(x[1], info.tileRadius)[0])
        .attr('y', x => tileResourceIconPosition(x[1], info.tileRadius)[1])
        .attr('width', tileResourceIconSize(info.tileRadius)[0])
        .attr('height', tileResourceIconSize(info.tileRadius)[1])
        .attr('href', x => resourceToIcon((x[0] as ResourceTile).resource))

    enter
      .filter(x => (x[0] as ResourceTile).number != undefined)
      .append('text')
        .attr('x', x => tileNumberPosition(x[1], (x[0] as ResourceTile).number, info.tileRadius)![0])
        .attr('y', x => tileNumberPosition(x[1], (x[0] as ResourceTile).number, info.tileRadius)![1])
        .attr('font-size', x => `${tileNumberFontSize((x[0] as ResourceTile).number, info.tileRadius)!}px`)
        .text(x => (x[0] as ResourceTile).number.toString())
    
    enter
      .filter(x => x[0] == 'Desert')
      .append('image')
        .attr('x', x => tileResourceIconPosition(x[1], info.tileRadius)[0])
        .attr('y', x => tileResourceIconPosition(x[1], info.tileRadius)[1])
        .attr('width', tileResourceIconSize(info.tileRadius)[0])
        .attr('height', tileResourceIconSize(info.tileRadius)[1])
        .attr('href', desert)
  
}


export function renderRoads(html: HTMLElement & SVGElement, info: BoardRenderInfo) {
    d3.select(html)
      .select('#roads')
      .remove()

    const enter =
        d3.select(html)
          .append('g')
            .attr('id', 'roads')
            .classed('roads', true)
          .selectAll()
            .data(info.board.roads)
            .enter()
    
    enter
      .append('path')
        .attr('d', x => d3.line()(roadCorners(x[1], x[2], info.tileRadius)))
        .attr('fill', x => stringColor(x[0]))
    
}


export function renderInteractionPoints<T>(
    html: HTMLElement & SVGElement, 
    info: BoardRenderInfo, 
    interactionPoints: InteractionPoint<T>[]) {

    d3.select(html)
      .select('#interaction')
      .remove()

    const enter =
        d3.select(html)
          .append('g')
            .attr('id', 'interaction')
            .classed('interaction-points', true)
          .selectAll()
            .data(interactionPoints)
            .enter()
    
    enter
      .append('circle')
        .attr('cx', x => x[0][0])
        .attr('cy', x => x[0][1])
        .attr('r', interactionPointRadius(info.tileRadius))
    
}

export function renderRobber(
    html: HTMLElement & SVGElement, 
    info: BoardRenderInfo) {
    
    d3.select(html)
      .select('#robber')
      .remove()

    const robberCoord = info.board.robber

    d3.select(html)
      .append('g')
        .attr('id', 'robber')
        .classed('robber', true)
      .append('image')
        .attr('x', tileCenter(robberCoord, info.tileRadius)[0] - robberWidth(info.tileRadius) / 2)
        .attr('y', tileCenter(robberCoord, info.tileRadius)[1] - robberHeight(info.tileRadius) / 2)
        .attr('width', robberWidth(info.tileRadius))
        .attr('height', robberHeight(info.tileRadius))
        .attr('href', robber)
}

export function renderBuildings(
    html: HTMLElement & SVGElement, 
    info: BoardRenderInfo
) {
    d3.select(html)
      .select('#buildings')
      .remove()
    
    const enter =
        d3.select(html)
        .append('g')
            .attr('id', 'buildings')
            .classed('buildings', true)
        .selectAll()
            .data(info.board.buildings)
            .enter()


    enter
      .append('image')
        .attr('x', x => crossingPosition(x[1], info.tileRadius)[0] - buildingWidth(info.tileRadius) / 2)
        .attr('y', x => crossingPosition(x[1], info.tileRadius)[1] - buildingHeight(info.tileRadius) / 2)
        .attr('width', buildingWidth(info.tileRadius))
        .attr('height', buildingHeight(info.tileRadius))
        // .style('filter', x => 'opacity(100%) brightness(0) saturate(100%) ' + filterColor(x[0]))
        .style('background-color', x => stringColor(x[0]))
        .attr('href', building)
}

