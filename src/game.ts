import { Display, Scheduler, KEYS, RNG, Map } from 'rot-js/lib/index'
import Simple from "rot-js/lib/scheduler/simple";
import * as ROT from "rot-js/lib/index"
import { GridOfThings } from './grid';
import { Entities, Coordinate, AreaMap, ROTColor, Directions, Colors } from './app';
import { Actor, Player } from './entities';
import { Region } from './region';
let tileSet = document.createElement("img");
tileSet.src = "mono_black.png";

export class Game {
    private display: Display
    public scheduler: Simple
    // private canvasSize: { width: number, height: number }
    private gameSize: { width: number, height: number }
    private regionSize: { width: number, height: number }
    private mapSize: { width: number, height: number }
    private cameraOffset : Coordinate
    private seed: number 
    area_map: AreaMap
    

    constructor() {
        this.seed = 777
        this.gameSize = { width: 30, height: 30 }
        this.regionSize = { width: 15, height: 15 }
        this.mapSize = { width: this.regionSize.width * 3, height: this.regionSize.height * 3 }
        // this.canvasSize = { width: 30, height: 31 }

        this.cameraOffset  = new Coordinate(0, 0)

        this.display = new Display({
            layout: "tile",
            tileWidth: 12,
            tileHeight: 12,
            tileSet: tileSet,
            tileMap: {
                "": [261, 1],

                "@": [53, 92],
                "x": [105, 92],
                "?": [248, 235],

                "#": [53, 53],

                ".": [157, 66],
                ",": [183, 66],

            },
            tileColorize: true,
            width: this.gameSize.width,
            height: this.gameSize.height,
        });
        document.body.appendChild(this.display.getContainer());
        // document.body.appendChild(new HTMLDivElement())
        let div_footer = <HTMLDivElement>document.createElement("DIV")
        div_footer.setAttribute("id", "id_div_footer")
        document.body.appendChild(div_footer)
        this.initializeGame()
        this.mainLoop()
    }

    private initializeGame() : void {
        // console.log("WTF")
        this.area_map = new AreaMap(this.regionSize.width, this.regionSize.height, Colors.forest_green, this.seed)

        let start_xy = new Coordinate(0, 0)
        let start_region = new Region(this.regionSize.width, this.regionSize.height, this.seed, start_xy)
        start_region.generate(Colors.forest_green)
        this.area_map.addRegionTerrainToMap(start_region)

        for (let xy of start_xy.getSurrounding()) {
            // console.log(xy.toString())
            let new_region = new Region(this.regionSize.width, this.regionSize.height, this.seed, xy)
            new_region.generate(Colors.white)
            this.area_map.addRegionTerrainToMap(new_region)
        }


        let open_xys = ROT.RNG.shuffle(this.area_map.open_xys)

        let player = new Entities.Player(this, new Coordinate(5, 5))
        player.code = '@'
        player.color = Colors.hero_color
        this.area_map.actors.setAt(new Coordinate(5, 5), player)
        
        this.scheduler = new Simple()
        this.scheduler.add(player, true)

        let enemy = new Entities.Actor()
        enemy.code = 'x'
        enemy.color = [255, 255, 0]
        this.area_map.actors.setAt(open_xys[1], enemy)

        this.scheduler.add(enemy, true);

        // for (let enemy of this.enemies) {
        //     this.scheduler.add(enemy, true);
        // }
        this.resetPlayerCamera(player)
        this.drawAll()
    }

    centerPlayerCamera(player: Actor) : boolean { // returns true if camera changed
        let player_xy = player.location
        let half_disp_width = Math.floor(this.gameSize.width / 2)
        let half_disp_height =  Math.floor(this.gameSize.height / 2)

        let camera_x : number
        let camera_y : number

        if (player_xy.x < half_disp_width) {
            camera_x = 0
        } else if (player_xy.x > (this.mapSize.width - half_disp_width)) {
            camera_x = this.mapSize.width - this.gameSize.width
        } else {
            camera_x = player_xy.x - half_disp_width
        }

        if (player_xy.y < half_disp_height) {
            camera_y = 0
        } else if (player_xy.y > (this.mapSize.height - half_disp_height)) {
            camera_y = this.mapSize.height - this.gameSize.height
        } else {
            camera_y = player_xy.y - half_disp_height
        }

        let camera_xy = new Coordinate(camera_x, camera_y)
        // console.log(camera_xy.toString())
        let old_camera_xy = this.cameraOffset.clone()
        this.cameraOffset = camera_xy

        return (!(camera_xy.compare(old_camera_xy)))
    }

    resetPlayerCamera(player: Actor) : boolean { // returns true if camera changed
        // only scroll when within the last /5th of the screen
        let player_map_xy = player.location
        let player_screen_xy = player.location.subtract(this.cameraOffset)

        let fifth_disp_width = Math.floor(this.gameSize.width / 5)
        let fifth_disp_height =  Math.floor(this.gameSize.height / 5)

        let fourfifths_disp_width = Math.floor(this.gameSize.width * 4 / 5)
        let fourfifths_disp_height =  Math.floor(this.gameSize.height * 4 / 5)

        let camera_offset_x : number = 0
        let camera_offset_y : number = 0

        if ((player_screen_xy.x < fifth_disp_width) && (player.lastStepOffset.x < 0)) {
            camera_offset_x = -1
        } else if ((player_screen_xy.x > fourfifths_disp_width) && (player.lastStepOffset.x > 0)) {
            camera_offset_x = +1
        }

        if ((player_screen_xy.y < fifth_disp_height) && (player.lastStepOffset.y < 0)) {
            camera_offset_y = -1
        } else if ((player_screen_xy.y > fourfifths_disp_height) && (player.lastStepOffset.y > 0)) {
            camera_offset_y = +1
        }
        
        // let camera_x = Math.max(0, Math.min(this.mapSize.width - this.gameSize.width, this.cameraOffset.x + camera_offset_x))
        // let camera_y = Math.max(0, Math.min(this.mapSize.height - this.gameSize.height, this.cameraOffset.y + camera_offset_y))

        let camera_x = this.cameraOffset.x + camera_offset_x
        let camera_y = this.cameraOffset.y + camera_offset_y

        let camera_xy = new Coordinate(camera_x, camera_y)
        // console.log(camera_xy.toString())
        let old_camera_xy = this.cameraOffset.clone()
        this.cameraOffset = camera_xy
        return (!(camera_xy.compare(old_camera_xy)))

        
    }

    drawPoints(point_xys: Coordinate[]) {
        point_xys.forEach((xy) => {
            this.drawPoint(xy)
        })
    }

    private drawPoint(map_xy: Coordinate) {
        let screen_xy = map_xy.subtract(this.cameraOffset)

        let terrain_at = this.area_map.terrain.getAt(map_xy)
        if (terrain_at) {

            let actor = this.area_map.actors.getAt(terrain_at.location)

            let char : string
            let fg_color: ROTColor

            if (actor) {
                fg_color = actor.color
                char = actor.code
            } else {
                fg_color = terrain_at.color
                char = terrain_at.code
            }
            
            this.display.draw(screen_xy.x,screen_xy.y, char, ROT.Color.toRGB(fg_color), ROT.Color.toRGB(Colors.default_bg))
        // this.display.draw(screen_xy.x, screen_xy.y, char, this.convertRGBtoRGBA(fg_color, 0.25), 'black')
        } else {
            
            this.display.draw(screen_xy.x, screen_xy.y, "?", ROT.Color.toRGB(Colors.default_fg), ROT.Color.toRGB(Colors.default_bg))
        }
    }

    private convertRGBtoRGBA(color: ROTColor, alpha: number) : string {
        let color_str = ROT.Color.toRGB(color)
        let alpha_color_str = color_str.slice(0, -1) + ", " + alpha.toString() + ")"
        return alpha_color_str

    }
    drawAll() {
        let char : string
        let fg_color: ROTColor
        // console.log("draw display", this.gameSize.width, this.gameSize.height)
        this.display.clear()

        // for (let t_xy of this.map.terrain.getAllItems()) {
        //     this.drawPoint(t_xy.xy)
        // }
        // for (let x = 0; x < this.gameSize.width; x++) {
        //     for (let y = 0; y < this.gameSize.height; y++) {
        //         this.drawPoint(new Coordinate(x, y))
        //     }
        // }
        for (let v_xy of this.getViewWindow()) {
            this.drawPoint(v_xy)
        }

        
    }

    drawFooter(player: Actor) {
        let region_number = this.area_map.getRegionNumberOfLocation(player.location)
        let region = this.area_map.regions[region_number]

        let footer_text : string = ""

        footer_text += "SCR: " + player.location.subtract(this.cameraOffset).toString()
        footer_text += " MAP: " + player.location.toString()
        footer_text += " RGN: " + player.location.subtract(region.topleft_unit_xy)
        footer_text += " RGN #(" + this.area_map.getRegionNumberOfLocation(player.location) + ")"

        // console.log(footer_text)
        let div_footer = <HTMLDivElement>(document.getElementById("id_div_footer"))
        div_footer.innerHTML = `<span>${footer_text}</span>`

    }
    private getViewWindow() : Coordinate[] {
        let view_xys : Coordinate[] = []

        for (let x = 0; x < this.gameSize.width; x++) {
            for (let y = 0; y < this.gameSize.height; y++) {
                // this.drawPoint(new Coordinate(x, y))
                view_xys.push((new Coordinate(x, y)).add(this.cameraOffset))
            }
        }
        // console.log("viewport size: ", view_xys.length)
        return view_xys
    }

    private async mainLoop(): Promise<any> {
        let actor: Entities.Actor
        while (true) {
            actor = this.scheduler.next();
            if (!actor) {
                console.log("no actors")
                break;
            }
            await actor.act();

            if (actor.code === '@') {
                
                let change_camera = this.resetPlayerCamera(actor)
                if (change_camera) {
                    // console.log(this.cameraOffset)
                    this.drawAll()
                }
                this.drawFooter(actor)
            }
            // } else {
            //     console.log("enemy turn")
            // }


            // this.drawAll()

        }
    }
}
    
