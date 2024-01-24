import { Container } from 'pixi.js'
import {
  ICircleInfo,
  IDataItem,
  ILaneLineConf,
  IPos,
  TLaneNo,
  TMountChild
} from './utils/types'

import Car, { CAR_IMAGE_WIDTH, CAR_IMAGE_HEIGHT } from './Car'
import debuggerHelper from './utils/debuggerHelper'
import { calculateCircleProperties, doIntersect } from './utils/helper'
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
    const circleInfoList: (ICircleInfo & { uid: string })[] = []

    laneConfList.forEach((list, index) => {
      const [laneUid] = list[0]?.uid.split('-')

      const lane = new Lane({
        lineConf: list,
        rate: this.rate,
        uid: laneUid
      })

      list.forEach((v) => {
        if (v.circle) {
          circleInfoList.push({ ...v.circle, uid: v.uid })
        }
      })

      // 方便开发观察 绘制车道线 ---begin----
      // this.mount(lane.centerLine.paint())

      // 绘制车道id

      if (debuggerHelper.isDebug) {
        this.mount(lane.paintInfo())
      }

      this.laneMap.set(lane.id, lane)
    })

    try {
      const getIndexs = (s: string) => {
        const [s1, s2] = s.split('-')

        return [Number(s1) - 1, Number(s2) - 1]
      }

      // 构建弯道 车道
      circleInfoList.forEach((cInfo) => {
        const { uid, linkId } = cInfo
        let [laneIndex0, posIndex0] = getIndexs(uid)
        let [laneIndex1, posIndex1] = getIndexs(linkId)

        const lane0 = laneConfList[laneIndex0]
        const lane1 = laneConfList[laneIndex1]

        const a = { ...lane0[posIndex0 - 1] }
        const b = { ...lane0[posIndex0] }
        const c = { ...lane1[posIndex1] }
        const d = { ...lane1[posIndex1 + 1] }

        const curveInfo = calculateCircleProperties(a, b, c, d)

        b.curve = curveInfo

        const lane = new Lane({
          lineConf: [a, b, c, d],
          rate: this.rate,
          // 组合的uid
          uid: `${a.uid}&${c.uid}`
        })

        lane.centerLine.curInfo = {
          ...b.circle,
          ...b.curve,
          laneId: lane.id
        }

        // 方便开发观察 绘制车道线 ---begin----
        // this.mount(lane.centerLine.paint())

        this.laneMap.set(lane.id, lane)
      })

      console.log(...this.laneMap.values())
    } catch (e) {
      console.log('构建弯道失败', e)
    }
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
    // 已经存在的线段
    const lineList: IPos[][] = []

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
        // 碰撞检测
        const linePos: IPos[] = [
          { x: car.x, y: car.y },
          {
            x: posState.x,
            y: posState.y
          }
        ]

        if (
          lineList.some((line) =>
            doIntersect(linePos[0], linePos[1], line[0], line[1])
          )
        ) {
          // 会碰上
          data.paused = true
          return
        }

        lineList.push(linePos)

        car.changeRotationIfNeed(posState.rotation, !!posState.inCurve)
        car.readyMove(posState)

        // debug 文本
        if (debuggerHelper.isDebug) {
          car.updateText(
            [
              `${meter.toFixed(2)}m`,
              `id:${id}`,
              `lane:${laneNo}`,
              `pos:[${posState.x},${posState.y}]`,
              `rotation:${posState.rotation}`
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
        car.consume.call(car, deltaMs)
      }
    }
  }
}
