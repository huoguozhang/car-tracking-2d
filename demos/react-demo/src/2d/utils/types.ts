import { Sprite, Text, Container, Graphics } from 'pixi.js'

export interface IPos {
  x: number
  y: number
}

export interface IState extends IPos {
  radian: number
}

export interface IEventHandler {
  bindFn: Function
  unbindFn: Function
}

export type TMountChild = Sprite | Text | Container | Graphics

export interface ILaneLineConf extends IPos {
  curve?: {
    start: IPos
    y: IPos
  }
}

export interface ILinePos extends IPos {
   // 像素长度
   pxLen: number
   // 和起点的距离 长度 百分比
   // 在不同大小的屏幕小 一秒跑的距离应该一样 所以需要使用实际的米 和百分比
   rel: number
   // 实际上表示 道路的里程
   meter: number
}


export interface IDataItem {
    meter: number
    laneNo: number
    id: number
    leave: boolean
}
export type TLaneNo = number