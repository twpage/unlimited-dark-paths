//     Game - displayed window (30 x 30)
// Region - procedurally generated area based on seed & uler number
// Map - in memory prepared to be displayed when scrolled to. 3 x 3 regions

import { Coordinate, ROTColor, Entities, Colors } from "./app";
import { GridOfThings } from "./grid";
import { Map as RotJsMap } from "rot-js/lib/index";
import * as ROT from 'rot-js/lib/index'
import { TerrainType } from "./entities/terrain";


export class Region {
    public region_number : number
    public base_color : ROTColor
    topleft_unit_xy: Coordinate
    public terrain: GridOfThings<Entities.Terrain>
    open_xys: Coordinate[]

    constructor(public width: number, public height: number, private base_seed: number, public region_xy: Coordinate) {
        // https://math.stackexchange.com/a/3003770       
        this.topleft_unit_xy = new Coordinate(this.region_xy.x * this.width, this.region_xy.y * this.height)
        // console.log("region coord: " + region_xy.toString() + " topleft: " + this.topleft_unit_xy.toString())
        this.region_number = getUlamSpiralNumber(region_xy)
        this.terrain = new GridOfThings<Entities.Terrain>()
        this.open_xys = []
    }    

    mapGenCallback(x: number, y: number, wall: number): void {
        let xy = new Coordinate(x, y)
        // if (xy.compare(new Coordinate(0, 0))) {
        //     console.log("inner" + this.topleft_unit_xy.toString())
        // }
        xy = xy.add(this.topleft_unit_xy)

        // let unit_xy = xy.toUnit()
        // let abs_xy = new Coordinate(Math.abs(unit_xy.x), Math.abs(unit_xy.y))
        // xy = xy.add(abs_xy)
        // console.log(this.topleft_unit_xy.toString())

        let tile = new Entities.Terrain()

        if (wall) {
            tile.code = "#"
            
            // tile.color = ROT.Color.randomize(Colors.forest_green, [35, 35, 10])
            tile.color = this.base_color //ROT.Color.randomize(this.base_color, [35, 35, 10])
            tile.terrainType = TerrainType.Wall
        } else {
            tile.code = "."
            tile.color = Colors.default_fg
            tile.terrainType = TerrainType.Floor
            this.open_xys.push(xy)
        }
        tile.location = xy
        this.terrain.setAt(xy, tile)
    }

    generate(base_color: ROTColor) {
        this.base_color = base_color

        // let rot_mapper = new RotJsMap.Digger(this.width, this.height)
        let rot_mapper = new RotJsMap.Cellular(this.width, this.height)
        // let rot_mapper = new RotJsMap.Arena(this.width, this.height)
        // console.log("generating arena: " + this.width + " x " + this.height)
        rot_mapper.randomize(0.5)
        // console.log("here")
        

        rot_mapper.create(this.mapGenCallback.bind(this)) 
    }

}

export function getUlamSpiralNumber(offset_xy: Coordinate) : number {
    // 2025 update - not sure this is actually ulam spiral or something else, 
    // but it takes an x, y pair and treats is as a hash to return a unique integer
    // this unique integer is used to track the different regions so they can be visited in any order and returned to
    // todo: could use the initial seed in conjunction with this number to ensure that the same region is generated every time
    // (this would need a change/reset of the random seed)

    let x = (offset_xy.x >= 0) ? (2*offset_xy.x) : ((-2*offset_xy.x) - 1)
    let y = (offset_xy.y >= 0) ? (2*offset_xy.y) : ((-2*offset_xy.y) - 1)

    let pi = ((0.5 * (x + y)) * (x + y + 1)) + y
    return pi
}