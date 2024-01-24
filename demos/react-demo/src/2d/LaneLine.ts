// 车道线
import { Graphics } from 'pixi.js'
import { ILaneLineConf, ILinePos, IState } from './utils/types'
import {

  PI,
  ensureAngleInRange,
  getDistanceByTwoPoint
} from './utils/helper'

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
  hasCurve = false
  // debug使用
  curInfo: any
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
      pxLen: 0,
      curve: first.curve
    }

    this.posList.push(prev)

    let totalLen = prev.pxLen

    for (let i = 1; i < conf.length; i++) {
      const cur = conf[i]
      const { curve } = prev

      let distance = 0

      if (curve) {
        this.hasCurve = true
        distance = Math.floor(curve.deg * curve.r)
      } else {
        distance = getDistanceByTwoPoint(prev, cur)
      }

      totalLen = distance + prev.pxLen

      const pos: ILinePos = {
        ...cur,
        pxLen: totalLen,
        rel: 0,
        meter: totalLen / this.rate
      }

      this.posList.push(pos)

      prev = pos
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

    g.lineStyle(2, 0xffffff)

    if (!this.isValid) return g
    const first = this.posList[0]
    if (first) {
      g.moveTo(first.x, first.y)
    }

    this.posList.slice(1).forEach((p) => {
      g.lineTo(p.x, p.y)

      if (p.curve) {
        const { cx, cy, r, start, end } = p.curve

        g.drawCircle(cx, cy, 3)

        let sAngle = Math.min(start, end)
        let eAngle = Math.max(start, end)
        g.arc(cx, cy, r, sAngle, eAngle, false)

        g.lineStyle(2, 0xffffff)
      }

      g.moveTo(p.x, p.y)
    })

    return g
  }

  // 找到当前里程属于哪两点的
  getPosByMeter(meter: number) {
    const len = this.posList.length

    let prev = this.posList[0]
    let cur = prev

    let i = 1

    for (; i < len; i++) {
      cur = this.posList[i]

      if (cur.meter >= meter) {
        prev = this.posList[i - 1]
        break
      }
    }

    const prev2 = this.posList[i - 2]
    const next = this.posList[i + 1]

    let isTanRise = false

    if (prev2 && next) {
      // 由水平向垂直方向
      // 航向角需要调整 180度
      const tan1 = (prev2.y - prev.y) / (prev2.x - prev.x)
      const tan2 = (next.y - cur.y) / (next.x - cur.x)

      isTanRise = Math.abs(tan2) > Math.abs(tan1)
    }

    return this.getState(prev, cur, meter, isTanRise)
  }

  getState(
    prev: ILinePos,
    cur: ILinePos,
    meter: number,
    isRise = false
  ): IState {
    // 跑的距离 占起点到终点（两点） 多远 百分比
    const sRate = (meter - prev.meter) / (cur.meter - prev.meter)

    const { x: x1, y: y1, curve } = prev
    const { x: x2, y: y2 } = cur

    if (curve) {
      const { cx, cy, r, start, end } = curve
      // 角度变化值
      const d_deg = sRate * (end - start) + start

      const x = cx + Math.cos(d_deg) * r
      const y = cy + Math.sin(d_deg) * r

      const dx = x - cx
      const dy = y - cy

      let rotation = 0

      if (dx !== 0 && dy !== 0) {
        // y = k*x+b
        const k = -dx / dy
        const b = y - k * x
        const newY = cy
        const newX = (newY - b) / k

        // 计算航向角（弧度）

        const dx2 = x - newX
        const dy2 = y - newY

        rotation = this.getHeadingAngle(dx2, dy2)
      } else if (dx === 0 && dy === 0) {
        // 异常情况
        console.log('异常情况')
        rotation = 0
      } else if (dy === 0) {
        console.log('极端情况 dy === 0')
        rotation = dx > 0 ? 0 : Math.PI
      } else if (dx === 0) {
        console.log('极端情况 dx === 0')
        rotation = dy > 0 ? Math.PI / 2 : -Math.PI / 2
      }

      // '5-2', '6-2', '8-2', '7-2'
      if (isRise) rotation = rotation + PI

      rotation = ensureAngleInRange(rotation)

      return { x: Math.floor(x), y: Math.floor(y), rotation, inCurve: true }
    } else {
      const dx = x2 - x1
      const dy = y2 - y1

      const newX = x1 + sRate * dx
      const newY = y1 + sRate * dy

      return {
        x: Math.floor(newX),
        y: Math.floor(newY),
        rotation: this.getHeadingAngle(dx, dy),
        inCurve: false
      }
    }
  }
  // 从 起点(x1,y1) 到 终点(x2,y2)
  // 计算航向角（弧度）
  getHeadingAngle(dx: number, dy: number) {
    let rotation = 0

    if (dy === 0) {
      // 如果 y2 - y1 等于 0，说明沿水平方向移动
      rotation = dx > 0 ? 0 : Math.PI
    } else if (dx === 0) {
      // 如果 x2 - x1 等于 0，说明沿垂直方向移动
      rotation = dy > 0 ? Math.PI / 2 : -Math.PI / 2
    } else {
      rotation = Math.atan2(dy, dx)
    }

    rotation = ensureAngleInRange(rotation)

    return rotation
  }
}
