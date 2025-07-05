import { GridOfThings } from "./grid";
import { Entities, Coordinate, Colors, ROTColor } from "./app";
import { Region, getUlamSpiralNumber } from "./region";
import * as ROT from "rot-js/lib/index"

export class AreaMap {

    terrain: GridOfThings<Entities.Terrain>
    actors: GridOfThings<Entities.Actor>
    open_xys: Coordinate[]
    
    active_region_number: GridOfThings<number>
    regions: { [key: number]: Region }

    /// TWP WUZ HERE: chagne thie back to map wi/heigh, i think new regions are being made with weird dimensions and way too big
    constructor(public region_width: number, public region_height: number, public base_color: ROTColor, public base_seed: number) {
        this.region_width = region_width
        this.region_height = region_height
        this.terrain = new GridOfThings<Entities.Terrain>()
        this.actors = new GridOfThings<Entities.Actor>()
        this.open_xys = []
        this.active_region_number  = new GridOfThings<number>()
        this.regions = {}
    }

    centerMapToRegion(region: Region)  {
        // given a region, build the map as a 3x3 grid around it
        // console.log("centering on new region", region)
        // console.log("existing map count" + this.terrain.getAllCoordinates().length)
        let keep_regions_by_num : string[] = [region.region_number.toString()]

        for (let adj_xy of region.region_xy.getSurrounding()) {
            let potential_region_num = getUlamSpiralNumber(adj_xy)
            if (potential_region_num in this.regions) {
                // region is already in the map, pass
                keep_regions_by_num.push(potential_region_num.toString())
            } else {
                // need a new region
                // console.log("adding new region at " + adj_xy.toString())
                let new_region = new Region(this.region_width, this.region_height, this.base_seed, adj_xy)
                new_region.generate(ROT.Color.randomize(this.base_color, [35, 35, 10]))
                this.addRegionTerrainToMap(new_region)
                keep_regions_by_num.push(new_region.region_number.toString())
            }
        }

        // loop through all regions and delete ones we dont need
        let num_to_delete = 0
        for (let existing_regnum in this.regions) {
            let my_region = this.regions[existing_regnum]
            if (keep_regions_by_num.indexOf(my_region.region_number.toString()) === -1) {
                num_to_delete += 1
            }
        }



        console.log("new map count" + this.terrain.getAllCoordinates().length + " to delete: " + num_to_delete)
    }

    addRegionTerrainToMap(region: Region) {
        // speed this up eventually
        for (let t_xy of region.terrain.getAllItems()) {
            if (this.terrain.hasAt(t_xy.xy)) {
                console.error("why did this happen")
            }
            this.terrain.setAt(t_xy.xy, t_xy.item)
            this.active_region_number.setAt(t_xy.xy, region.region_number)
        }
        this.open_xys = this.open_xys.concat(region.open_xys)
        this.regions[region.region_number] = region
    }

    getRegionNumberOfLocation(given_xy: Coordinate) : number {
        return this.active_region_number.getAt(given_xy)
    }


}