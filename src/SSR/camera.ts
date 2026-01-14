import * as THREE from 'three'
import Access from './access.ts'

export default class {
    proxy: unknown
    constructor () {
        Access.camera = new THREE.PerspectiveCamera(75)
        this.initCamera()
    }

    initCamera() {
        // Access.camera!.position.set(.0, 1., 10.)
        Access.camera!.position.set(
            3.8213544494756775, 3.335408017118153, 5.569024609532682)
        Access.camera!.lookAt(.0, .0, 0)
    }

    dispose() {
        if (Access.camera) {
            Access.camera = undefined
        }
    }

    getCamera() {
        return Access.camera
    }
}
