// 车道线
import { Graphics } from 'pixi.js'
import { ILaneLineConf, ILinePos, IState } from './utils/types'
import { getDistanceByTwoPoint } from './utils/helper'

const VALID_LEN = 4

interface IOps {
  conf: ILaneLineConf[]
  rate: number
}

export default class LaneLine {
  // 四个点 起点 中心的终点 中心起点（中心两个点为转弯的情况）  终点
  posList: ILinePos[] = []
  rate: number
  totalMeter = 0
  constructor({ conf, rate }: IOps) {
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

    for (let i = 1; i < conf.length; i++) {
      const cur = conf[i]
      const distance = getDistanceByTwoPoint(prev, cur)

      totalLen = distance + prev.pxLen

      const pos: ILinePos = {
        ...cur,
        pxLen: totalLen,
        rel: 0,
        meter: totalLen / this.rate
      }

      this.posList.push(pos)
    }

    this.posList.forEach((v) => {
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

  // 找到当前里程属于哪两点的
  getPosByMeter(meter: number) {
    const len = this.posList.length

    let prev = this.posList[0]
    let cur = prev

    for (let i = 1; i < len; i++) {
      cur = this.posList[i]

      if (cur.meter >= meter) {
        prev = this.posList[i - 1]
        break
      }
    }

    return this.getState(prev, cur, meter)
  }

  getState(prev: ILinePos, cur: ILinePos, meter: number): IState {
    // 跑的距离 占起点到终点 多远 百分比
    const sRate = ((meter - prev.meter) / (cur.meter - prev.meter))

    const { x: x1, y: y1 } = prev
    const { x: x2, y: y2 } = cur

    const dx = x2 - x1
    const dy = y2 - y1

    const newX = x1 + sRate * dx
    const newY = y1 + sRate * dy

    let rotation = 0

    // 计算航向角（弧度）

    if (dy === 0) {
      // 如果 y2 - y1 等于 0，说明沿水平方向移动
      rotation = dx > 0 ? 0 : Math.PI
    } else if (dx === 0) {
      // 如果 x2 - x1 等于 0，说明沿垂直方向移动
      rotation = dy > 0 ? Math.PI / 2 : -Math.PI / 2
    } else {
      rotation = Math.atan2(dy, dx)
    }

    return { x: Math.floor(newX), y: Math.floor(newY), rotation }
  }
}
