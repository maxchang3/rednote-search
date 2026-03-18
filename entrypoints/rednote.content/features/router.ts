import type { ContentScriptContext } from 'wxt/utils/content-script-context'

type RouteListener = (path: string) => void

const listeners = new Set<RouteListener>()

export const getCurrentPath = () => {
  return location.pathname
}

export const onRouteChange = (cb: RouteListener) => {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

export const initRouter = (ctx: ContentScriptContext) => {
  let currentPath = ''

  const emit = (nextPath: string) => {
    if (nextPath === currentPath) return

    currentPath = nextPath
    listeners.forEach((cb) => {
      cb(nextPath)
    })
  }

  emit(getCurrentPath())
  // https://wxt.dev/guide/essentials/content-scripts.html#dealing-with-spas
  ctx.addEventListener(window, 'wxt:locationchange', (event) => {
    emit(event.newUrl.pathname)
  })
}
