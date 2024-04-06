import { allCoordinates, type PortTile, type ResourceTile, type Tile } from "@/logic/Board"
import * as d3 from "d3"
import { tileHexagon, tileNumberPosition, tileNumberFontSize, tileResourceIconPosition, tileResourceIconSize } from "./Layout"
import brick from '@/assets/brick.svg'
import type { BoardRenderInfo } from "./Renderer.vue"
import type { Coordinate } from "@/logic/Coordinate"

export function renderTiles(html: HTMLElement & SVGElement, info: BoardRenderInfo) {
    // clean previous group
    d3.select(html)
      .select('#board')
      .remove()

    // make group
    const allTiles = 
        allCoordinates(info.board)
        .map<[Coordinate, Tile]>(pos => [pos, info.board.map.get(pos)!])
        .filter(x => x[1] != undefined)
    
    const enter =
        d3.select(html)
          .append('g')
            .attr('id', 'board')
          .selectAll()
            .data(allTiles)
            .enter()

    enter
      .append('path')
        .attr('d', x => d3.line()(tileHexagon(x[0], info.tileRadius)))
        .attr('fill', x => x[1] == 'Desert' ? 'yellow' : (x[1] == 'Ocean' || (x[1] as PortTile).orientation != undefined ? 'blue' : 'green'))

    enter
      .filter(x => (x[1] as ResourceTile).number != undefined)
      .datum<[[number, number], ResourceTile]>(x => [tileNumberPosition(x[0], (x[1] as ResourceTile).number, info.tileRadius)!, x[1] as ResourceTile])
      .append('text')
        .attr('x', x => x[0][0])
        .attr('y', x => x[0][1])
        .attr('font-size', x => `${tileNumberFontSize(x[1].number, info.tileRadius)!}px`)
        .attr('text-anchor', 'middle')
        .text(x => x[1].number.toString())
        
    // enter
    //   .append('image')
    //     .filter(x => x[1] ResourceTile)
    //     .datum(x => tileResourceIconPosition(x[0], info.tileRadius))
    //     .attr('x', x => x[0])
    //     .attr('y', x => x[1])
    //     .attr('width', tileResourceIconSize(info.tileRadius)[0])
    //     .attr('height', tileResourceIconSize(info.tileRadius)[1])
    //     .attr('href', brick)
}