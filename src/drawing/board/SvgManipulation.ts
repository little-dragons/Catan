import { allPositions, type PortTile, type Tile } from "@/logic/Board"
import * as d3 from "d3"
import { tileHexagon, tileResourceIconPosition, tileResourceIconSize } from "./Layout"
import brick from '@/assets/brick.svg'
import type { BoardRenderInfo } from "./Renderer.vue"

export function renderTiles(html: HTMLElement & SVGElement, info: BoardRenderInfo) {
    // clean previous group
    d3.select(html)
      .select('#board')
      .remove()

    // make group
    const allTiles = 
        allPositions(info.board)
        .map<[[number, number], Tile]>(pos => [pos, info.board.map.get(pos)!])
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