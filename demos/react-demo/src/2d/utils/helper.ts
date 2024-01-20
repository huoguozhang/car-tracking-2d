import { IPos } from './types'

// 获取 (start) 经过平移 垂线距离 (offset) 后的坐标 newStart
export function getOffsetPos(start: IPos, end: IPos, offset: number): IPos {
  // y = ax + b
  const dx = end.x - start.x
  const dy = end.y - start.y

  if (dx === 0) {
    return { x: start.x + offset, y: start.y }
  } else if (dy === 0) {
    return {
      x: start.x,
      y: start.y + offset
    }
  } else {
    // 计算线段 l1 的长度
    const len = Math.sqrt(dx ** 2 + dy ** 2)

    // 计算垂直于 l1 的单位向量
    const unitX = dx / len
    const unitY = dy / len

    // 计算垂线的起点
    const px = start.x + offset * unitY
    const py = start.y - offset * unitX

    return { x: px, y: py }
  }
}

// 获取两点距离

export function getDistanceByTwoPoint(start: IPos, end: IPos) {
  return Math.floor(Math.sqrt((start.x - end.x) ** 2 + (start.y - end.y) ** 2))
}
