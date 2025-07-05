import { EntityType } from "./entity";
import { Game } from "../game";
import { Actor, ActorType } from "./actor";
import { Coordinate } from "../app";

export class AnimationActor extends Actor {
    entityType: EntityType.Actor

    code: string
    actorType: ActorType

    constructor(private game: Game, public location: Coordinate) {
        super()
        this.actorType = ActorType.Animation
    }

    act(): Promise<any> {

        
        // return Promise.resolve()
        return new Promise(resolve => { 
            setTimeout(
                
                resolve
                
            , 2000)
        })
    }
}