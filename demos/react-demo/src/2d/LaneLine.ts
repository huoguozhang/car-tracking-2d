// 车道线
import { Graphics } from 'pixi.js'
import { ILaneLineConf, ILinePos } from './utils/types'
import { getDistanceByTwoPoint } from './utils/helper'

const VALID_LEN = 4

interface IOps{
    conf: ILaneLineConf[]
    rate:number
}

export default class LaneLine {
  // 四个点 起点 中心的终点 中心起点（中心两个点为转弯的情况）  终点
  posList: ILinePos[] = []
  rate: number
  totalMeter = 0
  constructor({conf, rate}: IOps) {
    this.rate = rate

    this.calcPos(conf)

    this.paint()
  }

  calcPos(conf: ILaneLineConf[]) {
    const first = conf[0]
    let prev: ILinePos = {
      x: first.x,
      y: first.y,
      rel: 0,
      meter: 0,
      pxLen: 0
    }

    this.posList.push(prev)

    let totalLen = prev.pxLen

    for(let i =1; i < conf.length; i++){
      const cur = conf[i]
      const distance =getDistanceByTwoPoint(prev, cur)

      totalLen = distance + prev.pxLen

      const pos: ILinePos = {
        ...cur,
        pxLen: totalLen,
        rel: 0,
        meter: totalLen / this.rate,
      }

      this.posList.push(pos)
    }

    this.posList.forEach(v => {
        v.rel = v.pxLen / totalLen
    })

    const last = this.posList.at(-1)

    if (last) {
        this.totalMeter = last.meter
    }

   
  }
  get isValid() {
    return this.posList.length === VALID_LEN
  }

  paint() {
    const g = new Graphics()
    g.lineStyle(2, 0xff0000)

    if (!this.isValid) return g
    const first = this.posList[0]
    if (first) g.moveTo(first.x, first.y)

    this.posList.slice(1).forEach((p) => {
      g.lineTo(p.x, p.y)
    })

    return g
  }
}
