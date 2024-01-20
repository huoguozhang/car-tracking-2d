import { Application, Container, Graphics, Sprite } from 'pixi.js'
import { IEventHandler, TMountChild } from './utils/types'
import { Z_INDEX_MAP } from './utils/const'

interface IOps {
  view: HTMLCanvasElement
  worldWidth: number
  worldHeight: number
  screenWidth: number
  screenHeight: number

}

export default class Stage {
  worldWidth: number
  worldHeight: number
  screenWidth: number
  screenHeight: number
  app: Application
  private screenCt: Container
  private worldCt: Container
  private ct: Container
  private view: IOps['view']
  private eventCbs: IEventHandler[] = []

  constructor({
    worldWidth,
    worldHeight,
    screenWidth,
    screenHeight,
    view
  }: IOps) {
    this.worldWidth = worldWidth
    this.worldHeight = worldHeight
    this.screenWidth = screenWidth
    this.screenHeight = screenHeight
    this.view = view

    this.worldCt = new Container()

    // 子对象排序 （按照z-index）
    this.worldCt.sortableChildren = true
    this.worldCt.zIndex = Z_INDEX_MAP.world

    this.screenCt = new Container()
    this.screenCt.sortableChildren = true

    this.screenCt.addChild(this.worldCt)

    this.app = new Application({
      view,
      antialias: true,
      width: screenWidth,
      height: screenHeight
    })

    this.ct = this.app.stage

    this.ct.addChild(this.screenCt)

    this.initScreen()
    this.initWorld()

    this.initEvents()
  }

  get mountCt () {
    return this.ct
  }

  initScreen() {
    const g = new Graphics()
    // g.lineStyle(2, 0xfeeb77, 1)
    g.beginFill(0x650a5a)

    g.drawRect(0, 0, this.screenWidth, this.screenHeight)
    g.endFill()

    g.zIndex = Z_INDEX_MAP.screen

    this.screenCt.addChild(g)

    const s = Sprite.from('/bg.png')

    s.width = this.screenWidth
    s.height = this.screenHeight

    this.screenCt.addChild(s)

    s.zIndex = Z_INDEX_MAP.car

    const car = Sprite.from('/car.svg')

    car.zIndex = Z_INDEX_MAP.car +1

    car.anchor.set(0.5,0.5)

    car.rotation = Math.PI / 2

    car.y = 320

    car.width = 50
    car.height = 80

    car.x = 100

    this.screenCt.addChild(car)
  }


  initWorld() {
    const g = new Graphics()
    // g.lineStyle(2, 0x, 1)
    g.beginFill(0x8d7662)

    g.drawRect(0, 0, this.worldWidth, this.worldHeight)
    g.endFill()

    this.mount(g)
  }

  initEvents() {
    const contextmenuHandler = (event: any) => {
      event.preventDefault()
    }
    this.eventCbs = [
      {
        bindFn: () => {
          this.view.addEventListener('contextmenu', contextmenuHandler)
        },
        unbindFn: () => {
          this.view.removeEventListener('contextmenu', contextmenuHandler)
        }
      }
    ]

    this.eventCbs.forEach(({ bindFn }) => bindFn())
  }

  mount(child: TMountChild) {
    this.worldCt.addChild(child)
  }
  unmount(child: TMountChild) {
    this.worldCt.removeChild(child)
  }

  destroy() {
    this.app.stage.destroy()
    // this.app.destroy()


    this.eventCbs.forEach(({ unbindFn }) => unbindFn())
  }
  
  exportMount (cb: Function) {
     cb(this.mount.bind(this))
  }
}
