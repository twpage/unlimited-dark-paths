import { Coordinate, ROTColor } from '../app'


export const enum EntityType {
    Terrain,
    Actor,
}

export interface Entity {
    location: Coordinate
    code: string
    color: ROTColor
    bg_color ?: ROTColor
    entityType: EntityType
}