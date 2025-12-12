import './style.css'
import { World } from './SSAO'

declare global {
    interface Window {
        world: World
    }
}

const canvasWrapper = document.querySelector<HTMLDivElement>('#canvas')!
window.world = new World(canvasWrapper)

const btnSave = document.querySelector<HTMLButtonElement>('#frameshot')!
btnSave.addEventListener('click', () => {

    const link = document.createElement('a')
    link.download = 'SSAO.png'
    const canvas = canvasWrapper.querySelector<HTMLCanvasElement>('canvas')!
    link.href = canvas.toDataURL('image/png')
    link.click()
})


