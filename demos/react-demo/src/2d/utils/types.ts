import { Sprite, Text, Container, Graphics } from 'pixi.js'

export interface IPos {
  x: number
  y: number
}

export type TUid = number

export interface IState extends IPos {
  rotation: number
  // 在弯道
  inCurve?: boolean
  // 出弯道
}

export interface IEventHandler {
  bindFn: Function
  unbindFn: Function
}

export type TMountChild = Sprite | Text | Container | Graphics

export interface ICircleInfo {
  id: string
  linkId: string
}

export interface ICurveInfo {
  cx: number
  cy: number
  r: number
  // 夹角
  deg: number
  // 圆弧开始的夹角
  start: number
  // 结束时夹角
  end: number
}
export interface ILaneLineConf extends IPos {
  // 左右转弯 关联点的id 配置
  circle?: ICircleInfo
  // 我们计算出来的曲线信息
  curve?: ICurveInfo
}

export interface ILinePos extends IPos {
  // 像素长度
  pxLen: number
  // 和起点的距离 长度 百分比
  // 在不同大小的屏幕小 一秒跑的距离应该一样 所以需要使用实际的米 和百分比
  rel: number
  // 实际上表示 道路的里程
  meter: number
  curve?: ICurveInfo
}

export interface IDataItem {
  meter: number
  laneNo: number
  id: number
  leave: boolean
}
export type TLaneNo = number
