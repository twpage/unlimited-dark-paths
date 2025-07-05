import { Entities, Coordinate, ROTColor } from "../app";
import { EntityType } from "./entity";


export const enum TerrainType {
    Floor,
    Wall,
}

export class Terrain implements Entities.Entity {
    terrainType: TerrainType
    location: Coordinate
    entityType: EntityType
    code: string
    color: ROTColor
}