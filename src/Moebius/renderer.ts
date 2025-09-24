import * as THREE from 'three'
import Access from './access.ts'
import { OrbitControls } from 'three/examples/jsm/Addons.js'

export default class {

    constructor() {
        Access.clock = new THREE.Clock()
        Access.renderer = new THREE.WebGLRenderer({ antialias: true })
        Access.renderer.setClearColor(0x000000)
        Access.renderer.shadowMap.enabled = true
        Access.outputContainer!.appendChild(Access.renderer.domElement)
        Access.cameraCtl = new OrbitControls(Access.camera!, Access.renderer.domElement)
        this.initAnimationLoop()

    }

    protected initAnimationLoop() {
        Access.renderer!.setAnimationLoop((timeStamp) => {
            const isResized = this.respondToRendererSize()
            const events = Access.getEvents()
            events.forEach(callback => {
                Access.trigger(callback, [timeStamp, Access.clock?.getDelta(), isResized])
            })
            if (Access.postProcesser) {
                Access.postProcesser!.render()
            } else {
                Access.renderer!.render(Access.scene!, Access.camera!)
            }
            Access.cameraCtl?.update()
        })
    }

    protected respondToRendererSize(): boolean {
        const pixelRatio = Math.min(window.devicePixelRatio, 1)
        const width = Math.floor(Access.outputContainer!.clientWidth * pixelRatio)
        const height = Math.floor(Access.outputContainer!.clientHeight * pixelRatio)
        const canvas = Access.renderer!.domElement
        let isResized = false
        if (width != canvas.width || height != canvas.height) {
            Access.camera!.aspect = width / height
            Access.camera!.updateProjectionMatrix()
            Access.renderer!.setSize(width, height, false)
            isResized = true
        }
        return isResized
    }

    dispose() {
        if (!Access.renderer) return
        Access.renderer.renderLists.dispose()
        Access.renderer.dispose()
        Access.renderer = undefined
    }
}
