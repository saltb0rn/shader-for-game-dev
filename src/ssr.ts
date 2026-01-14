import './style.css'
import { World } from './SSR'

declare global {
    interface Window {
        world: any
    }
}

const canvasWrapper = document.querySelector<HTMLDivElement>('#canvas')!
window.world = new World(canvasWrapper)

const btnSave = document.querySelector<HTMLButtonElement>('#frameshot')!
btnSave.addEventListener('click', () => {

    const link = document.createElement('a')
    link.download = 'SSR.png'
    const canvas = canvasWrapper.querySelector<HTMLCanvasElement>('canvas')!
    link.href = canvas.toDataURL('image/png')
    link.click()
})
