import React, { useEffect, useRef, useState } from 'react'
import Stage from './2d/Stage'
import Road from './2d/Road'
import Mock from './2d/utils/Mock'
import { ILaneLineConf } from './2d/utils/types'

const getPxNum = (str: string) => {
  const reg = /(\d+(\.\d+)?)px/

  const matchs = str.match(reg)

  if (!matchs) return 0

  return Number(matchs[1])
}

const WORLD_WIDTH = 10000
const WORLD_HEIGHT = 10000

const imageSize = {
  width: 2000,
  height: 2000
}

// 车道数量
const LANE_COUNT = 3
// 车道宽度 现实生活中 单位 米
const LANE_WIDTH = 3.75
// 像素宽度 单位 px 设计图上的
const LANE_PX_WIDTH = 114

const RATE = LANE_PX_WIDTH / LANE_WIDTH

const Track: React.FC = () => {
  const canvasDomRef = useRef<HTMLCanvasElement | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const canvas = canvasDomRef.current

    if (!canvas) return

    const parent = canvas.parentElement

    if (!parent) return

    // 样式更准确  即使是缩放之后
    const styles = window.getComputedStyle(parent)

    const { width: widthStr, height: heightStr } = styles

    const width = getPxNum(widthStr)
    const height = getPxNum(heightStr)

    const xScale = width / imageSize.width
    const yScale = height / imageSize.height

    const scale = Math.min(xScale, yScale)

    const getScalePos = (num: number) => Math.floor(scale * num)

    const screenWidth = getScalePos(imageSize.width)
    const screenHeight = getScalePos(imageSize.height)

    const stage = new Stage({
      worldWidth: WORLD_WIDTH,
      worldHeight: WORLD_HEIGHT,
      screenWidth: screenWidth,
      screenHeight: screenHeight,
      view: canvas
    })

    const laneConfList: ILaneLineConf[][] = [
      // 车道1
      [
        {
          x: 1072,
          y: 2000,
          uid: '1-1'
        },
        {
          uid: '1-2',
          x: 1072,
          y: 1605,
          circle: {
            // 编号形式 车道序号-第几个点

            linkId: '7-3'
          }
        },
        {
          uid: '1-3',
          x: 1072,
          y: 396,
          changeLane: {
            lanes: [2]
          }
        },
        {
          uid: '1-4',
          x: 1072,
          y: 0
        }
      ],
      // 车道2
      [
        {
          uid: '2-1',
          x: 1198,
          y: 2000
        },
        {
          uid: '2-2',
          x: 1198,
          y: 1605,
          circle: {
            // 编号形式 车道序号-第几个点

            linkId: '6-3'
          }
        },
        {
          uid: '2-3',
          x: 1198,
          y: 393,
          changeLane: {
            lanes: [1]
          }
        },
        {
          uid: '2-4',
          x: 1198,
          y: 0
        }
      ],
      //  车道3
      [
        {
          uid: '3-1',
          x: 926,
          y: 0
        },
        {
          uid: '3-2',
          x: 926,
          y: 396,
          circle: {
            // 编号形式 车道序号-第几个点

            linkId: '5-3'
          }
        },
        {
          uid: '3-3',
          x: 926,
          y: 1605,
          changeLane: {
            lanes: [4]
          }
        },
        {
          uid: '3-4',
          x: 926,
          y: 2000
        }
      ],
      // 车道4
      [
        {
          uid: '4-1',
          x: 800,
          y: 0
        },
        {
          uid: '4-2',
          x: 800,
          y: 396,
          circle: {
            // 编号形式 车道序号-第几个点

            linkId: '8-3'
          }
        },
        {
          uid: '4-3',
          x: 800,
          y: 1605,
          changeLane: {
            lanes: [3]
          }
        },
        {
          uid: '4-4',
          x: 800,
          y: 2000
        }
      ],
      // 车道5
      [
        {
          uid: '5-1',
          x: 0,
          y: 1075
        },
        {
          uid: '5-2',
          x: 395,
          y: 1075,
          circle: {
            // 编号形式 车道序号-第几个点

            linkId: '1-3'
          }
        },
        {
          uid: '5-3',
          x: 1604,
          y: 1075
          ,
          changeLane: {
            lanes: [6]
          }
        },
        {
          uid: '5-4',
          x: 2000,
          y: 1075
        }
      ],
      // 车道6
      [
        {
          uid: '6-1',
          x: 0,
          y: 1201
        },
        {
          uid: '6-2',
          x: 395,
          y: 1201,
          circle: {
            // 编号形式 车道序号-第几个点

            linkId: '4-3'
          }
        },
        {
          uid: '6-3',
          x: 1604,
          y: 1201
          ,
          changeLane: {
            lanes: [5]
          }
        },
        {
          uid: '6-4',
          x: 2000,
          y: 1201
        }
      ],
      // 车道7
      [
        {
          uid: '7-1',
          x: 2000,
          y: 923
        },
        {
          uid: '7-2',
          x: 1604,
          y: 923,
          circle: {
            // 编号形式 车道序号-第几个点

            linkId: '3-3'
          }
        },
        {
          uid: '7-3',
          x: 395,
          y: 923
          ,
          changeLane: {
            lanes: [8]
          }
        },
        {
          uid: '7-4',
          x: 0,
          y: 923
        }
      ],
      // 车道8
      [
        {
          uid: '8-1',
          x: 2000,
          y: 798
        },
        {
          // 编号形式 车道序号-第几个点
          uid: '8-2',
          x: 1604,
          y: 798,
          circle: {
            // 编号形式 车道序号-第几个点

            linkId: '2-3'
          }
        },
        {
          uid: '8-3',
          x: 395,
          y: 798
          ,
          changeLane: {
            lanes: [7]
          }
        },
        {
          uid: '8-4',
          x: 0,
          y: 798
        }
      ]
    ]

    laneConfList.forEach((arr) =>
      arr.forEach((v) => {
        v.x = getScalePos(v.x)
        v.y = getScalePos(v.y)
      })
    )

    const road = new Road({
      ct: stage.mountCt,
      laneCount: LANE_COUNT,
      laneWidth: LANE_WIDTH,
      rate: RATE * scale,
      laneConfList
    })

    stage.addTicker(road.consume.bind(road))

    const mock = new Mock({
      laneList: [...road.laneMap.values()]
    })

    mock.on((data: any) => {
      road.createAndUpdate(data)
    })

    setTimeout(() => {
      setIsLoaded(true)
    }, 100)

    return () => {
      stage.destroy()
    }
  }, [])

  return (
    <div
      id='test'
      style={{
        height: '100vh',
        width: '100%',
        padding: 'auto'
      }}
    >
      <canvas
        style={{
          outline: isLoaded ? '1px solid blue' : 'none'
        }}
        ref={canvasDomRef}
      ></canvas>
    </div>
  )
}

export default Track
