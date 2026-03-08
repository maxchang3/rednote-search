import './style.css'
import icon from '@/assets/icon.svg'
import { setupCounter } from '@/components/counter'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <img src="${icon}" class="logo vanilla" alt="logo" />
    <h1>WXT + TypeScript</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <p class="read-the-docs">
      Click on the WXT and TypeScript logos to learn more
    </p>
  </div>
`

setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)
