import { InputUtility, Directions, Coordinate, Entities, Colors  } from "../app";
import { Actor } from "../entities"
import * as ROT from "rot-js/lib/index"
import { ActorType } from "./actor";
import { EntityType } from "./entity";
import { Game } from "../game";
import { TerrainType } from "./terrain";

let direction_key_map : {[key: number]: Coordinate} = {}
direction_key_map[ROT.KEYS.VK_W] = Directions.UP
direction_key_map[ROT.KEYS.VK_S] = Directions.DOWN
direction_key_map[ROT.KEYS.VK_A] = Directions.LEFT
direction_key_map[ROT.KEYS.VK_D] = Directions.RIGHT

export class Player extends Actor {
    entityType: EntityType.Actor

    code: string
    actorType: ActorType

    constructor(private game: Game, public location: Coordinate) {
        super()
        this.actorType = ActorType.Player
    }

    act(): Promise<any> {
        return InputUtility.waitForInput(this.handleInput.bind(this));
    }

    private handleInput(event: KeyboardEvent): boolean {
        let validInput = false
        let code = event.keyCode
        if ([ROT.KEYS.VK_W, ROT.KEYS.VK_A, ROT.KEYS.VK_S, ROT.KEYS.VK_D].indexOf(code) > -1) {

            let offset_dir_xy = direction_key_map[code]
            let old_xy = this.location.clone()
            let new_xy = old_xy.add(offset_dir_xy)
            let old_region_num = this.game.area_map.active_region_number.getAt(old_xy)

            if (!(this.game.area_map.terrain.hasAt(new_xy))) {
                console.log("you cannot go that way")
                return false
            }

            let terrain_at = this.game.area_map.terrain.getAt(new_xy)
            if (terrain_at.terrainType == TerrainType.Wall) {
                let new_terrain = new Entities.Terrain()
                new_terrain.terrainType = TerrainType.Floor
                new_terrain.code = ','
                new_terrain.color = Colors.default_fg
                new_terrain.location = new_xy
                this.game.area_map.terrain.removeAt(new_xy)
                this.game.area_map.terrain.setAt(new_xy, new_terrain)
                this.game.drawPoints([new_xy])
                return true
            }
            this.lastStepOffset = offset_dir_xy
            this.game.area_map.actors.removeAt(old_xy)
            this.game.area_map.actors.setAt(new_xy, this)
            this.location = new_xy

            validInput = true
            this.game.drawPoints([old_xy, new_xy])

            let new_region_num = this.game.area_map.active_region_number.getAt(new_xy)
            if (new_region_num != old_region_num) {
                this.game.area_map.centerMapToRegion(this.game.area_map.regions[new_region_num])
            }
        } else if ([ROT.KEYS.VK_SPACE].indexOf(code) > -1) {

            let redraw = this.game.centerPlayerCamera(this)
            if (redraw) {
                this.game.drawAll()
            }

        } else if ([ROT.KEYS.VK_Q].indexOf(code) > -1) {
            // do some stopping animation stuff
            // let pausey = new Entities.AnimationActor(this.game, this.location)
            // this.game.scheduler.add(pausey, false)
            setTimeout(
                () => {
                    return validInput
                }
                , 3000
            )

        }

        
        return validInput
    }
}