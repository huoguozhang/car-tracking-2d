import { Container } from 'pixi.js'
import {
  IDataItem,
  ILaneLineConf,
  IPos,
  TLaneNo,
  TMountChild
} from './utils/types'
import Lane from './Lane'
import Car, { CAR_IMAGE_WIDTH, CAR_IMAGE_HEIGHT } from './Car'
import debuggerHelper from './utils/debuggerHelper'

interface IOps {
  ct: Container
  laneCount: number
  laneWidth: number
  rate: number
  laneConfList: ILaneLineConf[][]
  basePos?: IPos
}

export default class Road {
  ct: Container
  laneCount: IOps['laneCount']
  laneWidth: IOps['laneWidth']
  basePos: IPos
  rate: number

  laneMap = new Map<TLaneNo, Lane>()

  carMap = new Map<Car['id'], Car>()

  carWidth = 0
  carHeight = 0

  constructor({ ct, laneCount, laneConfList, laneWidth, basePos, rate }: IOps) {
    this.laneCount = laneCount
    this.laneWidth = laneWidth
    this.ct = ct
    this.rate = rate
    this.basePos = basePos || { x: 0, y: 0 }

    this.carWidth = Math.floor(CAR_IMAGE_WIDTH * rate)
    this.carHeight = Math.floor(CAR_IMAGE_HEIGHT * rate)
    this.calcLane(laneConfList)
  }

  // 计算车道信息
  calcLane(laneConfList: IOps['laneConfList']) {
    laneConfList.forEach((list) => {
      const lane = new Lane({
        lineConf: list,
        rate: this.rate
      })

      // 方便开发观察 绘制车道线 ---begin----
      //   this.mount(lane.centerLine.paint())

      this.laneMap.set(lane.id, lane)
    })
  }

  getPos(pos: IPos) {
    return {
      x: Math.floor((pos.x - this.basePos.x) * this.rate),
      y: Math.floor((pos.y - this.basePos.y) * this.rate)
    }
  }

  addCar(car: Car) {
    this.carMap.set(car.id, car)
    this.mount(car.pixiObj)
  }
  removeCar(car: Car) {
    this.carMap.delete(car.id)

    this.unmount(car.pixiObj)
  }

  mount(child: TMountChild) {
    this.ct.addChild(child)
  }

  unmount(child: TMountChild) {
    this.ct.removeChild(child)
  }

  createAndUpdate(dataList: IDataItem[]) {
    dataList.forEach((data) => {
      const { id, meter, laneNo, leave } = data

      const lane = this.laneMap.get(laneNo)

      if (!lane) {
        console.log('车道获取异常')
        return
      }

      const posState = lane.getPosByMeter(meter)

      let car = this.carMap.get(id)

      if (leave) {
        if (car) car.markRemove()
        return
      }

      if (!car) {
        car = new Car({
          ...posState,
          id,
          width: this.carWidth,
          height: this.carHeight
        })

        car.hide()

        this.addCar(car)
      } else {
        car.show()
        car.readyMove(posState)

        // debug 文本
        if (debuggerHelper.isDebug) {
          car.updateText(
            [
              `${meter.toFixed(2)}m`,
              `id:${id}`,
              `lane:${laneNo}`,
              `pos:[${posState.x},${posState.y}]`
            ].join('\n')
          )
        }
      }
    })
  }

  consume(deltaMs: number) {
    for (const car of this.carMap.values()) {
      // 移除 离开的车辆
      if (car.willRemove && !car.updating) {
        this.removeCar(car)
      } else {
        car.consume(deltaMs)
      }
    }
  }
}
