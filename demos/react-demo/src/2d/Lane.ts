import LaneLine from './LaneLine'
import {ILaneLineConf} from './utils/types'
// 车道
let _id = 0

const genId = () => {
    _id++
    return _id
}

interface IOps {
  lineConf: ILaneLineConf[]
  rate: number
}

export default class Lane {
  id = genId()
  rate:number
  centerLine: LaneLine

  constructor ({lineConf, rate}: IOps) {
    this.rate = rate
    this.centerLine = new LaneLine({conf: lineConf, rate})
  }
}