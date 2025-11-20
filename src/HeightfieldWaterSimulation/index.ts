import Access from './access.ts'
import Scene from './scene.ts'
import Renderer from './renderer.ts'
import Camera from './camera.ts'
import PostProc from './postProc.ts'

export class World {
    scene: Scene
    renderer: Renderer
    camera: Camera
    postProc: PostProc
    constructor(output: HTMLElement) {
        Access.outputContainer = output
        this.camera = new Camera()
        this.scene = new Scene()
        this.renderer = new Renderer()
        this.postProc = new PostProc()
    }

    dispose() {
        this.renderer.dispose()
        this.scene.dispose()
        this.postProc.dispose()
        this.camera.dispose()
    }
}
