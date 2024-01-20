import Lane from '../Lane'
import {IDataItem} from './types'

let _uid = 0

const genId = () => {
  _uid++

  return _uid
}

// 每秒跑的距离 按 [20km - 60 km/h]
const minSpeed = 5.56
const maxSpeed = 16.67

const range = maxSpeed - minSpeed

const getPerSDistance = () => {
  return Math.floor(range * Math.random() + minSpeed)
}

interface IOps {
  laneList: Lane[]
  time?: number
}




export default class Mock {
  laneList: Lane[] = []
  laneMap = new Map<Lane['id'], Lane>()
  clock: any
  time:number
  dataList: IDataItem[] = []
  cbList: Function[] = []

  constructor({ laneList, time = 1000 }: IOps) {
    this.time = time
    this.laneList = laneList
    this.laneMap = new Map(laneList.map(l => [l.id, l]))

    this.autoRun()
  }
  on (cb: Function) {
    this.cbList.push(cb)
  }
  runCb(list: IDataItem[]) {
    this.cbList.forEach(cb => cb(list))
  }
  autoRun () {
    this.clock = setInterval(() => {
        this.updateDataItems()

        const item = this.createDataItem()
        this.dataList.push(item)

        this.runCb(this.dataList)
    }, this.time)
  }
  destroy (){
     clearInterval(this.clock)
  }
  getRandLane () {
    const len = this.laneList.length
    const index = Math.floor( Math.random() * len)

    return this.laneList[index]
  }
  createDataItem (): IDataItem {
    return {
        id: genId(),
        meter: 0,
        laneNo: this.getRandLane()?.id || 0,
        leave: false
    }
  }

  updateDataItems () {
    this.dataList = this.dataList.filter(data => !data.leave)

    this.dataList.forEach(data => {
        const distance = getPerSDistance()

        const lane = this.laneMap.get(data.laneNo)

        const res = distance + data.meter

        if (lane && res >= lane?.centerLine.totalMeter){
            data.leave = true
            data.meter = lane.centerLine.totalMeter
        } else{
            data.meter = res
        }
    })
  }
}
