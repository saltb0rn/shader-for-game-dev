import './style.css'
import { World } from './RenderToTexture'

const canvasWrapper = document.querySelector<HTMLDivElement>('#canvas')!
new World(canvasWrapper)

const btnSave = document.querySelector<HTMLButtonElement>('#frameshot')!
btnSave.addEventListener('click', () => {

    const link = document.createElement('a')
    link.download = 'RenderToTexture.png'
    const canvas = canvasWrapper.querySelector<HTMLCanvasElement>('canvas')!
    link.href = canvas.toDataURL('image/png')
    link.click()
})
