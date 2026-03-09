import './style.css'
import icon from '@/assets/icon.svg'
import { setupCounter } from '@/components/counter'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <img src="${icon}" class="logo vanilla" alt="logo" />
    <h1>小红搜</h1>
  </div>
`

setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)
