import { Container, Graphics } from 'pixi.js'
import { IDataItem, ILaneLineConf, IPos, TLaneNo, TMountChild } from './utils/types'
import Lane from './Lane'

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
  constructor({ ct, laneCount, laneConfList, laneWidth, basePos, rate }: IOps) {
    this.laneCount = laneCount
    this.laneWidth = laneWidth
    this.ct = ct
    this.rate = rate
    this.basePos = basePos || { x: 0, y: 0 }

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
      this.mount(lane.centerLine.paint())

      this.laneMap.set(lane.id, lane)
    })
  }

  getPos(pos: IPos) {
    return {
      x: Math.floor((pos.x - this.basePos.x) * this.rate),
      y: Math.floor((pos.y - this.basePos.y) * this.rate)
    }
  }

  mount(child: TMountChild) {
    this.ct.addChild(child)
  }

  unmount(child: TMountChild) {
    this.ct.removeChild(child)
  }

  createAndUpdate (
    dataList: IDataItem[]
  ) {
  }
}
