import Lane from '../Lane'
import { type IDataItem } from './types'

let _uid = 0

const genId = () => {
  _uid++

  return _uid
}

// 每秒跑的距离
const minSpeed = 5
const maxSpeed = 10

const range = maxSpeed - minSpeed

const getPerSDistance = () => {
  return Number((range * Math.random() + minSpeed).toFixed(2))
}

interface IOps {
  laneList: Lane[]
  time?: number
}

class DataItem  {
  data: IDataItem
   constructor(ops: IDataItem){
     this.data = {...ops}
   }
   pause(){
    this.data.paused = true
   }
   unPause(){
    this.data.paused = false
   }
   getData () {
    return this.data
   }
}

export default class Mock {
  laneList: Lane[] = []
  laneMap = new Map<Lane['id'], Lane>()
  clock: any
  time: number
  dataList: IDataItem[] = []
  cbList: Function[] = []
  // 可能变道的概率是多少
  maybeChangeLane = 0.1
  private _createLaneIndex = 0

  constructor({ laneList, time = 1000 }: IOps) {
    this.time = time
    this.laneList = laneList
    this.laneMap = new Map(laneList.map((l) => [l.id, l]))

    this.autoRun()
  }
  on(cb: Function) {
    this.cbList.push(cb)
  }
  runCb(list: IDataItem[]) {
    this.cbList.forEach((cb) => cb(list))
  }
  autoRun() {
    this.clock = setInterval(() => {
      this.updateDataItems()

      // 控制汽车的数量 不要太密集
      if (Math.random() > 0.5){
        const item = this.createDataItem()
        this.dataList.push(item)
      }

      this.runCb(this.dataList)
    }, this.time)
  }
  destroy() {
    clearInterval(this.clock)
  }
  getRandLane() {
    const index = this._createLaneIndex

    this._createLaneIndex++

    if (this._createLaneIndex === this.laneList.length) {
      this._createLaneIndex = 0
    }

    return this.laneList[index]
  }
  createDataItem(): IDataItem {
    return {
      id: genId(),
      meter: 0,
      laneNo: this.getRandLane()?.id || 0,
      leave: false,
      paused: false
    }
  }

  updateDataItems() {
    this.dataList = this.dataList
      .filter((data) => !data.leave)

    this.dataList.forEach((data) => {
      // 暂停了就跳过 防止碰撞
      if (data.paused) {
        data.paused = false
        return
      }
      const distance = getPerSDistance()

      let lane = this.laneMap.get(data.laneNo)

      const changeLane = lane?.centerLine.canChangeLane(data.meter)

      if (changeLane) {
        const len = changeLane.length
        const index = Math.floor(Math.random() * len)

        const newLane = this.laneMap.get(changeLane[index])

        if (newLane) {
          lane = newLane
        }
      }

      const res = distance + data.meter

      if (lane && res >= lane?.centerLine.totalMeter) {
        data.leave = true
        data.meter = lane.centerLine.totalMeter
      } else {
        data.meter = res
      }
    })
  }
  doChangeLane() {
    return Math.random() < this.maybeChangeLane
  }
}
