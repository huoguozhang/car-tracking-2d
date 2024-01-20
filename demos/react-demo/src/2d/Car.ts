import { Sprite } from "pixi.js";

interface IOps  {}

export default class Car {

  pixiObj = Sprite.from('/car.svg')

  constructor ({}: IOps) {
    
  }
}