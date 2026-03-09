type RouteListener = (path: string) => void

const listeners = new Set<RouteListener>()

export function onRouteChange(cb: RouteListener) {
  listeners.add(cb)
}

export function initRouter() {
  const emit = () =>
    listeners.forEach((cb) => {
      cb(location.pathname)
    })

  emit()

  const wrap = (original: History['pushState']) =>
    function (this: History, ...args: Parameters<typeof original>) {
      const ret = original.apply(this, args)
      emit()
      return ret
    }

  history.pushState = wrap(history.pushState)
  history.replaceState = wrap(history.replaceState)
  window.addEventListener('popstate', emit)
}
