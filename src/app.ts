import { Game } from "./game";

import { Coordinate } from './coordinate'
export { Coordinate }

import * as Directions from './directions'
export { Directions }

import * as Entities from './entities'
export { Entities }

import { AreaMap } from './area-map'
export { AreaMap }

import {  InputUtility }from './input-utility'
export { InputUtility }

import * as Colors from './colors'
export { Colors }

document.body.onload = () => {
    var game = new Game();
    // console.log("whee")
}

export type ROTColor = [number, number, number]