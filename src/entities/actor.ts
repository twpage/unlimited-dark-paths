import { Entities, Coordinate, ROTColor } from "../app";
import { EntityType } from "./entity";


export const enum ActorType {
    Player,
    Mob,
    Animation,
}

export class Actor implements Entities.Entity {
    actorType: ActorType
    entityType: EntityType
    code: string
    color: ROTColor
    location: Coordinate
    lastStepOffset : Coordinate

    constructor() {
        this.actorType = ActorType.Mob
        this.lastStepOffset = new Coordinate(0, 0)
    }
    act(): Promise<any> {
        console.log("mob turn")
        return Promise.resolve()
    }
}