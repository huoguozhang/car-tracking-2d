import React, { useEffect, useRef, useState } from 'react'
import Stage from './2d/Stage'
import Road from './2d/Road'
import Mock from './2d/utils/Mock'

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

    console.log({ width, height })
    try {
      const stage = new Stage({
        worldWidth: WORLD_WIDTH,
        worldHeight: WORLD_HEIGHT,
        screenWidth: screenWidth,
        screenHeight: screenHeight,
        view: canvas
      })

      const laneConfList = [
        // 车道1
        [
          {
            x: 1072,
            y: 2000
          },
          {
            x: 1072,
            y: 1605
          },
          {
            x: 1072,
            y: 396
          },
          {
            x: 1072,
            y: 0
          }
        ],
        // 车道2
        [
          {
            x: 1198,
            y: 2000
          },
          {
            x: 1198,
            y: 1605
          },
          {
            x: 1198,
            y: 393
          },
          {
            x: 1198,
            y: 0
          }
        ],
        //  车道3
        [
          {
            x: 926,
            y: 0
          },
          {
            x: 926,
            y: 396
          },
          {
            x: 926,
            y: 1605
          },
          {
            x: 926,
            y: 2000
          }
        ],
        // 车道4
        [
          {
            x: 800,
            y: 0
          },
          {
            x: 800,
            y: 396
          },
          {
            x: 800,
            y: 1605
          },
          {
            x: 800,
            y: 2000
          }
        ],
        // 车道5
        [
          {
            x: 0,
            y: 1075
          },
          {
            x: 495,
            y: 1075
          },
          {
            x: 1065,
            y: 1075
          },
          {
            x: 2000,
            y: 1075
          }
        ],
        // 车道6
        [
          {
            x: 0,
            y: 1201
          },
          {
            x: 495,
            y: 1201
          },
          {
            x: 1065,
            y: 1201
          },
          {
            x: 2000,
            y: 1201
          }
        ],
        // 车道7
        [
          {
            x: 2000,
            y: 923
          },
          {
            x: 1065,
            y: 923
          },
          {
            x: 495,
            y: 923
          },
          {
            x: 0,
            y: 923
          }
        ],
        // 车道8
        [
          {
            x: 2000,
            y: 798
          },
          {
            x: 1065,
            y: 798
          },
          {
            x: 495,
            y: 798
          },
          {
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

      const mock = new Mock({
        laneList: [...road.laneMap.values()]
      })

      mock.on((data:any) => {
        console.log(data)
      })

      setTimeout(() => {
        setIsLoaded(true)
      }, 100)

      return () => {
        stage.destroy()
      }
    } catch (error) {
      console.log(error)
    }
  }, [])

  return (
    <div
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
