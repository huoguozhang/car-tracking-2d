class DebugHelper {
  isDebug = false
  constructor() {
    const searchs = new URLSearchParams(window.location.search)
    const debugValue = searchs.get('debug')

    this.isDebug = !!debugValue
  }
}

const debuggerHelper = new DebugHelper()
export default debuggerHelper
