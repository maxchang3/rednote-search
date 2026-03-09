import { onRouteChange } from '../router'

const toggleHideFeed = (force?: boolean) => {
  document.documentElement.classList.toggle('raase', force)
}

onRouteChange((path) => {
  toggleHideFeed(path === '/explore')
})
