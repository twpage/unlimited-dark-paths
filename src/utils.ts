import * as ROT from 'rot-js/lib/index'
import { Coordinate } from './app'

let MAX_GRID_SIZE = 1024

export function xyToKey(xy: Coordinate) : number {
    return (xy.y * MAX_GRID_SIZE) + xy.x
} 

export function keyToXY(key: number) : Coordinate {
    // return new Coordinate(key % MAX_GRID_SIZE, Math.floor(key / MAX_GRID_SIZE))
    return new Coordinate(ROT.Util.mod(key, MAX_GRID_SIZE), Math.floor(key / MAX_GRID_SIZE))
}

export function x_and_yToKey(x : number, y: number) : number {
    return (y * MAX_GRID_SIZE) + x
} 

