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

export const DOUBLE_PI = Math.PI * 2
export const PI = Math.PI
export const HALF_PI = PI / 2

export function ensureAngleInRange(a: number) {
  a = a % DOUBLE_PI

  if (a < 0) {
    a += DOUBLE_PI
  }

  return a
}

export function calculateCircleProperties(a: IPos, b: IPos, c: IPos, d: IPos) {
  // 计算直线l1斜率
  const dy1 = b.y - a.y
  const dx1 = b.x - a.x
  const dy2 = d.y - c.y
  const dx2 = d.x - c.x
  const k1 = dy1 / dx1

  const k2 = dy2 / dx2

  const res = {
    cx: 0,
    cy: 0,
    r: 0,
    deg: 0,
    start: 0,
    end: 0
  }

  if (k1 === k2) {
    // 异常情况
    console.error('两线平行')
    return res
  } else if (k1 === 0 && [Infinity, -Infinity].includes(k2)) {
    res.cx = b.x
    res.cy = c.y
  } else if (k2 === 0 && [Infinity, -Infinity].includes(k1)) {
    res.cx = c.x
    res.cy = b.y
  } else if (k1 === 0) {
    const k22 = -1 / k2

    // l22  y = a * x +b
    const l22_b = c.y - k22 * c.x
    res.cx = b.x
    res.cy = k22 * res.cx + l22_b
  } else if (k2 === 0) {
    // 垂线
    const k11 = -1 / k1
    // l11  y = a * x +b
    const l11_b = b.y - k11 * b.x
    res.cx = c.x
    res.cy = k11 * res.cx + l11_b
  } else {
    // 垂线
    const k11 = -1 / k1
    const k22 = -1 / k2

    // l11  y = a * x +b
    const l11_b = b.y - k11 * b.x
    const l22_b = c.y - k22 * c.x

    const { x, y } = findIntersectionPoint(k11, l11_b, k22, l22_b)
    res.cx = x
    res.cy = y
  }

  const { cx, cy } = res

  // 计算圆的半径
  res.r = Math.sqrt((cx - b.x) ** 2 + (cy - b.y) ** 2)

  // 计算开始和结束的弧度
  res.start = getAngle(b.y - cy, b.x - cx)
  res.end = getAngle(c.y - cy, c.x - cx)

  if (Math.abs(res.start - res.end) > PI) {
    const cb = Math.atan2(c.y - b.y, c.x - b.x)
    if (cb > 0) {
      res.end = DOUBLE_PI - res.end
    } else {
      res.start = DOUBLE_PI - res.start
    }
  }

  // 计算圆心角（弧度）
  const theta = Math.abs(
    Math.atan2(b.y - cy, b.x - cx) - Math.atan2(c.y - cy, c.x - cx)
  )

  res.deg = theta

  return res
}

function findIntersectionPoint(k1: number, b: number, k2: number, d: number) {
  const x = (d - b) / (k1 - k2)
  const y = k1 * x + b

  return { x, y }
}

export function getAngle(dy: number, dx: number) {
  let angle = 0

  if (dx === 0) {
    angle = dy > 0 ? PI / 2 : PI * 1.5
  } else if (dy === 0) {
    angle = dx > 0 ? 0 : PI
  } else {
    angle = Math.atan2(dy, dx)
  }

  return angle
}

function crossProduct(point1: IPos, point2: IPos) {
  return point1.x * point2.y - point1.y * point2.x
}

function onSegment(p: IPos, q: IPos, r: IPos) {
  return (
    q.x <= Math.max(p.x, r.x) &&
    q.x >= Math.min(p.x, r.x) &&
    q.y <= Math.max(p.y, r.y) &&
    q.y >= Math.min(p.y, r.y)
  )
}

function orientation(p: IPos, q: IPos, r: IPos) {
  const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y)
  if (val === 0) return 0 // 共线
  return val > 0 ? 1 : 2 // 顺时针或逆时针
}

export function doIntersect(A: IPos, B: IPos, C: IPos, D: IPos) {
  const o1 = orientation(A, B, C)
  const o2 = orientation(A, B, D)
  const o3 = orientation(C, D, A)
  const o4 = orientation(C, D, B)

  if (o1 !== o2 && o3 !== o4) {
    return true // 线段相交
  }

  if (o1 === 0 && onSegment(A, C, B)) return true // ABC 共线
  if (o2 === 0 && onSegment(A, D, B)) return true // ABD 共线
  if (o3 === 0 && onSegment(C, A, D)) return true // CAD 共线
  if (o4 === 0 && onSegment(C, B, D)) return true // CBD 共线

  return false
}
