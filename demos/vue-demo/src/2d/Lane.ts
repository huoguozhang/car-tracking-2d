import LaneLine from './LaneLine'
import { Z_INDEX_MAP } from './utils/const'
import { type ILaneLineConf,type TUid } from './utils/types'
import { Container, Graphics, Text } from 'pixi.js'

// 车道
let _id = 0

const genId = () => {
  _id++
  return _id
}

interface IOps {
  lineConf: ILaneLineConf[]
  rate: number
  uid: TUid
}

export default class Lane {
  id = genId()
  rate: number
  centerLine: LaneLine
  uid: TUid

  constructor({ lineConf, rate, uid }: IOps) {
    this.uid = uid
    this.rate = rate
    this.centerLine = new LaneLine({ conf: lineConf, rate, uid })
  }

  getPosByMeter(meter: number) {
    return this.centerLine.getPosByMeter(meter)
  }
  paintInfo() {
    const c = new Container()

    const g = new Graphics()

    g.beginFill(0x0000ff)

    const width = 20
    g.drawRect(0, 0, width, width)
    g.endFill()

    const text = new Text(`${this.id}`, {
      fill: 0xffffff,
      fontSize: 16
    })

    c.addChild(g)
    c.addChild(text)

    const l = this.centerLine

    const pos = l.getPosByMeter(l.posList[1].meter / 4)

    c.x = pos.x - width / 2
    c.y = pos.y - width / 2

    c.zIndex = Z_INDEX_MAP.lane
    return c
  }
}
