import './style.css'
import { World } from './RenderToTexture'
// import { World } from './Outlining'

const canvasWrapper = document.querySelector<HTMLDivElement>('#canvas')!
new World(canvasWrapper)

const btnSave = document.querySelector<HTMLButtonElement>('#frameshot')!
btnSave.addEventListener('click', () => {

    const link = document.createElement('a')
    link.download = 'Outline.png'
    const canvas = canvasWrapper.querySelector<HTMLCanvasElement>('canvas')!
    console.log(canvas)
    link.href = canvas.toDataURL('image/png')
    link.click()
})
