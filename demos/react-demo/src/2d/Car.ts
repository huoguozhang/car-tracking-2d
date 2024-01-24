import { Container, Sprite, Text } from 'pixi.js'
import { IState, TMountChild, TUid } from './utils/types'
import { Z_INDEX_MAP } from './utils/const'
import { DOUBLE_PI, PI } from './utils/helper'

interface IOps extends IState {
  id: TUid
  width: number
  height: number
}

// 补帧一秒
const MAX_USED_TIME = 1000

// car 基础尺寸 真实尺寸 基于rate调整
export const CAR_IMAGE_WIDTH = 7

export const CAR_IMAGE_HEIGHT = 6

const IN_CURVE_STATE = 1
const NOT_CURVE_STATE = 0
export default class Car {
  id: TUid
  usedTime = 0
  updating = false
  rotation = 0

  rotationChangeState = NOT_CURVE_STATE

  deltaState: IState = {
    x: 0,
    y: 0,
    rotation: 0
  }

  prevState: IState = {
    x: 0,
    y: 0,
    rotation: 0
  }

  pixiObj = new Container()
  carObj = Sprite.from('/car.svg')
  textObj = new Text('', {
    fill: 0xffffff,
    fontSize: 16
  })

  willRemove = false

  constructor({ x, y, rotation, id, width, height }: IOps) {
    this.id = id

    this.carObj.width = width
    this.carObj.height = height

    this.carObj.anchor.set(0.5, 0.5)

    // 只需要车身旋转即可
    this.updateRotation(rotation)

    this.carObj.zIndex = Z_INDEX_MAP.car
    this.textObj.zIndex = Z_INDEX_MAP.text

    this.pixiObj.x = x
    this.pixiObj.y = y
    this.pixiObj.sortableChildren = true

    this.mount(this.carObj)
    this.mount(this.textObj)
  }
  mount(c: TMountChild) {
    this.pixiObj.addChild(c)
  }
  hide() {
    this.pixiObj.visible = false
  }
  show() {
    this.pixiObj.visible = true
  }
  readyMove({ x, y, rotation }: IState) {
    this.usedTime = 0
    this.updating = true

    const { x: o_x, y: o_y } = this.pixiObj

    const o_rotation = this.rotation

    this.prevState = {
      x: o_x,
      y: o_y,
      rotation: o_rotation
    }

    let dRotation = rotation - o_rotation

    // 应该旋转小角度
    if (Math.abs(dRotation) > PI ) {
       const temp_o = DOUBLE_PI - o_rotation
       dRotation = rotation - temp_o

       this.updateRotation(temp_o)
       this.prevState.rotation = temp_o
    } else if (Math.abs(dRotation) > PI /2) {
      
      //  dRotation = (PI - rotation) -o_rotation
    }

    this.deltaState = {
      x: x - o_x,
      y: y - o_y,
      rotation: dRotation
    }
  }
  // requestFrameAnimation的调度间隔
  consume(deltaMs: number) {
    if (!this.updating) return

    const usedTime = this.usedTime + deltaMs

    if (usedTime >= MAX_USED_TIME) {
      this.usedTime = MAX_USED_TIME
      this.updating = false
    } else {
      const { x: o_x, y: o_y, rotation: o_r } = this.prevState
      const { x: dx, y: dy, rotation: d_r } = this.deltaState

      const factor = usedTime / MAX_USED_TIME

      const x = Math.floor(o_x + dx * factor)
      const y = Math.floor(o_y + dy * factor)
      const rotation = o_r + d_r * factor
      this.usedTime = usedTime

      this.pixiObj.x = x
      this.pixiObj.y = y

      this.updateRotation(rotation)
    }
  }
  destroy() {
    // this.carObj.destroy()
  }

  // 跑完最后的里程再消失
  markRemove() {
    this.willRemove = true
  }

  updateText(text: string) {
    this.textObj.text = text
  }
  updateRotation(rotation: number) {
    this.rotation = rotation

    this.carObj.rotation = rotation
  }
  changeRotationIfNeed(rotation: number, inCurve: boolean) {
    if (this.rotationChangeState === NOT_CURVE_STATE && inCurve) {
      this.rotationChangeState = IN_CURVE_STATE
      // this.updateRotation(rotation)
    } else if (this.rotationChangeState === IN_CURVE_STATE && !inCurve) {
      this.rotationChangeState = NOT_CURVE_STATE
      //  this.updateRotation(rotation)
    }
  }
}
