import './style.css'
import { World } from './HeightfieldWaterSimulation'

const canvasWrapper = document.querySelector<HTMLDivElement>('#canvas')!
new World(canvasWrapper)

const btnSave = document.querySelector<HTMLButtonElement>('#frameshot')!
btnSave.addEventListener('click', () => {

    const link = document.createElement('a')
    link.download = 'HeightfieldWaterSimulation.png'
    const canvas = canvasWrapper.querySelector<HTMLCanvasElement>('canvas')!
    link.href = canvas.toDataURL('image/png')
    link.click()
})
